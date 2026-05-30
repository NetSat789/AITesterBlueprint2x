import pandas as pd

def parse_test_cases(file_path: str) -> list[dict]:
    """Parses test cases from a CSV or Excel file."""
    chunks = []
    try:
        if file_path.endswith(".csv"):
            df = pd.read_csv(file_path)
        elif file_path.endswith((".xls", ".xlsx")):
            df = pd.read_excel(file_path)
        else:
            raise ValueError("Unsupported file format. Use CSV or Excel.")
            
        # Assuming typical columns like 'Test Case ID', 'Description', 'Steps', 'Expected Result'
        for _, row in df.iterrows():
            # Combine all non-null columns into a single text representation
            text_repr = "\n".join([f"{col}: {val}" for col, val in row.items() if pd.notnull(val)])
            chunks.append({
                "text": text_repr,
                "metadata": {
                    "source": file_path,
                    "type": "test_case",
                    # Add ID if exists, falling back to index
                    "id": str(row.get("Test Case ID", row.name))
                }
            })
    except Exception as e:
        print(f"Error parsing test cases {file_path}: {e}")
    return chunks
