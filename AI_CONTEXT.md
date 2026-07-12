# AI Context for Study Partner Agent

## Project Overview
This is a study partner agent that uses RAG (Retrieval-Augmented Generation) and LLMs to help users learn from their study materials. The system ingests PDFs and documents, processes them for retrieval, and provides intelligent assistance through Q&A, quiz generation, and study planning.

## Technical Stack
- **Framework**: Next.js 14 (App Router) with TypeScript
- **LLM Framework**: LangChain.js or LlamaIndex
- **Data Sources**: PDFs and text documents
- **Core Features**: Q&A explanations, quiz generation, study planning, progress tracking
- **Frontend**: React with Tailwind CSS
- **State Management**: React Context / Zustand

## Architecture Overview

### Document Ingestion Pipeline
1. Upload PDF/text documents
2. Extract text content using appropriate parsers
3. Chunk documents into manageable segments
4. Create embeddings for each chunk
5. Store in vector database for retrieval

### RAG System
- Uses vector similarity search to find relevant document chunks
- Augments LLM prompts with retrieved context
- Provides citations back to source materials

### Feature Modules
- **Q&A System**: Natural language queries with context-aware responses
- **Quiz Generator**: Creates various question types (multiple choice, short answer, essay)
- **Study Planner**: Schedules study sessions based on content and user progress
- **Progress Tracker**: Monitors user performance and adapts recommendations

## Key Implementation Considerations

### Document Processing
- Handle various PDF formats and layouts
- Preserve document structure and metadata
- Implement smart chunking strategies (semantic, paragraph-based)
- Support incremental updates to document index

### Retrieval Optimization
- Experiment with different chunk sizes and overlap
- Implement hybrid search (keyword + semantic)
- Add re-ranking of retrieved results
- Support filtering by document, topic, or date

### LLM Integration
- Design effective prompt templates for each feature
- Implement context window management
- Add caching for common queries
- Support multiple LLM providers (OpenAI, Anthropic, local models)

### User Experience
- Provide clear citations and source references
- Offer follow-up question suggestions
- Enable conversation history context
- Support multiple study sets/topics

## Development Guidelines
- Follow existing code patterns and conventions
- Write modular, reusable components
- Add comprehensive error handling
- Include logging for debugging
- Write tests for core functionality
- Document API endpoints and interfaces

## Environment Variables Required
- LLM_API_KEY (OpenAI, Anthropic, etc.)
- VECTOR_DB_API_KEY (Pinecone, Chroma, etc.)
- VECTOR_DB_INDEX_NAME
- Optional: LOCAL_MODEL_PATH for local LLMs

## Performance Considerations
- Implement rate limiting for API calls
- Use streaming responses for long answers
- Cache embeddings and frequently accessed content
- Optimize vector database queries
- Consider batch processing for document ingestion