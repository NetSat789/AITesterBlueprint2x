# Progress

## What was done
- Initialized project tracking files.
- Initialized Vite frontend and Express Node.js backend.
- Set up Tailwind CSS with React.
- Built `MainView` and `SettingsView` React components using dynamic and aesthetically pleasing designs (Tailwind, dark mode).
- Implemented `/api/config` and `/api/generate` in Backend.
- Hooked UI to backend endpoints.
- Integrated Ollama, Groq, and OpenAI into `llmService.ts`.

## Errors
- Execution failed during Node.js/NPM initialization commands: `npx`, `node`, and `npm` are not recognized. Node.js is missing or not in PATH. Fixed by injecting Node path directly.
- Frontend build failed during `npm run build` because Vite 6/8 requires Node 20.19+, and the system has 20.12.2. Proceeding to downgrade Vite to v5.
- User reported "localhost refused to connect" on ports 3001 and 5173. This is because the servers were not running. Started `npm run dev` and `npx ts-node index.ts` concurrently. Both are now Fixed and running.

## Tests
- Verified `npm run build` on frontend completes without TS errors on Vite v5.
- Verified nodemon and ts-node function properly for common-js module execution.
- Config endpoints (`/api/config`) save to disk seamlessly.
- LLM Providers (Ollama, Groq, OpenAI) generate structure correctly per unit testing prompts.

## Results
- The Test Case Generator is fully functional.
- The UI (React + Tailwind) runs on port 5173.
- The backend (Node + Express) runs on port 3001.
- Unified configuration allows users to input their OpenAPI/Groq keys or point to local Ollama.
- Output successfully formatted in Jira-style Markdown.
- Addressed `localhost refused to connect` by binding Vite to `--host 127.0.0.1` and Express to `app.listen(port, '127.0.0.1')`.
