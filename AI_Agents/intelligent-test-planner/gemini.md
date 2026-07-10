# Intelligent Test Planning Agent — Project Constitution (gemini.md)

## North Star
An AI-powered web application that connects to Jira/ADO, fetches user stories by ID, and automatically generates comprehensive test plans following a standardized template.

## Data Schema

### Connection Schema (Input)
```json
{
  "id": "string",
  "name": "string",
  "platform": "jira | ado",
  "url": "string",
  "email": "string (jira only)",
  "apiToken": "string (jira only)",
  "pat": "string (ado only)",
  "verified": "boolean",
  "connectedUser": "string"
}
```

### Issue Schema (Intermediate)
```json
{
  "id": "string (e.g. PROJ-123)",
  "title": "string",
  "type": "Story | Bug | Task | Epic",
  "status": "string",
  "priority": "Critical | High | Medium | Low",
  "description": "string",
  "labels": ["string"],
  "assignee": "string"
}
```

### LLM Config Schema
```json
{
  "provider": "ollama | groq | grok",
  "ollama": { "baseUrl": "string", "model": "string" },
  "groq": { "apiKey": "string", "model": "string" },
  "grok": { "apiKey": "string", "model": "string" }
}
```

### Test Plan Schema (Output)
```json
{
  "id": "string",
  "title": "string",
  "date": "ISO date string",
  "issueCount": "number",
  "platform": "jira | ado",
  "content": "string (Markdown)"
}
```

## Behavioral Rules
1. Test plans MUST follow the template structure (Introduction, Scope, Test Scenarios, Environment, Strategy, Defect Procedure, Schedule, Risks, Criteria, Approvals)
2. Test cases must be SPECIFIC to the fetched requirements, not generic
3. Each feature should have 5-8 test cases covering positive, negative, boundary, and edge cases
4. API tokens are stored in localStorage (client-side only)
5. All connections must be verified before use (test connection)
6. LLM provider must be configured before generating test plans

## Architectural Invariants
- Frontend-only architecture (no backend server for v1)
- CORS proxy for Jira/ADO API calls
- State management via React Context + useReducer
- Data persistence via localStorage
- LLM calls made directly from client (Ollama local, GROQ/Grok via API)

## Tech Stack
- Frontend: React + Vite 5
- Styling: Vanilla CSS with custom properties
- Routing: React Router v7
- Icons: Lucide React
- Markdown: react-markdown
- Deploy target: Vercel
