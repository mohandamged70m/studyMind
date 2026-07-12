import type { WorkspaceSession } from "@/types/workspace";

export const demoSession: WorkspaceSession = {
  id: "demo",
  title: "Organic Chemistry — Final Prep",
  notebookTitle: "Untitled notebook",
  charCount: 12482,
  messageCount: 42,
  materialCount: 3,
  location: "Cairo",
  sources: [
    {
      id: "1",
      title: "Organic Chemistry Ch.5.pdf",
      fileType: "pdf",
      chunkCount: 147,
      sizeMb: 2.3,
      indexed: true,
      progress: 100,
      selected: true,
    },
    {
      id: "2",
      title: "SN1 vs SN2 lecture notes.docx",
      fileType: "docx",
      chunkCount: 89,
      sizeMb: 0.8,
      indexed: true,
      progress: 100,
    },
    {
      id: "3",
      title: "Practice problems set 4.pdf",
      fileType: "pdf",
      chunkCount: 62,
      sizeMb: 1.1,
      indexed: true,
      progress: 100,
    },
  ],
  recentChunks: [
    {
      id: "c1",
      documentTitle: "Ch.5.pdf",
      page: 12,
      excerpt: "p.12 — backside attack, 180° C–X bond...",
    },
    {
      id: "c2",
      documentTitle: "Ch.5.pdf",
      page: 14,
      excerpt: "p.14 — primary substrates favor SN2...",
    },
    {
      id: "c3",
      documentTitle: "lecture notes",
      page: 3,
      excerpt: "p.3 — SN1 carbocation stability...",
    },
  ],
  messages: [
    {
      id: "m2",
      role: "user",
      type: "text",
      content: "What is the mechanism of SN2 reaction?",
    },
    {
      id: "m1",
      role: "assistant",
      type: "text",
      content:
        "The SN2 reaction is a concerted, bimolecular nucleophilic substitution. The nucleophile attacks the electrophilic carbon from the backside (opposite the leaving group), forming a new bond while the leaving group departs simultaneously. This backside attack explains the stereochemical outcome: inversion of configuration (Walden inversion).",
      citations: [
        {
          documentTitle: "Ch.5.pdf",
          page: 12,
          chunkIndex: 3,
          excerpt:
            "The nucleophile attacks from the backside, opposite the leaving group, resulting in inversion of stereochemistry at the carbon center.",
        },
      ],
    },
    {
      id: "m3",
      role: "assistant",
      type: "quiz",
      content:
        "Which substrate would react fastest in an SN2 reaction with NaCN in acetone?",
      quizMeta: { questionIndex: 2, total: 8 },
    },
    {
      id: "m4",
      role: "assistant",
      type: "feedback",
      content:
        "Correct! Primary alkyl halides react fastest in SN2 because they have minimal steric hindrance. The backside attack is unhindered, allowing the nucleophile to approach easily.",
      feedbackMeta: { correct: true },
      citations: [
        {
          documentTitle: "Ch.5.pdf",
          page: 14,
          chunkIndex: 2,
          excerpt:
            "Primary substrates undergo SN2 fastest due to minimal steric hindrance at the reaction center.",
        },
      ],
    },
  ],
  topics: [
    { id: "t1", label: "SN1 Reactions", status: "completed" },
    { id: "t2", label: "SN2 Reactions", status: "active" },
    { id: "t3", label: "E1 Elimination", status: "pending" },
    { id: "t4", label: "E2 Elimination", status: "pending" },
    { id: "t5", label: "Carbocation Stability", status: "pending" },
    { id: "t6", label: "Stereochemistry", status: "pending" },
    { id: "t7", label: "Leaving Groups", status: "pending" },
  ],
  quizMaterials: [
    { id: "qm1", label: "Organic Chemistry Ch.5", checked: true },
    { id: "qm2", label: "SN1 vs SN2 lecture notes", checked: true },
    { id: "qm3", label: "Practice problems set 4", checked: false },
  ],
  quizLevel: "understand",
  quizProgress: { current: 4, total: 8, correct: 3, wrong: 1 },
  generateOptions: [
    { id: "g1", label: "Study Guide", icon: "guide" },
    { id: "g2", label: "Key Concepts", icon: "concepts" },
    { id: "g3", label: "FAQ / Q&A sheet", icon: "faq" },
    { id: "g4", label: "Summary Table", icon: "table" },
  ],
};
