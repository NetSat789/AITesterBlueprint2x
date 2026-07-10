import pdfplumber

def parse_pdf(file_path: str) -> list[str]:
    """Extracts text from a PDF and returns it as chunks."""
    chunks = []
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    # Simple chunking by page for now. 
                    # Advanced chunking could split by paragraphs or semantic boundaries.
                    chunks.append(text)
    except Exception as e:
        print(f"Error reading PDF {file_path}: {e}")
    return chunks
