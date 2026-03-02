import zipfile
import xml.etree.ElementTree as ET
import sys
import os

def get_docx_text(path):
    """
    Extract text from docx file without external dependencies
    """
    try:
        with zipfile.ZipFile(path) as z:
            xml_content = z.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            
            # Namespaces for docx xml
            ns = {
                'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
            }
            
            paragraphs = []
            # Find all text elements regardless of hierarchy
            for p in tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
                texts = []
                for t in p.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'):
                    if t.text:
                        texts.append(t.text)
                if texts:
                    paragraphs.append("".join(texts))
            
            if not paragraphs:
                return "No text found in docx."
                
            return "\n".join(paragraphs)
    except Exception as e:
        return f"Error: {str(e)}"

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python docx_text.py <path>")
        sys.exit(1)
        
    file_path = sys.argv[1]
    print(f"Processing: {file_path}")
    text = get_docx_text(file_path)
    output_name = os.path.join("d:\\Website\\aurerxa", os.path.basename(file_path) + ".txt")
    print(f"Attempting to write to: {output_name}")
    try:
        with open(output_name, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"SUCCESS: Captured to {output_name}")
    except Exception as e:
        print(f"FAILURE: Could not write to file: {e}")
