from fastapi import APIRouter, HTTPException
import groq
import json
import os
from models.schemas import TestCaseGenerateRequest, TestCaseResponse

router = APIRouter()

@router.post("/generate", response_model=TestCaseResponse)
async def generate_test_cases(request: TestCaseGenerateRequest):
    # Try to get API key from request, fallback to env
    api_key = request.llm_api_key or os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=400, detail="LLM API Key is missing.")

    client = groq.Groq(api_key=api_key)

    # Simplified mock for the template, in reality we'd load this from templates/
    system_prompt = f"""You are an expert QA Engineer. Your task is to generate at least 5 structured test cases based on the provided Jira User Story context. 
    Use the following template strategy: {request.template}.
    
    You MUST respond with a JSON array of test case objects strictly matching this schema:
    {{
     "id": "TC_001",
     "title": "string",
     "type": "Positive | Negative | Edge | Boundary | Security",
     "priority": "P0 | P1 | P2",
     "preconditions": "string",
     "steps": ["step 1", "step 2"],
     "test_data": "string",
     "expected_result": "string",
     "linked_jira_id": "PROJ-123"
    }}
    
    Output ONLY valid JSON. No markdown formatting, no explanations.
    """
    
    user_prompt = f"Jira Issue Data:\n{json.dumps(request.issue_data, indent=2)}\n\nPlease generate the test cases."

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile", # A good versatile model on Groq
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2,
            max_completion_tokens=4000,
        )
        
        # Parse the JSON response
        content = response.choices[0].message.content
        # Clean up in case the LLM returned markdown blocks
        if content.startswith("```json"):
            content = content.replace("```json\n", "").replace("```", "")
        elif "```" in content:
            # Strip standard markdown fences if present
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:].strip()
            
        test_cases = json.loads(content)
        
        if len(test_cases) < 5:
            # If fewer than 5, we could automatically retry, or just return an error for now
            raise HTTPException(status_code=500, detail="LLM generated fewer than 5 test cases. Please try again.")
            
        return {"test_cases": test_cases}
        
    except groq.APIError as e:
        raise HTTPException(status_code=500, detail=f"Groq API Error: {str(e)}")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse LLM response into valid JSON.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")
