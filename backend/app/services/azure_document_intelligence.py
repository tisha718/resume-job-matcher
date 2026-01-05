import os
from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential
from dotenv import load_dotenv

load_dotenv()

endpoint = os.getenv("AZURE_DOC_INTEL_ENDPOINT")
api_key = os.getenv("AZURE_DOC_INTEL_KEY")

if not endpoint or not api_key:
    raise RuntimeError(
        "Azure Document Intelligence credentials not set in .env"
    )

client = DocumentAnalysisClient(
    endpoint=endpoint,
    credential=AzureKeyCredential(api_key)
)


def extract_text_from_image(file_bytes: bytes) -> str:
    """
    Extract text from image-based resume using Azure Document Intelligence.
    """
    poller = client.begin_analyze_document(
        model_id="prebuilt-read",
        document=file_bytes
    )

    result = poller.result()

    lines = []
    for page in result.pages:
        for line in page.lines:
            lines.append(line.content)

    return "\n".join(lines)
