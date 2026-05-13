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

def api_request(method, endpoint):
    url = f"{domain}{endpoint}"
    req = urllib.request.Request(url, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except Exception as e:
        print(f"Error {method} {endpoint}: {e}")
        return None

def main():
    # Check permissions
    permissions = api_request('GET', '/rest/api/3/mypermissions')
    if permissions and 'permissions' in permissions:
        perms = permissions['permissions']
        print("====== YOUR ACCOUNT PERMISSIONS ======")
        for perm_name, perm_data in perms.items():
            if perm_data.get('havePermission'):
                print(f"- {perm_name}")

if __name__ == "__main__":
    main()
