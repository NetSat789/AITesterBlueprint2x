import argparse
import requests
import json
import sys

def test_llm_connection(provider, base_url, api_key, model):
    """
    Test LLM API connection. Focuses on Ollama / GROQ via OpenAI-like endpoints.
    """
    try:
        if provider.lower() == "ollama":
            endpoint = f"{base_url.rstrip('/')}/api/tags"
            response = requests.get(endpoint, timeout=10)
            if response.status_code == 200:
                print(json.dumps({"status": "success", "message": "Successfully connected to Ollama server."}))
                return True
            else:
                print(json.dumps({"status": "error", "message": f"Ollama HTTP {response.status_code}"}))
                return False
                
        elif provider.lower() in ["groq", "grok"]:
            # Groq uses standard OpenAI client structures. Just check models endpoint.
            if provider.lower() == "groq":
                endpoint = "https://api.groq.com/openai/v1/models"
            else:
                endpoint = "https://api.x.ai/v1/models" # Grok API usually OpenAI compatible depending on setup
            
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            response = requests.get(endpoint, headers=headers, timeout=10)
            if response.status_code == 200:
                print(json.dumps({"status": "success", "message": f"Successfully connected to {provider.capitalize()} API."}))
                return True
            else:
                print(json.dumps({"status": "error", "message": f"{provider} HTTP {response.status_code}: {response.text}"}))
                return False
        else:
            print(json.dumps({"status": "error", "message": f"Unknown provider {provider}"}))
            return False

    except Exception as e:
        print(json.dumps({"status": "error", "message": str(e)}))
        return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test LLM Connection")
    parser.add_argument("--provider", required=True, help="LLM Provider (Ollama, Groq, Grok)")
    parser.add_argument("--url", help="Base URL (Required for Ollama)", default="http://localhost:11434")
    parser.add_argument("--key", help="API Key (Required for Groq/Grok)", default="")
    parser.add_argument("--model", help="Model Name", default="llama3")
    
    args = parser.parse_args()
    success = test_llm_connection(args.provider, args.url, args.key, args.model)
    if not success:
        sys.exit(1)
