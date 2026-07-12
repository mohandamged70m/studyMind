# API Reference — StudyMind

All routes are Next.js 14 Route Handlers under `app/api/`.

---

## Conventions

### Authentication

Every route checks the Clerk session as the **first** operation. Requests without a valid session are rejected immediately.

```ts
import { auth } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ... rest of handler
}
```

### Response Shape

```ts
// Success
{ "data": T }

// Error
{ "error": "Human-readable error message" }
```

### Standard HTTP Status Codes

| Code | Meaning |
|---|---|
| `200` | Success |
| `201` | Created |
| `400` | Bad request — invalid input |
| `401` | Unauthorized — no valid session |
| `403` | Forbidden — resource belongs to another user |
| `404` | Not found |
| `413` | File too large (> 10MB) |
| `415` | Unsupported file type |
| `500` | Internal server error |

### Input Validation

All request bodies are validated with Zod before any processing. Invalid input returns `400` with a descriptive error message.

---

## Documents

### `POST /api/documents/upload`

Upload a file, extract text, chunk it, embed it, and store everything.

**Request:** `multipart/form-data`

| Field | Type | Required | Notes |
|---|---|---|---|
| `file` | File | ✅ | PDF, TXT, MD, or DOCX. Max 10MB. |
| `title` | string | ✅ | Display name for the document |

**Processing pipeline:**
1. Validate MIME type + file size
2. Save raw file to Supabase Storage at `{user_id}/{doc_id}/{filename}`
3. Extract text (`pdf-parse` for PDF, `mammoth` for DOCX, direct read for TXT/MD)
4. Chunk text via `lib/rag/chunker.ts` (~500 tokens, 50-token overlap)
5. Embed each chunk via `text-embedding-004`
6. Batch insert chunks into `document_chunks`
7. Insert document record into `documents`

**Response `201`:**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Lecture 3 - Cell Biology",
    "file_type": "pdf",
    "chunk_count": 42,
    "size_bytes": 1048576,
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

**Errors:** `400` invalid file type · `413` file too large · `500` processing failed

---

### `GET /api/documents`

List all documents for the authenticated user.

**Query params:** none

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Lecture 3 - Cell Biology",
      "file_type": "pdf",
      "chunk_count": 42,
      "size_bytes": 1048576,
      "created_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

---

### `DELETE /api/documents/[id]`

Delete a document and all its chunks. Also deletes the raw file from Storage.

**Response `200`:**
```json
{
  "data": { "deleted": true }
}
```

**Errors:** `404` document not found · `403` document belongs to another user

---

## Conversations (Q&A Mode)

### `POST /api/conversations`

Create a new conversation, optionally scoped to specific documents.

