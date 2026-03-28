import os

class DocumentGenerator:
    """
    Handles saving the generated Markdown payload to a file.
    Eventually can be expanded to use python-docx to apply the 'Test Plan - Template.docx' styles.
    """
    def __init__(self, output_dir=".tmp/"):
        self.output_dir = output_dir
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

    def save_markdown(self, filename, markdown_content):
        safe_name = "".join([c for c in filename if c.isalpha() or c.isdigit() or c in ['-', '_']]).rstrip()
        filepath = os.path.join(self.output_dir, f"{safe_name}.md")
        
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(markdown_content)
            return {"error": False, "file_path": filepath}
        except Exception as e:
            return {"error": True, "message": str(e)}

    def generate_docx(self, filename, markdown_content, template_path):
        """
        Stub for .docx generation.
        Requires pip install python-docx
        For MVP, we save as markdown.
        """
        # Save markdown first as backup
        md_result = self.save_markdown(filename, markdown_content)
        
        # In a real scenario, use markdown-to-docx pipeline here.
        # Fallback to returning markdown path for now.
        return md_result

if __name__ == "__main__":
    dg = DocumentGenerator()
    print(dg.save_markdown("TEST-123_Test_Plan", "# Dummy Markdown\nThis is a test."))
