import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import type {
  ConversationRecord,
  DataStore,
  DocumentChunk,
  DocumentRecord,
  MessageRecord,
} from "./types";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

const defaultStore: DataStore = {
  documents: [],
  chunks: [],
  conversations: [],
  messages: [],
  libraryDocs: [],
  pages: {},
  highlights: [],
  flashcards: [],
  quizQuestions: [],
  collections: [],
};

let cache: DataStore | null = null;

async function ensureDataDir() {
  // Best-effort: serverless/readonly filesystems (e.g. Vercel) may reject this.
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    /* ignore — falls back to in-memory cache */
  }
}

async function loadStore(): Promise<DataStore> {
  if (cache) return cache;
  await ensureDataDir();
  try {
    const raw = await fs.readFile(STORE_FILE, "utf-8");
    // Merge with defaults so older/partial store files (missing fields
    // like libraryDocs or collections) don't break consumers.
    cache = { ...defaultStore, ...(JSON.parse(raw) as Partial<DataStore>) };
  } catch {
    cache = { ...defaultStore };
    // saveStore is non-fatal on read-only filesystems.
    await saveStore();
  }
  return cache!;
}

export async function saveStore() {
  if (!cache) return;
  try {
    await ensureDataDir();
    await fs.writeFile(STORE_FILE, JSON.stringify(cache, null, 2), "utf-8");
  } catch (err) {
    // Read-only or ephemeral filesystem (serverless deploys): keep the
    // in-memory cache so the app still works, just without persistence.
    if (process.env.NODE_ENV !== "production") {
      console.warn("[store] unable to persist store.json:", (err as Error).message);
    }
  }
}

export async function getStore(): Promise<DataStore> {
  return loadStore();
}

