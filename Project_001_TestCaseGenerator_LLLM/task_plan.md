# Task Plan

## Blueprint

**Target & Scope:**
- Target applications: API Testing, Web Application Testing.
- Test Types: Functional and Non-functional test cases.
- Output Format: Results will be presented in Jira format.

**Input Mechanism:**
- Primary input: Jira requirements provided by the user via copy-paste or chat interface.

**UI Design:**
- **Main View**:
  - Left Sidebar: History of requests.
  - Main Area: Display area for the generated test case.
  - Bottom Input: Text input to paste the Jira requirement or prompt "Ask here is here TC for Requirement".
- **Settings View**:
  - Configuration fields for Ollama Setting, Groq Setting, Open AI API keys.
  - Action buttons: "Test Connection" and "Save Button" at the bottom.

**Tech Stack:**
- Generator Backend: Node.js with TypeScript.
- Generator Frontend: React (TypeScript).

**LLM Infrastructure:**
- Supported Providers: Ollama API, LM Studio API, Groq API, OpenAI, Claude API, Gemini API.
- Configuration: Managed through the Settings View.

**(Approved)**

## Phases & Goals
- Phase 1: Initialize full-stack repository (React & Node.js).
- Phase 2: Build UI structures based on the provided wireframe image.
- Phase 3: Implement LLM API integrations and routing.
- Phase 4: Verification and polishing.

## Checklists
- [x] Setup `frontend/` using Vite + React-TS
- [x] Setup `backend/` using Express + Node.js
- [x] Build Main View & Settings View
- [x] Implement API configuration storage
- [x] Connect APIs to LLM providers
- [x] Fix localhost IPv4 binding issues for Windows.
