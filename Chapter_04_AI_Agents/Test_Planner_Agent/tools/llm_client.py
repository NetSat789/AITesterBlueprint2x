import requests
import json
import time

class LLMClient:
    def __init__(self, provider, base_url, api_key, model):
        self.provider = provider.lower()
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.model = model

    def generate_test_plan(self, jira_payload, additional_context):
        system_prompt = (
            "You are a Senior QA Architect. Generate a formal Markdown Test Plan based on the Jira ticket details. "
            "The test plan should be perfectly structured for conversion into a documented template. "
            "Use standard headings: Objectives, Scope, Test Strategy, Entry/Exit criteria, and Test Cases. "
            "Do not include conversational greetings. Just the markdown."
        )

        user_content = f"Jira Ticket ID: {jira_payload.get('ticket_id')}\n"
        user_content += f"Title: {jira_payload.get('title')}\n"
        user_content += f"Description: {jira_payload.get('description')}\n"
        if additional_context:
            user_content += f"\nAdditional Context & Rules: {additional_context}\n"

        if self.provider == 'ollama':
            return self._call_ollama(system_prompt, user_content)
        elif self.provider in ['groq', 'grok']:
            return self._call_openai_compatible(system_prompt, user_content)
        else:
            return {"error": True, "message": f"Provider {self.provider} not supported."}

    def _call_ollama(self, system_prompt, user_content):
        endpoint = f"{self.base_url}/api/chat"
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            "stream": False
        }
        try:
            res = requests.post(endpoint, json=payload, timeout=120)
            if res.status_code == 200:
                return {"error": False, "markdown": res.json().get('message', {}).get('content', '')}
            return {"error": True, "message": f"Ollama HTTP {res.status_code}"}
        except Exception as e:
            return {"error": True, "message": str(e)}

    def _call_openai_compatible(self, system_prompt, user_content):
        endpoint = "https://api.groq.com/openai/v1/chat/completions" if self.provider == 'groq' else "https://api.x.ai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ]
        }
        try:
            res = requests.post(endpoint, headers=headers, json=payload, timeout=60)
            if res.status_code == 200:
                answer = res.json().get('choices', [{}])[0].get('message', {}).get('content', '')
                return {"error": False, "markdown": answer}
            return {"error": True, "message": f"API HTTP {res.status_code}: {res.text}"}
        except Exception as e:
            return {"error": True, "message": str(e)}
