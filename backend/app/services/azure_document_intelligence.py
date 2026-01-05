import os
from dotenv import load_dotenv
from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential

load_dotenv()

endpoint = os.getenv("AZURE_DOC_INTEL_ENDPOINT")
key = os.getenv("AZURE_DOC_INTEL_KEY")

if not endpoint or not key:
    raise RuntimeError("Azure Document Intelligence credentials missing")

client = DocumentAnalysisClient(
    endpoint=endpoint,
    credential=AzureKeyCredential(key)
)


def extract_text_from_image(file) -> str:
    """
    Uses Azure Document Intelligence to extract text
    from images or scanned PDFs.
    """

    poller = client.begin_analyze_document(
        model_id="prebuilt-read",
        document=file.file
    )

    result = poller.result()

    extracted_text = []

    for page in result.pages:
        for line in page.lines:
            extracted_text.append(line.content)

    return "\n".join(extracted_text)
