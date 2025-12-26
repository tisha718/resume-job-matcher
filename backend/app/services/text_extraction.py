# app/services/text_extraction.py

import pdfplumber
import docx
import io


def extract_text(file):
    """
    Extract text from PDF or DOCX resume.
    """
    content = file.file.read()
    filename = file.filename.lower()

    if filename.endswith(".pdf"):
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            text = ""
            for page in pdf.pages:
                text += page.extract_text() or ""
            return text.strip()

    elif filename.endswith(".docx"):
        doc = docx.Document(io.BytesIO(content))
        return "\n".join(p.text for p in doc.paragraphs).strip()

    return ""
