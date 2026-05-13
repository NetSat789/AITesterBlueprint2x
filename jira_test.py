import urllib.request
import json
import base64
import sys
import os

log_file = open(r'c:\GrowWith\jira_new_log.txt', 'w')
def log(msg):
    log_file.write(str(msg) + '\n')
    log_file.flush()
    print(msg)

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

def main():
    # 1. Fetch projects
    projects = api_request('GET', '/rest/api/3/project')
    if not projects:
        log("Could not fetch projects. Check your credentials.")
        sys.exit(1)

    log(f"Found {len(projects)} projects.")
    target_project_key = None
    
    for p in projects:
        log(f" - Project: {p.get('name')} (Key: {p.get('key')})")
        if p.get('name', '').lower() == 'qa testing' or p.get('key', '').lower() == 'qa testing':
            target_project_key = p.get('key')

    if not target_project_key:
        if len(projects) > 0:
            target_project_key = projects[0]['key']
            log(f"Target 'QA Testing' not found. Using the first available project key: {target_project_key}")
        else:
            log("No projects available to create issue.")
            sys.exit(1)
    else:
        log(f"Found matching project. Key is: {target_project_key}")

    # 2. Get issue types
    meta = api_request('GET', f'/rest/api/3/project/{target_project_key}')
    if not meta:
        log(f"Could not fetch metadata for project {target_project_key}.")
        sys.exit(1)

    issue_types = {}
    for it in meta.get('issueTypes', []):
        if 'name' in it and 'id' in it:
            issue_types[it['name']] = it['id']

    if not issue_types:
        log(f"No issue types found for project {target_project_key}. Cannot proceed.")
        sys.exit(1)

    log(f"Available issue types: {list(issue_types.keys())}")

    target_type_str = "Task" if "Task" in issue_types else ("Story" if "Story" in issue_types else None)
    if not target_type_str:
        if len(issue_types) > 0:
            target_type_str = list(issue_types.keys())[0]

    type_id = issue_types[target_type_str]
    log(f"Using Issue Type: {target_type_str} ({type_id})")

    # 3. Create issue
    payload = {
        "fields": {
            "project": {
                "key": target_project_key
            },
            "summary": "This is a test ticket from AI agent",
            "description": {
                "type": "doc",
                "version": 1,
                "content": [
                    {
                        "type": "paragraph",
                        "content": [
                            {
                                "type": "text",
                                "text": "Testing Jira integration using the provided new credentials."
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
        log(f"Successfully created issue: {res['key']} - {payload['fields']['summary']}")

try:
    main()
except Exception as ex:
    log(f"Unhandled exception: {ex}")
finally:
    log_file.close()

