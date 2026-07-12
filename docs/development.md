# Development — StudyMind

Everything you need to go from zero to a running local instance.

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| npm | 9+ | Included with Node |
| Git | any | [git-scm.com](https://git-scm.com) |
| Supabase CLI | latest | `npm i -g supabase` |

You also need accounts (all free tiers work):
- [Supabase](https://supabase.com) — database
- [Clerk](https://clerk.com) — authentication
- [Google AI Studio](https://aistudio.google.com) — embeddings
- Ilm provider — LLM generation (add your account URL here)

---

## Environment Variables

Copy the example file first:

```bash
cp .env.example .env.local
```

Then fill in each value:

### Clerk

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/documents
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/documents
```

Get these from: Clerk Dashboard → Your App → API Keys

### Supabase

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Get these from: Supabase Dashboard → Project Settings → API

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` bypasses Row-Level Security. Never expose it to the client. Never prefix it with `NEXT_PUBLIC_`.

### Google AI (Embeddings)

```env
GOOGLE_AI_API_KEY=AIza...
```

Get this from: [Google AI Studio](https://aistudio.google.com) → Get API Key

### Ilm (LLM Generation)

```env
ILM_API_KEY=...
ILM_BASE_URL=...
ILM_MODEL=...
```

Get these from your Ilm provider dashboard.

### App Config

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
MAX_FILE_SIZE_MB=10
```

---

## Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/studymind.git
cd studymind
npm install
```

### 2. Set Up Supabase Locally

```bash
# Start local Supabase (Docker required)
supabase start

# This gives you a local DB URL + anon key
# Update .env.local with the local values shown in the output
```

Or use your cloud Supabase project directly (simpler for solo dev).

### 3. Run Database Migrations

Open your Supabase SQL editor (local or cloud) and run in order:

```
supabase/migrations/001_enable_pgvector.sql
supabase/migrations/002_create_tables.sql
supabase/migrations/003_create_indexes.sql
supabase/migrations/004_create_rls_policies.sql
supabase/migrations/005_create_match_documents_rpc.sql
supabase/migrations/006_create_storage_bucket.sql
```

Or run all at once:

```bash
supabase db reset   # applies all migrations from scratch
```

### 4. Start the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Sign up for an account — Clerk handles this locally. You'll be redirected to `/documents`.

---

## NPM Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start Next.js dev server with Turbopack |
| `npm run build` | Production build — must pass before any deploy |
| `npm run start` | Start production server locally |
| `npm run type-check` | Run TypeScript compiler (no emit) |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint and auto-fix |

**Before every commit:**
```bash
npm run type-check && npm run lint
```

**Before every deploy:**
```bash
npm run build
```

---

## Project Structure

```
studymind/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Auth check + sidebar
│   │   ├── documents/
│   │   │   └── page.tsx            # Upload & manage docs
│   │   ├── chat/
│   │   │   ├── page.tsx            # Conversation list
│   │   │   └── [id]/page.tsx       # Active conversation
│   │   ├── resources/
│   │   │   └── page.tsx            # Resource finder
│   │   └── planner/
│   │       ├── page.tsx            # Plan list
│   │       └── [id]/page.tsx       # Single plan view
│   ├── api/
│   │   ├── documents/
│   │   │   ├── route.ts            # GET, DELETE /api/documents
│   │   │   └── upload/route.ts     # POST /api/documents/upload
│   │   ├── conversations/
│   │   │   ├── route.ts            # GET, POST /api/conversations
│   │   │   └── [id]/
│   │   │       ├── route.ts        # GET /api/conversations/[id]
│   │   │       └── messages/route.ts # POST (streaming)
│   │   ├── resources/
│   │   │   └── route.ts            # POST /api/resources
│   │   └── planner/
│   │       ├── route.ts            # GET, POST /api/planner
│   │       └── [id]/route.ts       # GET /api/planner/[id]
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                         # Primitives (button, input, card...)
│   ├── documents/                  # Upload, list, delete
│   ├── chat/                       # Message list, input, citations
│   ├── resources/                  # Search input, result cards
│   └── planner/                    # Plan display, day cards
├── lib/
│   ├── rag/
│   │   ├── chunker.ts              # Text → overlapping chunks
│   │   ├── retriever.ts            # Query embed → vector search
│   │   └── generator.ts           # Context + query → LLM response
│   ├── supabase/
│   │   ├── client.ts               # Browser Supabase client
│   │   ├── server.ts               # Server Supabase client (sets user_id)
│   │   └── queries.ts              # All DB queries as typed functions
│   ├── ai/
│   │   ├── embeddings.ts           # Google text-embedding-004
│   │   ├── ilm.ts                  # Ilm LLM client
│   │   └── prompts.ts              # All system prompts as constants
│   ├── parsers/
│   │   ├── pdf.ts                  # pdf-parse wrapper
│   │   ├── docx.ts                 # mammoth wrapper
│   │   └── text.ts                 # TXT/MD reader
│   ├── env.ts                      # Zod env validation
│   └── utils.ts                    # Shared utilities
├── supabase/
│   └── migrations/                 # SQL migration files
├── public/
├── .env.example
├── .env.local                      # Never committed to Git
├── middleware.ts                   # Clerk auth middleware
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## Dev Workflow

### Daily Flow

```bash
git checkout -b feat/your-feature-name
# write code
npm run type-check && npm run lint
git add . && git commit -m "feat: describe what you did"
git push origin feat/your-feature-name
```

### Adding a New API Route

1. Create the file in `app/api/your-route/route.ts`
2. Add Zod schema for the request body
3. Add `auth()` check as the first operation
4. Delegate all logic to a function in `lib/`
5. Add the route to `docs/api.md`

### Adding a New DB Query

1. Write the function in `lib/supabase/queries.ts`
2. Use the server client (`lib/supabase/server.ts`) — never raw SQL elsewhere
3. If it's a new table, write the migration SQL first

---

## Common Gotchas

**RLS permission denied errors**
The server Supabase client must set `app.current_user_id` before any query. If you get a permission denied error, check that `lib/supabase/server.ts` is setting the user ID correctly.

**Vector dimension mismatch**
`text-embedding-004` outputs 768 dimensions. The `document_chunks.embedding` column is `vector(768)`. If you ever switch embedding models, all existing embeddings must be regenerated — the dimensions won't match.

**DOCX extraction issues**
`mammoth` extracts text from `.docx` well but loses formatting. This is intentional — we only need plain text for chunking.

**Streaming not working locally**
Next.js dev server supports streaming. If the stream isn't working, check that you're returning a proper `ReadableStream` in the route handler and that the client is reading `response.body` directly, not `response.json()`.

**Clerk redirect loops**
If you're getting redirect loops, confirm that `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` points to a route that's protected by middleware (`/(dashboard)` matcher), not a public route.