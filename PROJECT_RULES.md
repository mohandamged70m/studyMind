# Project Rules and Development Guidelines

## Code Style and Standards

### TypeScript/Next.js Conventions
- Use TypeScript for type safety
- Follow Next.js App Router conventions
- Use modern React patterns (hooks, functional components)
- Use async/await for asynchronous operations
- Implement proper error handling with try-catch blocks
- Use meaningful variable and function names
- Follow Tailwind CSS for styling

### File Organization
- Keep modules focused and single-purpose
- Use clear directory structure as outlined in README
- Separate business logic (lib/) from UI components (components/)
- Use Next.js App Router for routing (app/ directory)
- Keep configuration in dedicated config files
- Use Server Actions for server-side logic

### Code Quality
- Write modular, reusable functions
- Avoid code duplication - create utility functions
- Add JSDoc comments for complex functions
- Use TypeScript for type safety
- Use proper TypeScript interfaces and types
- Leverage Next.js built-in optimizations

## Development Workflow

### Git Commit Guidelines
- Use descriptive commit messages
- Follow conventional commit format: `type: description`
- Types: feat, fix, docs, style, refactor, test, chore
- Example: `feat: add PDF ingestion pipeline`

### Testing Requirements
- Write unit tests for core functions
- Add integration tests for API endpoints
- Test error scenarios and edge cases
- Aim for minimum 80% code coverage

### Documentation Standards
- Update README.md for user-facing changes
- Document new API endpoints in docs/API.md
- Add inline comments for complex logic
- Keep AI_CONTEXT.md updated with architectural changes

## Architecture Rules

### Module Boundaries
- lib/ingestion: handles document processing only
- lib/retrieval: manages vector database operations
- lib/llm: handles all LLM interactions
- components/features: implements business logic for user features
- app/api: Next.js API routes for server actions
- hooks: custom React hooks for state management

### Data Flow
1. Documents → Ingestion → Vector DB
2. User Query → API → Retrieval → LLM → Response
3. Quiz Request → API → LLM → Quiz Generation → Response
4. Study Plan → API → Progress Tracker → LLM → Schedule

### Error Handling
- Implement graceful error handling at module boundaries
- Return meaningful error messages to users
- Log errors with context for debugging
- Implement retry logic for transient failures

## Security Considerations

### API Key Management
- Never commit API keys to repository
- Use environment variables for sensitive data
- Implement key rotation strategy
- Add rate limiting to prevent abuse

### Data Privacy
- Sanitize user inputs before processing
- Implement proper data retention policies
- Add user authentication/authorization
- Encrypt sensitive data at rest

### Input Validation
- Validate file types and sizes for uploads
- Sanitize user queries to prevent injection attacks
- Limit context window sizes to prevent overflow
- Implement content filtering for inappropriate material

## Performance Guidelines

### Optimization Priorities
1. Response time for user queries (< 5 seconds)
2. Document ingestion speed
3. Memory usage during processing
4. API call efficiency

### Caching Strategy
- Cache frequently accessed document chunks
- Store common query responses
- Implement embedding caching
- Use CDN for static assets

### Resource Management
- Implement connection pooling for databases
- Use streaming for large file processing
- Add memory limits for document processing
- Monitor and log resource usage

## Deployment Rules

### Environment Setup
- Use different configs for dev/staging/prod
- Implement health check endpoints
- Add monitoring and alerting
- Use containerization (Docker) for consistency

### Database Management
- Implement database migrations
- Backup vector database regularly
- Add database connection retry logic
- Monitor database performance metrics

## Feature Implementation Checklist

Before adding new features:
- [ ] Update AI_CONTEXT.md with architecture changes
- [ ] Add tests for new functionality
- [ ] Update relevant documentation
- [ ] Consider impact on existing features
- [ ] Add error handling and logging
- [ ] Review security implications
- [ ] Test with sample data

## Troubleshooting Guidelines

### Common Issues
- **PDF parsing errors**: Check file format, try alternative parsers
- **Retrieval quality**: Adjust chunk size, re-ranking parameters
- **LLM API failures**: Implement retry logic, check rate limits
- **Memory issues**: Optimize batch sizes, implement streaming

### Debugging Tips
- Enable verbose logging during development
- Use Postman/curl for API testing
- Monitor vector database query performance
- Test with small documents first

## Contribution Guidelines

### Pull Request Process
1. Create feature branch from main
2. Implement changes with tests
3. Update documentation
4. Submit PR with clear description
5. Address review feedback
6. Ensure CI/CD passes

### Code Review Criteria
- Code quality and style compliance
- Test coverage and quality
- Documentation completeness
- Performance impact assessment
- Security review for sensitive changes