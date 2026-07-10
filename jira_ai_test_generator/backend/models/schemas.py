from pydantic import BaseModel
from typing import List, Optional

class JiraCredentials(BaseModel):
    base_url: str
    email: str
    api_token: str

class JiraIssueRequest(BaseModel):
    credentials: JiraCredentials
    issue_id: str

class TestCaseGenerateRequest(BaseModel):
    issue_data: dict
    template: str
    llm_api_key: Optional[str] = None # Optional if server has it
    num_test_cases: int = 5

class TestCase(BaseModel):
    id: str
    title: str
    type: str
    priority: str
    preconditions: str
    steps: List[str]
    test_data: str
    expected_result: str
    linked_jira_id: str

class TestCaseResponse(BaseModel):
    test_cases: List[TestCase]
