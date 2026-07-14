import { getDocumentPages, getDocumentById } from "./data";

export async function embedDocument(docId: string, title: string, pages: string[]): Promise<void> {
  // Simulate API delay for document parsing, embedding creation, and indexing
  await new Promise((resolve) => setTimeout(resolve, 2500));
}

export async function queryDocument(
  docId: string,
  query: string
): Promise<{ answer: string; citedPage?: number }> {
  // Simulate short latency of vector database similarity search and LLM completion
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const pages = await getDocumentPages(docId);
  const doc = await getDocumentById(docId);
  if (!doc || pages.length === 0) {
    return {
      answer: "I couldn't find the referenced document. Please verify it is uploaded in the library.",
      citedPage: undefined
    };
  }

  const lowercaseQuery = query.toLowerCase();

  // 1. Check for specific matched keywords to return highly realistic contextual responses
  if (docId === "clean-code") {
    if (lowercaseQuery.includes("dry") || lowercaseQuery.includes("repeat")) {
      return {
        answer: "The DRY (Don't Repeat Yourself) principle states that every piece of knowledge must have a single, unambiguous, authoritative representation within a system. Duplicating code is highly discouraged because it doubles the cost of maintenance and testing. When a change is needed, a developer must find and fix all copies, which invites bugs. Abstracting common logic into a single place makes systems robust and easier to adapt.",
        citedPage: 5
      };
    }
    if (lowercaseQuery.includes("function") || lowercaseQuery.includes("small") || lowercaseQuery.includes("parameter")) {
      return {
        answer: "Functions in clean code should be small—ideally under 20 lines. They should do exactly one thing, do it well, and do it only. This makes code self-documenting and easier to test. Additionally, parameter lists should be kept as short as possible; zero or one arguments are preferred, two are fine, and three should be avoided unless strictly necessary. If a function needs more, you should group those parameters into their own object/class.",
        citedPage: 3
      };
    }
    if (lowercaseQuery.includes("name") || lowercaseQuery.includes("variable") || lowercaseQuery.includes("meaningful")) {
      return {
        answer: "Names should reveal their intention. A variable, function, or class name should tell you why it exists, what it does, and how it is used. If you need a comment to explain what a variable does, then the name is not expressive enough. For example, choose 'elapsedTimeInDays' instead of 'd', and name classes with nouns (e.g. 'Customer') and functions with verbs (e.g. 'postPayment').",
        citedPage: 2
      };
    }
    if (lowercaseQuery.includes("comment") || lowercaseQuery.includes("rewrite")) {
      return {
        answer: "The clean code approach is: 'Do not comment bad code—rewrite it.' Comments are often a compensatory mechanism for code that fails to express itself. While comments might seem helpful, code evolves but comments are rarely updated to match, leading to dangerous inaccuracies. Truth can only be found in the code itself. Write clear, expressive code first.",
        citedPage: 4
      };
    }
  }

  if (docId === "quantum-computing") {
    if (lowercaseQuery.includes("qubit") || lowercaseQuery.includes("bit")) {
      return {
        answer: "A qubit is the basic unit of quantum information, corresponding to a classical bit. However, unlike classical bits which can only represent a state of 0 or 1, qubits can exist in a linear combination of both states simultaneously. This ability to exist in multiple states at once forms the foundation of quantum processing power.",
        citedPage: 1
      };
    }
    if (lowercaseQuery.includes("superposition")) {
      return {
        answer: "Superposition is a core quantum mechanics property that enables a qubit to be in a linear combination of states |0> and |1> at the same time. The mathematical state is represented as |psi> = alpha|0> + beta|1>. When the system is measured, the superposition collapses, and it will resolve to either 0 or 1 based on the probability amplitudes squared. This allows parallel computational tracks.",
        citedPage: 2
      };
    }
    if (lowercaseQuery.includes("entanglement")) {
      return {
        answer: "Quantum entanglement is a phenomenon where qubits become interconnected, such that the state of one instantly determines the state of its partner, regardless of physical distance. In quantum computing, entangled qubits share a unified state, allowing processors to share information instantly and coordinate complex computations faster than classical systems.",
        citedPage: 3
      };
    }
  }

  if (docId === "deep-learning") {
    if (lowercaseQuery.includes("neural") || lowercaseQuery.includes("network") || lowercaseQuery.includes("neuron")) {
      return {
        answer: "Artificial Neural Networks (ANNs) are systems inspired by biological brains, composed of layers of nodes (neurons). Neurons receive inputs, calculate a weighted sum, add a bias, and pass it through an activation function (like ReLU or Sigmoid) to output a signal. The network consists of an input layer, hidden layers, and an output layer, which learn patterns by tuning weights and biases.",
        citedPage: 2
      };
    }
    if (lowercaseQuery.includes("backpropagation") || lowercaseQuery.includes("train") || lowercaseQuery.includes("loss")) {
      return {
        answer: "Backpropagation is the primary algorithm used to train neural networks. It calculates the gradients of a loss function (which measures prediction error) with respect to all weights in the network, working backward from the output layer to the inputs. These gradients tell the optimizer (like Adam or SGD) how to adjust the weights to minimize future errors.",
        citedPage: 3
      };
    }
    if (lowercaseQuery.includes("deep") || lowercaseQuery.includes("layer")) {
      return {
        answer: "Deep learning refers to training artificial neural networks with multiple hidden layers ('deep' structures). These layers learn representations of data with increasing abstraction. For example, in image recognition, early layers might detect edges, middle layers detect shapes, and deep layers recognize complex objects like faces or cars.",
        citedPage: 1
      };
    }
  }

  // 2. Dynamic Keyword Search Fallback:
  // Split query into terms, and count occurrences on each page
  const terms = lowercaseQuery.split(/\s+/).filter(t => t.length >= 2);
  let bestPageIdx = 0;
  let maxScore = 0;

  pages.forEach((pageText, idx) => {
    let score = 0;
    const pageLower = pageText.toLowerCase();
    terms.forEach((term) => {
      const regex = new RegExp(term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
      const matches = pageLower.match(regex);
      if (matches) {
        score += matches.length;
      }
    });
    if (score > maxScore) {
      maxScore = score;
      bestPageIdx = idx;
    }
  });

  const citedPage = bestPageIdx + 1; // 1-indexed

  return {
    answer: `Based on your question about "${query}", here is what I found in the document:

The retrieved sections on page ${citedPage} suggest that the document discusses relevant concepts in this context. Specifically, it details that components are structured to support active studying and learning. 

If there is a particular topic or phrase you'd like to dive into, you can highlight it in the PDF viewer to add notes, or test your comprehension in the Review room.`,
    citedPage: maxScore > 0 ? citedPage : 1
  };
}

export async function queryDocuments(
  docIds: string[],
  query: string
): Promise<{ answer: string; citedPage?: number; citedDocId?: string }> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const lowercaseQuery = query.toLowerCase();
  const STOPWORDS = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "to", "of", "in",
    "on", "and", "or", "that", "this", "these", "those", "what", "which",
    "who", "how", "why", "for", "with", "as", "at", "by", "it", "its",
  ]);
  const terms = lowercaseQuery
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t));

  let best = { score: 0, page: 1, docId: docIds[0] ?? "" };

  for (const docId of docIds) {
    const pages = await getDocumentPages(docId);
    pages.forEach((pageText, idx) => {
      let score = 0;
      const pageLower = pageText.toLowerCase();
      terms.forEach((term) => {
        const regex = new RegExp(term.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), "g");
        const matches = pageLower.match(regex);
        if (matches) score += matches.length;
      });
      if (score > best.score) {
        best = { score, page: idx + 1, docId };
      }
    });
  }

  if (best.score === 0 || !best.docId) {
    return {
      answer: `I searched across ${docIds.length} document(s) in this study room but didn't find a strong match for "${query}". Try rephrasing, or highlight a passage in the reader to ask about it directly.`,
      citedPage: 1,
      citedDocId: docIds[0],
    };
  }

  const doc = await getDocumentById(best.docId);
  const docTitle = doc?.title ?? "the study materials";

  return {
    answer: `Based on your question about "${query}", here is what I found in ${docTitle}:

The most relevant passage is on page ${best.page}. It covers concepts that directly address your question. You can open that document and jump to the cited page to read the full context. If you'd like, I can also generate flashcards or a quiz from this material to test your understanding.`,
    citedPage: best.page,
    citedDocId: best.docId,
  };
}
