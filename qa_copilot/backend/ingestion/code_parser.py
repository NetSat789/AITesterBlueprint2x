import os

def parse_code_directory(directory_path: str, extensions: list[str] = [".py", ".js", ".ts"]) -> list[dict]:
    """Reads source code files and returns them as chunks with metadata."""
    chunks = []
    for root, _, files in os.walk(directory_path):
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()
                        chunks.append({
                            "text": content,
                            "metadata": {
                                "file_name": file,
                                "file_path": file_path,
                                "type": "source_code"
                            }
                        })
                except Exception as e:
                    print(f"Error reading file {file_path}: {e}")
    return chunks