export async function listDocuments(): Promise<DocumentRecord[]> {
  const store = await loadStore();
  return store.documents.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function addDocument(
  title: string,
  fileType: DocumentRecord["fileType"],
  sizeBytes: number,
  textChunks: string[]
): Promise<{ document: DocumentRecord; chunks: DocumentChunk[] }> {
  const store = await loadStore();
  const id = uuidv4();
  const document: DocumentRecord = {
    id,
    title,
    fileType,
    chunkCount: textChunks.length,
    sizeBytes,
    indexed: true,
    createdAt: new Date().toISOString(),
  };

  const chunks: DocumentChunk[] = textChunks.map((content, index) => ({
    id: uuidv4(),
    documentId: id,
    documentTitle: title,
    content,
    index,
    page: Math.floor(index / 3) + 1,
  }));

  store.documents.push(document);
  store.chunks.push(...chunks);
  await saveStore();

  return { document, chunks };
}

export async function getConversation(
  id: string
): Promise<ConversationRecord | null> {
  const store = await loadStore();
  return store.conversations.find((c) => c.id === id) ?? null;
}

export async function getConversationMessages(
  conversationId: string
): Promise<MessageRecord[]> {
  const store = await loadStore();
  return store.messages
    .filter((m) => m.conversationId === conversationId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
}

export async function createConversation(
  title: string,
  documentIds: string[] = []
): Promise<ConversationRecord> {
  const store = await loadStore();
  const conversation: ConversationRecord = {
    id: uuidv4(),
    title,
    notebookTitle: "Untitled notebook",
    documentIds,
    location: "Local",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.conversations.push(conversation);
  await saveStore();
  return conversation;
}

export async function updateConversationDocuments(
  id: string,
  documentIds: string[]
): Promise<ConversationRecord | null> {
  const store = await loadStore();
  const conv = store.conversations.find((c) => c.id === id);
  if (!conv) return null;
  conv.documentIds = documentIds;
  conv.updatedAt = new Date().toISOString();
  await saveStore();
  return conv;
}

export async function getConversationByShareId(
  shareId: string
): Promise<ConversationRecord | null> {
  const store = await loadStore();
  return (
    store.conversations.find((c) => c.shareId === shareId) ?? null
  );
}

// ─── Room-scoped highlights & chat (Study Room over a conversation) ────

export async function getRoomHighlights(
  roomId: string,
  userId?: string
): Promise<import("../types").Highlight[]> {
  const store = await loadStore();
  const conv = store.conversations.find((c) => c.id === roomId);
  if (!conv) return [];
  const docIds = new Set(conv.documentIds);
  const highlights = store.highlights.filter((h: any) => docIds.has(h.docId));
  if (userId) {
    return highlights.filter((h: any) => !h.userId || h.userId === userId);
  }
  return highlights;
}

export async function getRoomChatMessages(
  roomId: string,
  userId?: string
): Promise<import("../types").ChatMessage[]> {
  const store = await loadStore();
  const raw = store.pages["__roomchat__"]?.[roomId]
    ? JSON.parse(store.pages["__roomchat__"][roomId] as any)
    : [];
  if (userId) return raw.filter((m: any) => !m.userId || m.userId === userId);
  return raw;
}

export async function addRoomChatMessage(
  roomId: string,
  role: "user" | "assistant",
  content: string,
  citedPage: number | undefined,
  citedDocId: string | undefined,
  userId?: string
): Promise<import("../types").ChatMessage> {
  const store = await loadStore();
  if (!store.pages["__roomchat__"]) store.pages["__roomchat__"] = {};
  if (!store.pages["__roomchat__"][roomId])
    store.pages["__roomchat__"][roomId] = "[]";

  const messages: any[] = JSON.parse(store.pages["__roomchat__"][roomId] as any);
  const newMessage: import("../types").ChatMessage & {
    citedDocId?: string;
    userId?: string;
  } = {
    id: `rmsg-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    role,
    content,
    citedPage,
    citedDocId,
    userId,
  };
  messages.push(newMessage);
  store.pages["__roomchat__"][roomId] = JSON.stringify(messages);
  await saveStore();
  return newMessage;
}

export async function clearRoomChatHistory(
  roomId: string,
  userId?: string
): Promise<void> {
  const store = await loadStore();
  if (!store.pages["__roomchat__"]) store.pages["__roomchat__"] = {};
  if (userId) {
    const msgs: any[] = store.pages["__roomchat__"][roomId]
      ? JSON.parse(store.pages["__roomchat__"][roomId] as any)
      : [];
    store.pages["__roomchat__"][roomId] = JSON.stringify(
      msgs.filter((m: any) => m.userId && m.userId !== userId)
    );
  } else {
    store.pages["__roomchat__"][roomId] = "[]";
  }
  await saveStore();
}

export async function addMessage(
  message: Omit<MessageRecord, "id" | "createdAt">
): Promise<MessageRecord> {
  const store = await loadStore();
  const record: MessageRecord = {
    ...message,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  store.messages.push(record);

  const conv = store.conversations.find(
    (c) => c.id === message.conversationId
  );
  if (conv) {
    conv.updatedAt = record.createdAt;
  }

  await saveStore();
  return record;
}

export async function getAllChunks(): Promise<DocumentChunk[]> {
  const store = await loadStore();
  return store.chunks;
}

export async function getRecentChunks(limit = 5): Promise<DocumentChunk[]> {
  const store = await loadStore();
  return store.chunks.slice(-limit).reverse();
}

// ─── Library Document CRUD (legacy Document schema) ───────────────────

export async function getDocuments(userId?: string): Promise<import("../types").Document[]> {
  const store = await loadStore();
  if (userId) return store.libraryDocs.filter((d: any) => d.userId === userId);
  return store.libraryDocs;
}

export async function getDocumentById(
  id: string,
  userId?: string
): Promise<import("../types").Document | undefined> {
  const store = await loadStore();
  const doc = store.libraryDocs.find((d: any) => d.id === id);
  if (!doc) return undefined;
  if (userId && (doc as any).userId && (doc as any).userId !== userId) return undefined;
  return doc;
}

export async function addLibraryDocument(
  title: string,
  pageCount: number,
  type: "pdf" | "audio" | "video",
  userId?: string
): Promise<import("../types").Document> {
  const store = await loadStore();
  const id =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || `doc-${Date.now()}`;
  const exists = store.libraryDocs.some((d: any) => d.id === id);
  const finalId = exists ? `${id}-${Date.now().toString().slice(-4)}` : id;

  const newDoc: import("../types").Document & { userId?: string } = {
    id: finalId,
    title,
    pageCount,
    status: "new",
    progress: 0,
    lastOpenedAt: new Date().toISOString(),
    type,
    userId,
  };

  store.libraryDocs.unshift(newDoc);
  await saveStore();
  return newDoc;
}

export async function updateDocumentProgress(
  id: string,
  progress: number,
  status: "new" | "in_progress" | "mastered",
  userId?: string
): Promise<import("../types").Document | undefined> {
  const store = await loadStore();
  const doc = store.libraryDocs.find(
    (d: any) => d.id === id && (!userId || !d.userId || d.userId === userId)
  ) as (import("../types").Document & { userId?: string }) | undefined;
  if (doc) {
    doc.progress = progress;
    doc.status = status;
    doc.lastOpenedAt = new Date().toISOString();
    await saveStore();
  }
  return doc;
}

export async function deleteLibraryDocument(
  id: string,
  userId?: string
): Promise<boolean> {
  const store = await loadStore();
  const initialLen = store.libraryDocs.length;
  store.libraryDocs = store.libraryDocs.filter(
    (d: any) => d.id !== id && (!userId || !d.userId || d.userId === userId)
  );
  delete store.pages[id];
  // Cascade delete related data
  store.highlights = store.highlights.filter((h: any) => h.docId !== id);
  store.flashcards = store.flashcards.filter((f: any) => f.docId !== id);
  store.quizQuestions = store.quizQuestions.filter((q: any) => q.docId !== id);
  await saveStore();
  return store.libraryDocs.length < initialLen;
}

export async function getDocumentPages(id: string): Promise<string[]> {
  const store = await loadStore();
  return store.pages[id] || [];
}

export async function setDocumentPages(
  id: string,
  pages: string[]
): Promise<void> {
  const store = await loadStore();
  store.pages[id] = pages;
  await saveStore();
}

// ─── Collections ───────────────────────────────────────────────────────

export async function getCollections(
  userId?: string
): Promise<import("../types").Collection[]> {
  const store = await loadStore();
  return store.collections.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export async function createCollection(
  name: string,
  userId?: string
): Promise<import("../types").Collection> {
  const store = await loadStore();
  const collection: import("../types").Collection & { userId?: string } = {
    id: `col-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    createdAt: new Date().toISOString(),
    userId,
  };
  store.collections.push(collection);
  await saveStore();
  return collection;
}

export async function renameCollection(
  id: string,
  name: string
): Promise<import("../types").Collection | undefined> {
  const store = await loadStore();
  const collection = store.collections.find((c: any) => c.id === id);
  if (collection) {
    collection.name = name.trim();
    await saveStore();
  }
  return collection;
}

export async function deleteCollection(
  id: string
): Promise<boolean> {
  const store = await loadStore();
  const initialLen = store.collections.length;
  store.collections = store.collections.filter((c: any) => c.id !== id);
  // Unassign documents from the deleted collection
  store.libraryDocs.forEach((d: any) => {
    if (d.collectionId === id) d.collectionId = null;
  });
  await saveStore();
  return store.collections.length < initialLen;
}

export async function updateDocumentCollection(
  docId: string,
  collectionId: string | null
): Promise<import("../types").Document | undefined> {
  const store = await loadStore();
  const doc = store.libraryDocs.find((d: any) => d.id === docId);
  if (doc) {
    doc.collectionId = collectionId;
    await saveStore();
  }
  return doc;
}

/**
 * Batched collection assignment. Mutates all matching docs in the loaded store
 * and persists with a single `saveStore()` call so the update is atomic for
 * this JSON store (no partial writes on failure). Returns the number updated.
 */
export async function bulkUpdateDocumentCollection(
  ids: string[],
  collectionId: string | null
): Promise<number> {
  if (!ids.length) return 0;
  const store = await loadStore();
  const idSet = new Set(ids);
  let count = 0;
  store.libraryDocs.forEach((d: any) => {
    if (idSet.has(d.id)) {
      d.collectionId = collectionId;
      count++;
    }
  });
  if (count > 0) await saveStore();
  return count;
}

export async function renameLibraryDocument(
  id: string,
  title: string
): Promise<import("../types").Document | undefined> {
  const store = await loadStore();
  const doc = store.libraryDocs.find((d: any) => d.id === id);
  if (doc) {
    doc.title = title.trim();
    await saveStore();
  }
  return doc;
}

// ─── Highlights ────────────────────────────────────────────────────────

export async function getHighlights(
  docId: string,
  userId?: string
): Promise<import("../types").Highlight[]> {
  const store = await loadStore();
  const highlights = store.highlights.filter((h: any) => h.docId === docId);
  if (userId) return highlights.filter((h: any) => !h.userId || h.userId === userId);
  return highlights;
}

export async function addHighlight(
  docId: string,
  page: number,
  text: string,
  note: string | undefined,
  userId?: string
): Promise<import("../types").Highlight> {
  const store = await loadStore();
  const newHighlight: import("../types").Highlight & { userId?: string } = {
    id: `h-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    docId,
    page,
    text,
    note,
    userId,
  };
  store.highlights.push(newHighlight);
  await saveStore();
  return newHighlight;
}

export async function deleteHighlight(
  id: string,
  userId?: string
): Promise<boolean> {
  const store = await loadStore();
  const initialLen = store.highlights.length;
  store.highlights = store.highlights.filter(
    (h: any) => h.id !== id && (!userId || !h.userId || h.userId === userId)
  );
  await saveStore();
  return store.highlights.length < initialLen;
}

// ─── Chat Messages ─────────────────────────────────────────────────────

export async function getChatMessages(
  docId: string,
  userId?: string
): Promise<import("../types").ChatMessage[]> {
  const store = await loadStore();
  const msgs = store.pages["__chat__"]?.[docId]
    ? JSON.parse(store.pages["__chat__"][docId] as any)
    : [];
  if (userId) return msgs.filter((m: any) => !m.userId || m.userId === userId);
  return msgs;
}

export async function addChatMessage(
  docId: string,
  role: "user" | "assistant",
  content: string,
  citedPage: number | undefined,
  userId?: string
): Promise<import("../types").ChatMessage> {
  const store = await loadStore();
  if (!store.pages["__chat__"]) store.pages["__chat__"] = {};
  if (!store.pages["__chat__"][docId]) store.pages["__chat__"][docId] = "[]";

  const messages: any[] = JSON.parse(store.pages["__chat__"][docId] as any);
  const newMessage: import("../types").ChatMessage & { userId?: string } = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    role,
    content,
    citedPage,
    userId,
  };
  messages.push(newMessage);
  store.pages["__chat__"][docId] = JSON.stringify(messages);
  await saveStore();
  return newMessage;
}

export async function clearChatHistory(
  docId: string,
  userId?: string
): Promise<void> {
  const store = await loadStore();
  if (!store.pages["__chat__"]) store.pages["__chat__"] = {};
  if (userId) {
    // Only clear messages belonging to this user
    const msgs: any[] = store.pages["__chat__"][docId]
      ? JSON.parse(store.pages["__chat__"][docId] as any)
      : [];
    store.pages["__chat__"][docId] = JSON.stringify(
      msgs.filter((m: any) => m.userId && m.userId !== userId)
    );
  } else {
    store.pages["__chat__"][docId] = "[]";
  }
  await saveStore();
}

// ─── Flashcards & Quizzes ──────────────────────────────────────────────

export async function getFlashcards(
  docId: string,
  userId?: string
): Promise<import("../types").Flashcard[]> {
  const store = await loadStore();
  const cards = store.flashcards.filter((f: any) => f.docId === docId);
  if (userId) return cards.filter((f: any) => !f.userId || f.userId === userId);
  return cards;
}

export async function getQuizQuestions(
  docId: string,
  userId?: string
): Promise<import("../types").QuizQuestion[]> {
  const store = await loadStore();
  const questions = store.quizQuestions.filter((q: any) => q.docId === docId);
  if (userId)
    return questions.filter((q: any) => !q.userId || q.userId === userId);
  return questions;
}

// ─── Demo Seed Data ────────────────────────────────────────────────────

export async function seedDemoLibraryIfNeeded(): Promise<void> {
  const store = await loadStore();
  if (store.libraryDocs.length > 0) return;

  const DEMO_DOCUMENTS: import("../types").Document[] = [
    {
      id: "clean-code",
      title: "The Art of Writing Clean Code",
      pageCount: 5,
      status: "in_progress",
      progress: 40,
      lastOpenedAt: "2026-07-06T15:30:00Z",
      type: "pdf",
    },
    {
      id: "quantum-computing",
      title: "Introduction to Quantum Computing",
      pageCount: 3,
      status: "new",
      progress: 0,
      lastOpenedAt: null,
      type: "pdf",
    },
    {
      id: "deep-learning",
      title: "Deep Learning Handbook",
      pageCount: 3,
      status: "mastered",
      progress: 100,
      lastOpenedAt: "2026-07-05T10:00:00Z",
      type: "pdf",
    },
  ];

  const DEMO_PAGES: Record<string, string[]> = {
    "clean-code": [
      "The Art of Writing Clean Code\nChapter 1: Clean Code Philosophy\n\nWhat is clean code? Clean code is code that is easy to read, easy to understand, and easy to maintain. It is code that is written for humans first, and computers second. As Martin Fowler famously said, 'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.'\n\nWriting clean code requires craft, discipline, and a constant effort to refine your designs. When we look at code, we should see it as a story that reads naturally. If the flow of the code is disjointed, full of unexpected detours, or obscured by confusing terminology, we lose track of the narrative.",
      "Meaningful Names\n\nUse intention-revealing names. The name of a variable, function, or class should answer all the big questions. It should tell you why it exists, what it does, and how it is used. If a name requires a comment, then the name does not reveal its intent.\n\nFor example, instead of naming a variable 'int d;', name it 'int elapsedTimesInDays;'. Similarly, avoid using abbreviations that are hard to decipher. A class name should be a noun or noun phrase like 'Customer' or 'Account', while a function name should be a verb or verb phrase like 'postPayment' or 'deleteAccount'.",
      "Functions\n\nFunctions should be small. They should be smaller than you think. A function should do one thing. They should do it well. They should do it only. If a function does more than one thing, it becomes difficult to test, maintain, and reason about. The ideal function length is under 20 lines.\n\nKeep parameter lists short—ideally zero, one, or two arguments. Three arguments should be avoided if possible, and more than three requires very strong justification. When a function needs more than two or three arguments, it is likely that some of those arguments should be wrapped into their own class.",
      "Comments\n\nDo not comment bad code—rewrite it. Clear and expressive code with few comments is far superior to cluttered and complex code with lots of comments. The proper use of comments is to compensate for our failure to express ourself in code. Every time you write a comment, you should grimace and feel a failure of expression.\n\nComments lie. Not intentionally, but they do. Because code changes and evolves, but comments are rarely updated to match. A comment that was helpful six months ago can become a dangerous lie today. Truth can only be found in one place: the code itself.",
      "DRY Principle: Don't Repeat Yourself\n\nDuplication may be the root of all evil in software. Many patterns and principles have been created for the sole purpose of eliminating duplication. Every piece of knowledge must have a single, unambiguous, authoritative representation within a system.\n\nWhen we duplicate code, we double the cost of maintenance, testing, and debugging. If a bug is found in one instance of the code, it must be fixed in all other instances as well. By abstracting duplicated logic into a single reusable function or class, we create a single point of change, making our systems much more robust.",
    ],
    "quantum-computing": [
      "Introduction to Quantum Computing\nChapter 1: The Quantum Paradigm\n\nQuantum computing is a multidisciplinary field comprising aspects of computer science, physics, and mathematics that utilizes quantum mechanics to solve complex problems faster than on classical computers. Traditional computers run on classical bits, representing either a 0 or a 1. Quantum computers, however, use qubits.\n\nA qubit is the fundamental unit of quantum information. Because qubits operate under the laws of quantum mechanics, they can exist in states that classical bits cannot, enabling exponential speedups for specific classes of algorithms, such as integer factorization and molecular simulations.",
      "Superposition and Qubits\n\nSuperposition is the ability of a quantum system to be in multiple states at the same time until it is measured. While a classical bit can only be in state 0 or 1, a qubit can be in a linear combination of both states simultaneously.\n\nMathematically, the state of a qubit is represented as |psi> = alpha|0> + beta|1>, where alpha and beta are complex probability amplitudes. The square of these amplitudes represents the probability of measuring the qubit in state 0 or 1 respectively. This ability to represent multiple states at once allows quantum computers to process massive amounts of possibilities in parallel.",
      "Quantum Entanglement\n\nQuantum entanglement is a phenomenon where two or more particles become interconnected, such that the state of one particle instantly influences the state of the other, no matter how far apart they are. Einstein famously referred to this as 'spooky action at a distance'.\n\nIn quantum computing, entangled qubits share a unified quantum state. When you measure one qubit, the state of its entangled partner is determined immediately. This correlation allows quantum processors to share information rapidly and execute complex, coordinated computations that classical machines are incapable of performing.",
    ],
    "deep-learning": [
      "Deep Learning Handbook\nChapter 1: Foundations of Deep Learning\n\nDeep learning is a subset of machine learning, which is in turn a subset of artificial intelligence. It is based on artificial neural networks with multiple layers (hence the term 'deep') that learn representations of data with multiple levels of abstraction.\n\nHistorically inspired by the biological structure of the human brain, deep learning algorithms excel at processing unstructured data, such as images, text, audio, and video. Through layered representations, a deep neural network can automatically extract features from raw data without manual engineering.",
      "Artificial Neural Networks\n\nAn artificial neural network consists of interconnected nodes called neurons, organized into an input layer, one or more hidden layers, and an output layer. Each neuron receives inputs, applies a weighted sum, adds a bias, and passes the result through an activation function to generate an output.\n\nCommon activation functions include ReLU (Rectified Linear Unit), Sigmoid, and Tanh. The weights and biases of the network represent its knowledge. By adjusting these values, the network learns to map inputs to desired outputs (e.g., classifying a photo of a dog or translating a sentence).",
      "Backpropagation and Optimization\n\nBackpropagation is the core algorithm used to train neural networks. It works by computing the gradient of a loss function (which measures the error between the network's prediction and the actual target) with respect to each weight in the network, starting from the output layer and working backward.\n\nThese gradients are then used by an optimization algorithm, such as Gradient Descent or Adam, to update the weights in a direction that minimizes the error. Over thousands or millions of iterations (epochs), the network gradually refines its weights, leading to high accuracy on the training tasks.",
    ],
  };

  const DEMO_HIGHLIGHTS: import("../types").Highlight[] = [
    {
      id: "h1",
      docId: "clean-code",
      page: 3,
      text: "Functions should be small. They should be smaller than you think. A function should do one thing. They should do it well. They should do it only.",
      note: "This is the single responsibility principle.",
    },
    {
      id: "h2",
      docId: "clean-code",
      page: 5,
      text: "Duplication may be the root of all evil in software.",
      note: "DRY principle reminder!",
    },
  ];

  const DEMO_FLASHCARDS: import("../types").Flashcard[] = [
    {
      id: "fc1", docId: "clean-code",
      front: "What is the Single Responsibility Principle for functions?",
      back: "A function should do one thing, do it well, and do it only. If a function does more than one thing, it should be broken down into smaller functions.",
    },
    {
      id: "fc2", docId: "clean-code",
      front: "What is the DRY principle?",
      back: "Don't Repeat Yourself. Every piece of knowledge or logic must have a single, unambiguous, authoritative representation within a system to minimize maintenance costs.",
    },
    {
      id: "fc3", docId: "clean-code",
      front: "Why are comments sometimes considered a failure of expression?",
      back: "Because code should be self-documenting. Descriptive names and clear structures are preferred. Comments can lie over time if the code is updated but the comment is not.",
    },
    {
      id: "fc4", docId: "quantum-computing",
      front: "What is a Qubit?",
      back: "A qubit (quantum bit) is the basic unit of quantum information, capable of representing 0, 1, or a superposition of both simultaneously.",
    },
    {
      id: "fc5", docId: "quantum-computing",
      front: "What is Quantum Superposition?",
      back: "The quantum mechanical property that allows a qubit to exist in a linear combination of multiple states (both |0> and |1>) at the same time until it is measured.",
    },
    {
      id: "fc6", docId: "deep-learning",
      front: "What makes a neural network 'deep'?",
      back: "A neural network is considered 'deep' when it contains multiple hidden layers between the input and output layers, allowing it to learn hierarchical representations of data.",
    },
  ];

  const DEMO_QUIZZES: import("../types").QuizQuestion[] = [
    {
      id: "q1", docId: "clean-code",
      question: "Which of the following is NOT a benefit of small functions?",
      options: [
        "They are easier to read and understand",
        "They make execution faster in interpreted languages",
        "They are easier to test in isolation",
        "They promote reuse across the codebase",
      ],
      correctIndex: 1,
    },
    {
      id: "q2", docId: "clean-code",
      question: "What does Martin Fowler say about writing code for humans?",
      options: [
        "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
        "Comments are the best way to write code for humans.",
        "Code should be written for machines first, then humans.",
        "Code written for humans is slower to run.",
      ],
      correctIndex: 0,
    },
    {
      id: "q3", docId: "clean-code",
      question: "Why should we avoid code duplication according to the DRY principle?",
      options: [
        "It makes source files larger and takes up disk space",
        "It violates licensing agreements",
        "It doubles the cost of maintenance and creates multiple places where bugs must be fixed",
        "It confuses compilers and runtimes",
      ],
      correctIndex: 2,
    },
    {
      id: "q4", docId: "quantum-computing",
      question: "How does a qubit state differ from a classical bit state?",
      options: [
        "A qubit is always 0, whereas a bit can be 0 or 1",
        "A qubit can exist in a superposition of both 0 and 1 states simultaneously",
        "A qubit can only represent integer numbers",
        "A qubit does not have any physical representation",
      ],
      correctIndex: 1,
    },
    {
      id: "q5", docId: "deep-learning",
      question: "What algorithm is used to compute the gradients of the loss function in a neural network?",
      options: [
        "Gradient Descent",
        "Backpropagation",
        "Linear Regression",
        "Supervised Clustering",
      ],
      correctIndex: 1,
    },
  ];

  store.libraryDocs.push(...DEMO_DOCUMENTS);
  Object.assign(store.pages, DEMO_PAGES);
  store.highlights.push(...DEMO_HIGHLIGHTS);
  store.flashcards.push(...DEMO_FLASHCARDS);
  store.quizQuestions.push(...DEMO_QUIZZES);
  await saveStore();
}

export async function seedDemoConversationIfNeeded(): Promise<string> {
  const store = await loadStore();
  const existing = store.conversations.find((c) => c.id === "demo");
  if (existing) return existing.id;

  const now = new Date().toISOString();
  const conversation: ConversationRecord = {
    id: "demo",
    title: "Organic Chemistry — Final Prep",
    notebookTitle: "Untitled notebook",
    documentIds: [],
    location: "Cairo",
    createdAt: now,
    updatedAt: now,
  };

  const messages: MessageRecord[] = [
    {
      id: uuidv4(),
      conversationId: "demo",
      role: "user",
      type: "text",
      content: "What is the mechanism of SN2 reaction?",
      citations: null,
      createdAt: now,
    },
    {
      id: uuidv4(),
      conversationId: "demo",
      role: "assistant",
      type: "text",
      content:
        "The SN2 reaction is a concerted, bimolecular nucleophilic substitution. The nucleophile attacks the electrophilic carbon from the backside (opposite the leaving group), forming a new bond while the leaving group departs simultaneously. This backside attack explains the stereochemical outcome: inversion of configuration (Walden inversion).",
      citations: [
        {
          document_id: "seed-1",
          document_title: "Ch.5.pdf",
          chunk_content:
            "The nucleophile attacks from the backside, opposite the leaving group, resulting in inversion of stereochemistry at the carbon center.",
          similarity_score: 0.91,
          page: 12,
          chunk_index: 3,
        },
      ],
      createdAt: now,
    },
    {
      id: uuidv4(),
      conversationId: "demo",
      role: "assistant",
      type: "quiz",
      content:
        "Which substrate would react fastest in an SN2 reaction with NaCN in acetone?",
      citations: null,
      quizMeta: { questionIndex: 2, total: 8 },
      createdAt: now,
    },
    {
      id: uuidv4(),
      conversationId: "demo",
      role: "assistant",
      type: "feedback",
      content:
        "Correct! Primary alkyl halides react fastest in SN2 because they have minimal steric hindrance. The backside attack is unhindered, allowing the nucleophile to approach easily.",
      citations: [
        {
          document_id: "seed-1",
          document_title: "Ch.5.pdf",
          chunk_content:
            "Primary substrates undergo SN2 fastest due to minimal steric hindrance at the reaction center.",
          similarity_score: 0.87,
          page: 14,
          chunk_index: 2,
        },
      ],
      feedbackMeta: { correct: true },
      createdAt: now,
    },
  ];

  store.conversations.push(conversation);
  store.messages.push(...messages);

  if (store.documents.length === 0) {
    const seedDocs: DocumentRecord[] = [
      {
        id: "seed-1",
        title: "Organic Chemistry Ch.5.pdf",
        fileType: "pdf",
        chunkCount: 147,
        sizeBytes: 2400000,
        indexed: true,
        createdAt: now,
      },
      {
        id: "seed-2",
        title: "SN1 vs SN2 lecture notes.docx",
        fileType: "docx",
        chunkCount: 89,
        sizeBytes: 800000,
        indexed: true,
        createdAt: now,
      },
      {
        id: "seed-3",
        title: "Practice problems set 4.pdf",
        fileType: "pdf",
        chunkCount: 62,
        sizeBytes: 1100000,
        indexed: true,
        createdAt: now,
      },
    ];
    store.documents.push(...seedDocs);
  }

  await saveStore();
  return "demo";
}

export async function seedDemoRoomIfNeeded(): Promise<string> {
  const store = await loadStore();
  const existing = store.conversations.find((c) => c.id === "demo-room");
  if (existing) return existing.id;

  // A Study Room needs library documents; ensure the demo library exists first.
  if (store.libraryDocs.length === 0) {
    await seedDemoLibraryIfNeeded();
  }

  const now = new Date().toISOString();
  const room: ConversationRecord = {
    id: "demo-room",
    title: "My Study Room",
    notebookTitle: "Study Room Notebook",
    documentIds: ["clean-code", "quantum-computing", "deep-learning"],
    location: "Study Room",
    shareId: "share-demo",
    createdAt: now,
    updatedAt: now,
  };
  store.conversations.push(room);
  await saveStore();
  return "demo-room";
}
