from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import jira, llm

app = FastAPI(title="Jira AI Test Case Generator API")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jira.router, prefix="/api/jira", tags=["jira"])
app.include_router(llm.router, prefix="/api/testcases", tags=["llm"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Jira AI Test Case Generator API"}
