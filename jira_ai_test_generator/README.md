# Jira AI Test Case Generator

A full-stack web application that connects to Jira, fetches a ticket's user story by ID, and auto-generates structured test cases using Anthropic's Claude LLM and configurable test templates.

## Architecture

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** FastAPI + httpx + Anthropic SDK

## Features

- **Jira Integration:** Authenticate with Jira and fetch issues (summary, description, acceptance criteria, type, priority).
- **AI Test Generation:** Send issue details to Claude to generate positive, negative, edge, boundary, and security test cases.
- **Export Options:** Copy as TSV (to paste into Xray/TestRail), download as Markdown, or download as CSV.

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate # On Windows
pip install -r requirements.txt
```

Create a `.env` file from the example:
```bash
cp .env.example .env
# Edit .env with your credentials
```

Run the FastAPI server:
```bash
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

## Deliverables Checklist
- [x] `/backend` FastAPI app
- [x] `/frontend` React app
- [x] Strict Test Case JSON Schema
- [x] Editable Table & Export (CSV, MD, TSV)