**Request body:**
```json
{
  "title": "Study session — Cell Biology",
  "document_ids": ["uuid-1", "uuid-2"]
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | ❌ | Defaults to `"New Conversation"` |
| `document_ids` | string[] | ❌ | Empty array = search across all user documents |

**Response `201`:**
```json
{
  "data": {
    "id": "uuid",
    "title": "Study session — Cell Biology",
    "document_ids": ["uuid-1", "uuid-2"],
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

---

### `GET /api/conversations`

List all conversations for the authenticated user, newest first.

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Study session — Cell Biology",
      "document_ids": ["uuid-1"],
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T11:00:00Z",
      "message_count": 12
    }
  ]
}
```

---

### `GET /api/conversations/[id]`

Get a single conversation with its full message history.

**Response `200`:**
```json
{
  "data": {
    "id": "uuid",
    "title": "Study session — Cell Biology",
    "document_ids": ["uuid-1"],
    "messages": [
      {
        "id": "uuid",
        "role": "user",
        "content": "What is the role of mitochondria?",
        "citations": null,
        "created_at": "2025-01-15T10:31:00Z"
      },
      {
        "id": "uuid",
        "role": "assistant",
        "content": "The mitochondria is the powerhouse of the cell...",
        "citations": [
          {
            "document_id": "uuid-1",
            "document_title": "Lecture 3 - Cell Biology",
            "chunk_content": "Mitochondria generate ATP through...",
            "similarity_score": 0.91
          }
        ],
        "created_at": "2025-01-15T10:31:05Z"
      }
    ]
  }
}
```

**Errors:** `404` conversation not found · `403` belongs to another user

---

### `POST /api/conversations/[id]/messages`

Send a user message. The response is a **stream** of the assistant's reply.

**Request body:**
```json
{
  "content": "What is the role of mitochondria?"
}
```

**Processing pipeline:**
1. Validate auth + conversation ownership
2. Save user message to `messages`
3. Embed user message via `text-embedding-004`
4. Retrieve top 5 relevant chunks via `match_documents` RPC (threshold: 0.7)
5. Build prompt: system + retrieved context + last 10 messages + user query
6. Stream Gemini response via Ilm provider
7. Save completed assistant message + citations to `messages`

**Response:** `text/plain` stream (chunked transfer encoding)

The client reads the stream token by token. After the stream closes, the full message (with citations) is available via `GET /api/conversations/[id]`.

**Errors:** `404` conversation not found · `400` empty content · `500` LLM error

---

## Resources (Resource Finder Mode)

### `POST /api/resources`

Search across the user's documents and return the most relevant sections for a given query.

**Request body:**
```json
{
  "query": "how does photosynthesis work",
  "document_ids": ["uuid-1", "uuid-2"]
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `query` | string | ✅ | The search query |
| `document_ids` | string[] | ❌ | Scope search. Empty = all user documents |

**Processing pipeline:**
1. Embed query via `text-embedding-004`
2. Retrieve top 10 chunks via `match_documents` (threshold: 0.6)
3. Group chunks by source document
4. Score each document by aggregate similarity
5. Return ranked documents with top excerpts

**Response `200`:**
```json
{
  "data": {
    "results": [
      {
        "document_id": "uuid-1",
        "document_title": "Bio Lecture 5",
        "relevance_score": 0.89,
        "excerpts": [
          {
            "chunk_id": "uuid",
            "content": "Light-dependent reactions occur in the thylakoid...",
            "similarity_score": 0.91
          },
          {
            "chunk_id": "uuid",
            "content": "The Calvin cycle converts CO2 into glucose...",
            "similarity_score": 0.87
          }
        ]
      }
    ]
  }
}
```

---

## Study Plans

### `POST /api/planner`

Generate a structured study plan grounded in the user's documents and save it.

**Request body:**
```json
{
  "topic": "Cell Biology for midterms",
  "duration_days": 7,
  "document_ids": ["uuid-1", "uuid-2"]
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `topic` | string | ✅ | What to study |
| `duration_days` | number | ✅ | 1–30 |
| `document_ids` | string[] | ❌ | Empty = all user documents |

**Processing pipeline:**
1. Embed topic via `text-embedding-004`
2. Retrieve top 15 chunks via `match_documents` (threshold: 0.55)
3. Build planner prompt with structured output schema
4. Call Ilm provider (JSON mode, no streaming — waits for complete plan)
5. Parse + validate plan JSON
6. Save to `study_plans` table
7. Return saved plan

**Response `201`:**
```json
{
  "data": {
    "id": "uuid",
    "topic": "Cell Biology for midterms",
    "duration_days": 7,
    "document_ids": ["uuid-1", "uuid-2"],
    "plan": {
      "summary": "A 7-day plan covering cell biology fundamentals.",
      "days": [
        {
          "day": 1,
          "title": "Cell Structure & Function",
          "objectives": ["Understand organelle roles"],
          "resources": [
            {
              "document_id": "uuid-1",
              "document_title": "Bio Lecture 1",
              "excerpt": "The nucleus controls cell activity..."
            }
          ],
          "tasks": ["Read pages 1–15", "Draw a labeled cell diagram"]
        }
      ]
    },
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

**Errors:** `400` invalid duration · `404` documents not found · `500` generation failed

---

### `GET /api/planner`

List all saved study plans for the authenticated user.

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "topic": "Cell Biology for midterms",
      "duration_days": 7,
      "created_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

---

### `GET /api/planner/[id]`

Get a single saved study plan with its full content.

**Response `200`:**
```json
{
  "data": {
    "id": "uuid",
    "topic": "Cell Biology for midterms",
    "duration_days": 7,
    "document_ids": ["uuid-1"],
    "plan": { ... },
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

**Errors:** `404` plan not found · `403` belongs to another user