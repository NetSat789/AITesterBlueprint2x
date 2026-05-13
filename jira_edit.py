import urllib.request
import json
import base64
import sys
import os

domain = os.environ.get('JIRA_DOMAIN', 'https://sdn7.atlassian.net')
email = os.environ.get('JIRA_EMAIL', 'sdnxac@gmail.com')
api_token = os.environ.get('JIRA_API_TOKEN', '')

auth_str = f'{email}:{api_token}'
b64_auth_str = base64.b64encode(auth_str.encode('ascii')).decode('ascii')
headers = {
    'Authorization': f'Basic {b64_auth_str}',
    'Accept': 'application/json',
    'Content-Type': 'application/json'
}

def api_request(method, endpoint, data=None):
    url = f"{domain}{endpoint}"
    if data:
        data = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            if response.status in [200, 204]:
                return True
            resp_text = response.read().decode()
            return json.loads(resp_text) if resp_text else True
    except Exception as e:
        print(f"Error {method} {endpoint}: {e}")
        if hasattr(e, 'read'):
            print(e.read().decode())
        return False

def main():
    ticket_key = "SCRUM-5"
    print(f"Updating ticket {ticket_key}...")

    # We use PUT /rest/api/3/issue/{issueIdOrKey}
    payload = {
        "fields": {
            "priority": {
                "name": "High"
            },
            "labels": ["Frontend", "Authentication", "Security_Automation"],
            "duedate": "2026-05-15",
            "customfield_10015": "2026-05-01" # Start date
        }
    }
    
    result = api_request('PUT', f'/rest/api/3/issue/{ticket_key}', data=payload)
    if result:
        print(f"Successfully updated ticket {ticket_key}!")
    else:
        print("Failed to update ticket.")

if __name__ == "__main__":
    main()
