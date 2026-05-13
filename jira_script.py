import urllib.request
import json
import base64
import sys
import os

log_file = open(r'c:\GrowWith\jira_log.txt', 'w')
def log(msg):
    log_file.write(str(msg) + '\n')
    log_file.flush()
    print(msg)

try:
    domain = os.environ.get('JIRA_DOMAIN', 'https://pqrs78901.atlassian.net')
    email = os.environ.get('JIRA_EMAIL', 'pqrs78901@gmail.com')
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
        log(f"Making {method} request to {url}")
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req) as response:
                resp_text = response.read().decode()
                log(f"Success for {url}")
                return json.loads(resp_text)
        except Exception as e:
            log(f"Error {method} {endpoint}: {e}")
            if hasattr(e, 'read'):
                log(e.read().decode())
            return None

    project_key = 'KAN'
    log(f"Using hardcoded project: {project_key}")

    meta = api_request('GET', f'/rest/api/3/project/{project_key}')
    if not meta:
        log("Could not fetch metadata for project KAN.")
        # fallback to common issuetype ID 10002 (Task) or 10001 (Story)
        # Let's try to query issue/createmeta
        createmeta = api_request('GET', f'/rest/api/3/issue/createmeta?projectKeys={project_key}')
        if createmeta and createmeta.get('projects'):
            meta = createmeta['projects'][0]
        else:
            sys.exit(1)

    issue_types = {}
    for it in meta.get('issueTypes', []):
        if 'name' in it and 'id' in it:
            issue_types[it['name']] = it['id']
        elif 'issuetype' in it: # from createmeta
            issue_types[it['issuetype']['name']] = it['issuetype']['id']


    if not issue_types:
        log("No issue types found for project KAN. Cannot proceed.")
        sys.exit(1)

    log(f"Available issue types: {list(issue_types.keys())}")

    target_type_str = "Task" if "Task" in issue_types else ("Story" if "Story" in issue_types else None)
    if not target_type_str:
        if len(issue_types) > 0:
            target_type_str = list(issue_types.keys())[0]

    type_id = issue_types[target_type_str]
    log(f"Using Issue Type: {target_type_str} ({type_id})")

    def create_issue(summary, description):
        payload = {
            "fields": {
                "project": {
                    "key": project_key
                },
                "summary": summary,
                "description": {
                    "type": "doc",
                    "version": 1,
                    "content": [
                        {
                            "type": "paragraph",
                            "content": [
                                {
                                    "type": "text",
                                    "text": description
                                }
                            ]
                        }
                    ]
                },
                "issuetype": {
                    "id": type_id
                }
            }
        }
        
        res = api_request('POST', '/rest/api/3/issue', data=payload)
        if res:
            log(f"Successfully created issue: {res['key']} - {summary}")

    issues_to_create = [
        {
            "summary": "Implement 'Sign in using SSO' flow on login page",
            "description": "Add a 'Sign in using SSO' button to the VWO login page and implement the SSO login integration. When clicked, it should redirect the user to their organization's SSO provider."
        },
        {
            "summary": "Implement 'Sign in with Passkey' flow on login page",
            "description": "Add a 'Sign in with Passkey' button to the VWO login page. Implement the WebAuthn standard to allow users to authenticate securely using their device passkeys without a password."
        }
    ]

    for issue in issues_to_create:
        create_issue(issue['summary'], issue['description'])

except Exception as ex:
    log(f"Unhandled exception: {ex}")
finally:
    log_file.close()

