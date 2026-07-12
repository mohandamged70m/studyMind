# Database — StudyMind

**Provider:** Supabase (PostgreSQL 15 + pgvector)
**Tables:** 5 user-data tables + Supabase Storage bucket

---

## Table Overview

```
study_sets          → top-level "notebook" grouping of materials
documents           → metadata for each uploaded file
document_chunks     → text chunks + vector embeddings
conversations       → a named Q&A session tied to documents
messages            → individual turns within a conversation
study_plans         → generated day-by-day study plans
[Storage bucket]    → raw file bytes (PDF, TXT, MD, DOCX)
```

All tables are scoped to `user_id` (Clerk user ID string). RLS enforces this at the DB level — no query can access another user's data even if the app layer has a bug.

---

## 1. Enable pgvector

Run once in your Supabase SQL editor:

```sql
create extension if not exists vector;
```

---

## 2. Schema

### `study_sets`

```sql
create table study_sets (
  id            uuid primary key default gen_random_uuid(),
  user_id       text not null,
  title         text not null,
  description   text,
  source_count  integer not null default 0,
  color_tag     text not null default '#7c5dfa',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
```

### `documents`

```sql
create table documents (
  id            uuid primary key default gen_random_uuid(),
  user_id       text not null,
  title         text not null,
  file_type     text not null check (file_type in ('pdf', 'txt', 'md', 'docx')),
  storage_path  text not null,          -- path in Supabase Storage bucket
  chunk_count   integer not null default 0,
  size_bytes    bigint not null default 0,
  created_at    timestamptz not null default now()
);
```

### `document_chunks`

```sql
create table document_chunks (
  id            uuid primary key default gen_random_uuid(),
  document_id   uuid not null references documents(id) on delete cascade,
  user_id       text not null,          -- denormalized for RLS performance
  content       text not null,          -- raw chunk text
  embedding     vector(768) not null,   -- text-embedding-004 output
  chunk_index   integer not null,       -- position within the document
  created_at    timestamptz not null default now()
);
```

> **Why denormalize `user_id` on chunks?**
> RLS policies on `document_chunks` need to check ownership. Joining to `documents` on every row-level check is expensive. Storing `user_id` directly makes the RLS policy a simple equality check.

### `conversations`

```sql
create table conversations (
  id            uuid primary key default gen_random_uuid(),
  user_id       text not null,
  title         text not null default 'New Conversation',
  document_ids  uuid[] not null default '{}', -- documents in scope for this chat
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
```

### `messages`

```sql
create table messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references conversations(id) on delete cascade,
  role             text not null check (role in ('user', 'assistant')),
  content          text not null,
  citations        jsonb,               -- null for user messages
  created_at       timestamptz not null default now()
);
```

**`citations` JSON shape:**

```json
[
  {
    "document_id": "uuid",
    "document_title": "Lecture 3 - Photosynthesis",
    "chunk_content": "The light-dependent reactions occur in...",
    "similarity_score": 0.87
  }
]
```

### `study_plans`

```sql
create table study_plans (
  id            uuid primary key default gen_random_uuid(),
  user_id       text not null,
  topic         text not null,
  duration_days integer not null,
  document_ids  uuid[] not null default '{}',
  plan          jsonb not null,         -- structured plan object
  created_at    timestamptz not null default now()
);
```

**`plan` JSON shape:**

```json
{
  "summary": "A 7-day plan covering cell biology fundamentals.",
  "days": [
    {
      "day": 1,
      "title": "Cell Structure & Function",
      "objectives": ["Understand organelle roles", "Compare prokaryotes vs eukaryotes"],
      "resources": [
        {
          "document_id": "uuid",
          "document_title": "Bio Lecture 1",
          "excerpt": "The mitochondria is responsible for..."
        }
      ],
      "tasks": ["Read pages 1-15", "Draw a labeled cell diagram"]
    }
  ]
}
```

---

## 3. Indexes

