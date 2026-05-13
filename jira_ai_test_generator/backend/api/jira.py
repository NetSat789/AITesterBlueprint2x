from fastapi import APIRouter, HTTPException
import httpx
from models.schemas import JiraCredentials, JiraIssueRequest

router = APIRouter()

@router.post("/test-connection")
async def test_connection(credentials: JiraCredentials):
    url = f"{credentials.base_url.rstrip('/')}/rest/api/3/myself"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            auth=(credentials.email, credentials.api_token),
            headers={"Accept": "application/json"}
        )
        
        if response.status_code == 200:
            return {"status": "success", "message": "Connection successful"}
        else:
            raise HTTPException(status_code=response.status_code, detail="Connection failed. Please check credentials.")

@router.post("/fetch-issue")
async def fetch_issue(request: JiraIssueRequest):
    creds = request.credentials
    url = f"{creds.base_url.rstrip('/')}/rest/api/3/issue/{request.issue_id}"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            auth=(creds.email, creds.api_token),
            headers={"Accept": "application/json"}
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"Failed to fetch issue {request.issue_id}")
            
        data = response.json()
        
        fields = data.get("fields", {})
        
        # Extract necessary info
        summary = fields.get("summary", "")
        # Jira returns description in ADF format (Atlassian Document Format) for API v3
        # We'll just pass the raw description or extract text if needed, but passing raw ADF is usually okay for LLMs if prompted correctly
        # Alternatively, we could use API v2 to get plain text/html, but requirement says v3.
        description = fields.get("description", {})
        issuetype = fields.get("issuetype", {}).get("name", "")
        priority = fields.get("priority", {}).get("name", "")
        components = [c.get("name") for c in fields.get("components", [])]
        
        # Acceptance criteria might be a custom field. We'll try to find it.
        acceptance_criteria = None
        for key, value in fields.items():
            if key.startswith("customfield_") and value:
                # Naive check, a more robust way requires fetching field metadata
                # For now, we'll just gather all text-like custom fields or rely on the description
                pass
                
        return {
            "id": request.issue_id,
            "summary": summary,
            "description": description,
            "type": issuetype,
            "priority": priority,
            "components": components,
            "raw_fields": fields # Sending raw fields so LLM can extract if we missed acceptance criteria
        }
