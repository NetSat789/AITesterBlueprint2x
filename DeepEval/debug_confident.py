import os, requests
from dotenv import load_dotenv
load_dotenv()

key = os.getenv("CONFIDENT_API_KEY")
print(f"Key prefix: {key[:40] if key else 'None'}...")
print(f"Key length: {len(key) if key else 0}")

headers = {
    "CONFIDENT-API-KEY": key,
    "Content-Type": "application/json",
    "X-DeepEval-Version": "4.0.6",
}

r = requests.post(
    "https://api.confident-ai.com/v1/test-run",
    headers=headers,
    json={"test_cases": []},
    timeout=15,
)
print(f"Status: {r.status_code}")
print(f"Response: {r.text[:500]}")
