import urllib.request
import json
import base64
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

    description = """Priority:
High

Epic Link:
Authentication Enhancements

Description:
As a user, I want to log in using either Passkey or Single Sign-On (SSO), so that I can access my account more securely and conveniently without relying solely on email/password authentication.

Two new login options — "Sign in using SSO" and "Sign in with Passkey" — have been added to the login page alongside existing authentication methods. These options should function seamlessly and provide a smooth user experience across supported environments.

Acceptance Criteria:
1. UI Visibility
  * GIVEN the user is on the login page
  * THEN the following buttons should be visible:
    * "Sign in using SSO"
    * "Sign in with Passkey"
  * AND they should be displayed below the "Sign in with Google" option
2. SSO Login Flow
  * GIVEN the user clicks on "Sign in using SSO"
  * WHEN valid SSO credentials are provided
  * THEN the user should be successfully authenticated and redirected to the dashboard
  * AND appropriate error messages should be shown for invalid credentials"""

    payload = {
        "fields": {
            "summary": "[VWO] Add Passkey and SSO Login Options to VWO Login Page",
            "description": description
        }
    }
    
    # using v2 API to support string description
    result = api_request('PUT', f'/rest/api/2/issue/{ticket_key}', data=payload)
    if result:
        print(f"Successfully updated ticket {ticket_key}!")
    else:
        print("Failed to update ticket.")

if __name__ == "__main__":
    main()
