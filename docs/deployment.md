# Deployment — StudyMind

**Hosting:** Vercel
**Database:** Supabase (cloud project)
**Auth:** Clerk (production instance)

---

## Before You Deploy

Run this locally first. If it fails, do not deploy.

```bash
npm run type-check   # zero TypeScript errors
npm run lint         # zero ESLint errors
npm run build        # must succeed
```

---

## 1. Supabase — Production Setup

### Create a Cloud Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose a region close to your users (recommend: `eu-central-1` for Egypt/MENA)
3. Save the database password — you won't see it again

### Enable pgvector

In the Supabase SQL editor:

```sql
create extension if not exists vector;
```

### Run Migrations

Run all migration files in order via the SQL editor:

```
supabase/migrations/001_enable_pgvector.sql
supabase/migrations/002_create_tables.sql
supabase/migrations/003_create_indexes.sql
supabase/migrations/004_create_rls_policies.sql
supabase/migrations/005_create_match_documents_rpc.sql
supabase/migrations/006_create_storage_bucket.sql
```

Or use the Supabase CLI to push from your local:

```bash
supabase link --project-ref your-project-ref
supabase db push
```

### Create the Storage Bucket

In the Supabase dashboard → Storage → New bucket:
- Name: `documents`
- Public: **No** (private)

Or run the SQL in `supabase/migrations/006_create_storage_bucket.sql`.

### Collect Your Production Keys

From Supabase Dashboard → Project Settings → API:

```
NEXT_PUBLIC_SUPABASE_URL       → Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY  → anon (public) key
SUPABASE_SERVICE_ROLE_KEY      → service_role key (secret)
```

---

## 2. Clerk — Production Setup

### Create a Production Instance

1. Clerk Dashboard → Your App → Switch to Production
2. Configure allowed origins: add your Vercel domain (`https://studymind.vercel.app`)
3. Set redirect URLs:
   - Sign-in: `https://your-domain.com/sign-in`
   - After sign-in: `https://your-domain.com/documents`
   - After sign-up: `https://your-domain.com/documents`

### Collect Your Production Keys

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY  → pk_live_...
CLERK_SECRET_KEY                   → sk_live_...
```

---

## 3. Vercel — Deployment

### Import the Repository

1. [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Select the `studymind` repository
3. Framework preset: **Next.js** (auto-detected)
4. Root directory: `/` (leave default)

### Set Environment Variables

In Vercel → Project Settings → Environment Variables, add **all** of the following for the **Production** environment:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL          = /sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL          = /sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL    = /documents
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL    = /documents
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GOOGLE_AI_API_KEY
ILM_API_KEY
ILM_BASE_URL
ILM_MODEL
NEXT_PUBLIC_APP_URL                    = https://your-domain.com
MAX_FILE_SIZE_MB                       = 10
```

> Add the same vars to **Preview** environment so pull request previews work.

### Deploy

```bash
git push origin main
```

Vercel auto-deploys on every push to `main`. The first deploy also happens automatically after the import step.

---

## 4. Custom Domain (Optional)

Vercel Dashboard → Project → Domains → Add Domain

After adding, update:
- `NEXT_PUBLIC_APP_URL` env var in Vercel to the custom domain
- Clerk's allowed origins and redirect URLs to the custom domain

---

## 5. Go-Live Checklist

Run through this before announcing to any users.

**Database**
- [ ] pgvector extension enabled
- [ ] All 6 migration files applied successfully
- [ ] Storage bucket `documents` created and set to private
- [ ] RLS enabled on all 5 tables — verify by trying a query as an anonymous user
- [ ] `match_documents` RPC function exists and returns results

**Auth**
- [ ] Clerk production instance active (not test/development)
- [ ] Allowed origins include your production domain
- [ ] Sign-in and sign-up flows work end-to-end
- [ ] Middleware correctly redirects unauthenticated users to `/sign-in`

**Environment**
- [ ] All env vars set in Vercel for Production environment
- [ ] No `NEXT_PUBLIC_` prefix on secret keys (`SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_AI_API_KEY`, `CLERK_SECRET_KEY`, `ILM_API_KEY`)
- [ ] `NEXT_PUBLIC_APP_URL` matches the actual deployed domain

**Core Features**
- [ ] File upload works (PDF, TXT, MD, DOCX)
- [ ] Files larger than 10MB are rejected with a clear error
- [ ] Document appears in the list after upload
- [ ] Q&A chat returns a response with citations
- [ ] Resource finder returns ranked results
- [ ] Study plan generates and saves successfully
- [ ] Conversation history persists across page reloads

**Performance**
- [ ] `npm run build` output shows no large bundle warnings
- [ ] First page load is under 3 seconds on a standard connection

---

## Dev vs Production Differences

| | Development | Production |
|---|---|---|
| Supabase | Local instance OR cloud project | Cloud project |
| Clerk | Test keys (`pk_test_`, `sk_test_`) | Live keys (`pk_live_`, `sk_live_`) |
| App URL | `http://localhost:3000` | `https://your-domain.com` |
| Streaming | Works locally | Works on Vercel (Edge Runtime supported) |
| File uploads | Direct to cloud Storage | Direct to cloud Storage |

---

## Useful Commands

```bash
# Check deployment logs
vercel logs

# Pull production env vars locally (for debugging)
vercel env pull .env.production.local

# Force redeploy without a code change
vercel deploy --prod
```