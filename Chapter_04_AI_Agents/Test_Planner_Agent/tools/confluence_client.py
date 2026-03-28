import requests
import json
import markdown

class ConfluenceClient:
    def __init__(self, confluence_url, email, api_token):
        self.url = confluence_url.rstrip('/') if confluence_url.startswith('http') else 'https://' + confluence_url.rstrip('/')
        self.email = email
        self.api_token = api_token

    def publish_page(self, space_key, title, markdown_content):
        """
        Publishes Markdown content as a new Confluence page.
        """
        endpoint = f"{self.url}/rest/api/content"
        
        # Convert Markdown to HTML for Confluence storage format
        try:
            html_content = markdown.markdown(markdown_content, extensions=['tables', 'fenced_code'])
        except Exception as e:
            return {"error": True, "message": f"Markdown conversion failed: {str(e)}"}
        
        payload = {
            "type": "page",
            "title": title,
            "space": {"key": space_key.upper()},
            "body": {
                "storage": {
                    "value": html_content,
                    "representation": "storage"
                }
            }
        }
        
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
        
        try:
            response = requests.post(
                endpoint,
                auth=(self.email, self.api_token),
                headers=headers,
                data=json.dumps(payload),
                timeout=20
            )
            
            if response.status_code in [200, 201]:
                page_id = response.json().get('id', '')
                return {
                    "error": False, 
                    "message": "Successfully published to Confluence!", 
                    "url": f"{self.url}/spaces/{space_key}/pages/{page_id}"
                }
            else:
                err_msg = response.text
                if "A page with this title already exists" in err_msg:
                    err_msg = "A page with this title already exists in that space."
                if "<html" in err_msg.lower():
                    err_msg = "Received HTML error page instead of JSON. Your Confluence URL might be incorrect or you lack permissions."
                return {"error": True, "message": f"Confluence Error {response.status_code}: {err_msg}"}
        except Exception as e:
            return {"error": True, "message": f"Exception occurred: {str(e)}"}
