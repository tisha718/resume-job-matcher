# app/services/text_extraction.py
import pdfplumber
import pytesseract
from PIL import Image
import tempfile
import os

from fastapi import UploadFile


def extract_text(file: UploadFile) -> str:
    """
    Robust resume text extraction:
    1. Try text-based PDF extraction
    2. Fallback to OCR for scanned PDFs
    """

    filename = file.filename.lower()

    if not filename.endswith(".pdf"):
        raise ValueError("Only PDF files are supported")

    # --------------------------------------------------
    # Step 1: Try text-based extraction
    # --------------------------------------------------
    try:
        with pdfplumber.open(file.file) as pdf:
            text = ""
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"

        if text.strip():
            file.file.seek(0)  # reset pointer
            return text

    except Exception:
        pass  # fallback to OCR

    # --------------------------------------------------
    # Step 2: OCR fallback (scanned PDFs)
    # --------------------------------------------------
    try:
        file.file.seek(0)

        with tempfile.TemporaryDirectory() as temp_dir:
            images = []

            with pdfplumber.open(file.file) as pdf:
                for i, page in enumerate(pdf.pages):
                    image = page.to_image(resolution=300).original
                    image_path = os.path.join(temp_dir, f"page_{i}.png")
                    image.save(image_path)
                    images.append(image_path)

            ocr_text = ""
            for img_path in images:
                ocr_text += pytesseract.image_to_string(Image.open(img_path))

            if ocr_text.strip():
                file.file.seek(0)
                return ocr_text

    except Exception:
        pass

    # --------------------------------------------------
    # Step 3: Fail gracefully
    # --------------------------------------------------
    raise ValueError(
        "Unable to extract text from this PDF. "
        "The file may be corrupted or unreadable."
    )