```sql
-- Fast user-scoped lookups
create index idx_study_sets_user_id        on study_sets(user_id);
create index idx_documents_user_id         on documents(user_id);
create index idx_document_chunks_user_id   on document_chunks(user_id);
create index idx_document_chunks_doc_id    on document_chunks(document_id);
create index idx_conversations_user_id     on conversations(user_id);
create index idx_messages_conversation_id  on messages(conversation_id);
create index idx_study_plans_user_id       on study_plans(user_id);

-- Vector index for approximate nearest-neighbor search
-- ivfflat is the right choice for up to ~1M vectors
-- lists = sqrt(total expected rows), tune after 10K+ rows
create index idx_document_chunks_embedding
  on document_chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);
```

> **Note:** The vector index requires at least some rows to be useful. In development with few rows, exact search (no index) is fine. The index matters at scale.

---

## 4. `match_documents` RPC

This is the core vector similarity search function. Called by `lib/supabase/queries.ts` — never called directly from route handlers.

```sql
create or replace function match_documents(
  query_embedding  vector(768),
  match_threshold  float,
  match_count      int,
  p_user_id        text
)
returns table (
  id               uuid,
  document_id      uuid,
  content          text,
  chunk_index      integer,
  similarity       float
)
language sql stable
as $$
  select
    dc.id,
    dc.document_id,
    dc.content,
    dc.chunk_index,
    1 - (dc.embedding <=> query_embedding) as similarity
  from document_chunks dc
  where
    dc.user_id = p_user_id
    and 1 - (dc.embedding <=> query_embedding) > match_threshold
  order by dc.embedding <=> query_embedding
  limit match_count;
$$;
```

**Usage in app:**

| Mode | `match_threshold` | `match_count` |
|---|---|---|
| Q&A Chat | 0.7 | 5 |
| Resource Finder | 0.6 | 10 |
| Study Planner | 0.55 | 15 |

---

## 5. Row-Level Security (RLS)

Enable RLS on every table, then add policies.

```sql
-- Enable RLS
alter table study_sets       enable row level security;
alter table documents        enable row level security;
alter table document_chunks  enable row level security;
alter table conversations    enable row level security;
alter table messages         enable row level security;
alter table study_plans      enable row level security;

-- study_sets: users only see their own
create policy "users_own_study_sets"
  on study_sets for all
  using (user_id = current_setting('app.current_user_id', true));

-- documents: users only see their own
create policy "users_own_documents"
  on documents for all
  using (user_id = current_setting('app.current_user_id', true));

-- document_chunks: users only see chunks from their documents
create policy "users_own_chunks"
  on document_chunks for all
  using (user_id = current_setting('app.current_user_id', true));

-- conversations: users only see their own
create policy "users_own_conversations"
  on conversations for all
  using (user_id = current_setting('app.current_user_id', true));

-- messages: users only see messages in their own conversations
create policy "users_own_messages"
  on messages for all
  using (
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
        and c.user_id = current_setting('app.current_user_id', true)
    )
  );

-- study_plans: users only see their own
create policy "users_own_study_plans"
  on study_plans for all
  using (user_id = current_setting('app.current_user_id', true));
```

> **How `app.current_user_id` is set:** The server Supabase client sets this via `set local app.current_user_id = '<clerk_user_id>'` at the start of each request. See `lib/supabase/server.ts`.

---

## 6. Supabase Storage

**Bucket name:** `documents`

```sql
-- Create the bucket (or do it in the Supabase dashboard)
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false);

-- RLS: users can only access their own files
-- Files are stored at: {user_id}/{document_id}/{filename}
create policy "users_own_files"
  on storage.objects for all
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = current_setting('app.current_user_id', true)
  );
```

**File path convention:** `{user_id}/{document_id}/{original_filename}`

Example: `user_2abc123/550e8400-e29b-41d4.../lecture-notes.pdf`

---

## 7. Migration Workflow

All schema changes go through migration files — never edit production manually.

```bash
# Create a new migration
supabase migration new add_study_plans_table

# Apply locally
supabase db reset

# Apply to production (via Supabase dashboard or CI)
supabase db push
```

Migration files live in `supabase/migrations/` and are committed to Git.