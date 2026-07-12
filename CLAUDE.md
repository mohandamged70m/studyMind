# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Study Partner Agent is an intelligent study companion built with Next.js 14 (App Router), React 19, and Tailwind CSS. It uses Retrieval-Augmented Generation (RAG) with LLMs to help users learn from their study materials through Q&A, quiz generation, and study planning.

## Commands

### Development
- `npm run dev` or `yarn dev` - Start the development server at http://localhost:3000
- `npm run build` or `yarn build` - Build the production application
- `npm run start` or `yarn start` - Start the production server
- `npm run lint` or `yarn lint` - Run ESLint for TypeScript/JavaScript files

### Environment Setup
1. Copy `.env.example` to `.env.local`
2. Add required API keys (LLM provider, vector database)
3. Install dependencies: `npm install` or `yarn install`

## Project Structure

```
study-partner-agent/
├── app/                    # Next.js App Router
│   ├── api/                # API routes (server actions and endpoints)
│   ├── library/            # Document library page
│   ├── study/              # Study interface (chat, notes, etc.)
│   ├── review/             # Review interface (flashcards, quizzes)
│   ├── actions.ts          # Server actions for data mutations
│   ├── layout.ts           # Root layout with fonts and metadata
│   └── page.tsx            # Home page (redirects to library)
├── lib/                    # Core libraries and business logic
│   ├── data.ts             # In-memory data store and CRUD operations
│   ├── rag.ts              # mock RAG implementation (queryDocument, embedDocument)
│   ├── db/                 # Persistent storage using JSON file (fs-based)
│   │   ├── store.ts        # Disk-based JSON storage for documents, chats, etc.
│   │   └── types.ts        # Database-specific TypeScript types
│   ├── types.ts            # Shared TypeScript interfaces (Document, ChatMessage, etc.)
│   └── utils.ts            # Utility functions
├── components/             # Reusable UI components
│   ├── library/            # Library-specific components (UploadDropzone, DocumentCard)
│   ├── study/              # Study interface components
│   ├── review/             # Review interface components
│   ├── chat/               # Chat interface components
│   ├── layout/             # Layout components (TopNav)
│   ├── tools/              # Utility components
│   ├── ui/                 # Reusable UI primitives (buttons, inputs, etc.)
│   └── workspace/          # Workspace-related components
├── types/                  # Global TypeScript type definitions
├── docs/                   # Documentation files
├── public/                 # Static assets
├── .data/                  # Persistent storage directory (JSON file)
├── .clerk/                 # Clerk authentication configuration
└── .env.local              # Environment variables (not committed)
```

## Architecture Overview

### Data Flow
1. **Document Ingestion**: Users upload documents via `UploadDropzone` → triggers `uploadDocumentAction` → creates document record in `lib/data.ts` → generates mock content → calls `embedDocument` in `lib/rag.ts` (simulated indexing)
2. **Query Processing**: User asks a question in study chat → sends to API route → calls `queryDocument` in `lib/rag.ts` → retrieves relevant document chunks from `lib/data.ts` → returns answer with citation
3. **State Management**: 
   - Server data stored in `.data/store.json` (via `lib/db/store.ts`)
   - Client state uses React hooks and optimistic updates (see `app/actions.ts` for server actions)
   - Document progress tracked via cookies (`last_opened_doc`)

### Key Features Implementation
- **RAG System**: Mocked in `lib/rag.ts` with keyword matching and predefined responses for sample documents
- **Document Handling**: Metadata stored in JSON file (`lib/db/store.ts`), content simulated in `lib/data.ts`
- **Chat & Messaging**: Stored in `lib/data.ts` with citation support
- **Flashcards & Quizzes**: Generated during document upload, stored in-memory/persisted
- **Authentication**: Integrated with Clerk (visible in `.clerk` directory)

### Styling & UI
- Tailwind CSS with custom CSS variables (`globals.css`)
- Fonts: Fraunces, Public Sans, Newsreader (from Google Fonts)
- Layout: Fixed top navigation (`TopNav`), main content area
- Components: Built with Radix UI primitives and Lucide icons

## Development Guidelines

### Code Style & Standards
- Use TypeScript for type safety
- Follow Next.js App Router conventions (route groups, server/client components)
- Use modern React patterns (hooks, functional components)
- Prefer `async/await` for asynchronous operations
- Implement proper error handling with try-catch
- Use meaningful variable and function names
- Follow Tailwind CSS for styling
- Leverage Server Actions for server-side logic (see `app/actions.ts`)

### File Organization
- Keep modules focused and single-purpose
- Separate business logic (`lib/`) from UI components (`components/`)
- Use Next.js App Router for routing (`app/` directory)
- Keep configuration in dedicated config files (`next.config.ts`, `tsconfig.json`, etc.)
- Place shared types in `lib/types.ts` or `types/`

### Code Quality
- Write modular, reusable functions
- Avoid duplication - create utility functions in `lib/utils.ts`
- Add JSDoc comments for complex functions
- Use TypeScript interfaces and types extensively
- Leverage Next.js built-in optimizations (image optimization, font loading, etc.)

### Data Flow & Module Boundaries
- `lib/data`: Handles document processing, in-memory stores, and document-related operations
- `lib/db`: Persistent storage layer (JSON file-based) for documents, chats, conversations
- `lib/rag`: Mock retrieval-augmented generation implementation
- `components/features`: Implements business logic for user features (chat, quiz, etc.)
- `app/api`: Next.js API routes for server-side operations
- `hooks`: Custom React hooks for state management
- `app/actions`: Server actions for form submissions and mutations

### Error Handling
- Implement graceful error handling at module boundaries
- Return meaningful error messages to users
- Log errors with context for debugging
- Implement retry logic for transient failures (where applicable)

### Performance Guidelines
1. Prioritize response time for user queries (< 5 seconds)
2. Optimize document ingestion speed
3. Monitor memory usage during processing
4. Optimize API call efficiency
5. Implement caching for frequently accessed document chunks
6. Use CDN for static assets
7. Implement connection pooling for database operations
8. Use streaming for large file processing
9. Set memory limits for document processing
10. Monitor and log resource usage

## Getting Started
1. Install dependencies: `npm install`
2. Set up environment variables: copy `.env.example` to `.env.local` and fill in required values
3. Start development server: `npm run dev`
4. Visit http://localhost:3000 (will redirect to /library)
5. Upload a document to begin using the study features

## Notes
- The application uses a mock RAG implementation for demonstration. In production, replace `lib/rag.ts` with actual LLM and vector database integrations.
- Persistent storage uses a JSON file in `.data/store.json` - suitable for development but should be replaced with a proper database ( PostgreSQL, MongoDB, or vector database like Pinecone/Chroma) for production.
- Authentication is handled by Clerk - ensure proper configuration in `.env.local`.
- Testing setup is not configured in the repository; consider adding Jest or Vitest for unit and integration tests following the guidelines in PROJECT_RULES.md.