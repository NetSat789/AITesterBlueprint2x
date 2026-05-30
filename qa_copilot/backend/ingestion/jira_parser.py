import pandas as pd
import json

def parse_jira_export(file_path: str) -> list[dict]:
    """Parses Jira issues from a CSV or JSON export."""
    chunks = []
    try:
        if file_path.endswith(".csv"):
            df = pd.read_csv(file_path)
            for _, row in df.iterrows():
                # Focus on Summary, Description, Status, etc.
                text_repr = f"Issue Key: {row.get('Issue key', '')}\n"
                text_repr += f"Summary: {row.get('Summary', '')}\n"
                text_repr += f"Description: {row.get('Description', '')}\n"
                text_repr += f"Status: {row.get('Status', '')}"
                
                chunks.append({
                    "text": text_repr,
                    "metadata": {
                        "source": file_path,
                        "type": "jira_issue",
                        "key": str(row.get('Issue key', 'unknown'))
                    }
                })
        elif file_path.endswith(".json"):
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Assume standard Jira API array format
                issues = data.get("issues", []) if isinstance(data, dict) else data
                for issue in issues:
                    fields = issue.get("fields", {})
                    text_repr = f"Issue Key: {issue.get('key', '')}\n"
                    text_repr += f"Summary: {fields.get('summary', '')}\n"
                    text_repr += f"Description: {fields.get('description', '')}\n"
                    
                    chunks.append({
                        "text": text_repr,
                        "metadata": {
                            "source": file_path,
                            "type": "jira_issue",
                            "key": str(issue.get('key', 'unknown'))
                        }
                    })
        else:
            raise ValueError("Unsupported file format. Use CSV or JSON.")
    except Exception as e:
        print(f"Error parsing Jira export {file_path}: {e}")
    return chunks
