import os
from groq import Groq
from backend.config import settings

# Initialize Groq client
client = Groq(api_key=settings.GROQ_API_KEY)

def generate_response(prompt: str, context: str) -> str:
    """Generates a response from the LLM based on context."""
    if not settings.GROQ_API_KEY:
        return "Error: GROQ_API_KEY not configured."
        
    system_prompt = (
        "You are an expert QA Co-Pilot. You have access to source code, test cases, "
        "requirements, and JIRA summaries. Answer the user's question accurately based "
        "on the provided context. If the answer is not in the context, state that you don't know.\n\n"
        f"Context:\n{context}"
    )
    
    try:
        completion = client.chat.completions.create(
            model=settings.LLM_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=2048,
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"Error communicating with Groq API: {str(e)}"
