import os
import uuid
from dotenv import load_dotenv
from urllib.parse import urlparse
from azure.storage.blob import BlobServiceClient

# Load environment variables
load_dotenv()

# Read env vars
connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
container_name = os.getenv("AZURE_CONTAINER_NAME")

# Safety checks (VERY IMPORTANT)
if not connection_string:
    raise RuntimeError(
        "AZURE_STORAGE_CONNECTION_STRING is not set. "
        "Check your .env file and environment loading."
    )

if not container_name:
    raise RuntimeError(
        "AZURE_CONTAINER_NAME is not set. "
        "Check your .env file."
    )

# Create Blob service client
blob_service_client = BlobServiceClient.from_connection_string(
    connection_string
)
container_client = blob_service_client.get_container_client(
    container_name
)


def upload_resume_to_blob(file):
    """
    Upload resume file to Azure Blob Storage
    and return the blob URL.
    """
    blob_name = f"{uuid.uuid4()}_{file.filename}"

    blob_client = container_client.get_blob_client(blob_name)
    blob_client.upload_blob(file.file, overwrite=True)

    return blob_client.url


def delete_blob(blob_url: str):
    """
    Safely delete a blob using its full Azure Blob URL.
    Idempotent: no error if blob is already missing.
    """
    try:
        # Parse URL → extract blob name
        parsed = urlparse(blob_url)

        # Example path: /resumes/uuid_filename.pdf
        blob_name = parsed.path.split(f"/{container_name}/")[-1]

        blob_client = container_client.get_blob_client(blob_name)

        # ✅ IMPORTANT: check existence first
        if blob_client.exists():
            blob_client.delete_blob()

def download_resume_from_blob(blob_url: str) -> bytes:
    """
    Download a resume file from Azure Blob Storage
    using its full blob URL.
    Returns the file content as bytes.
    """

    # Parse URL → extract blob name
    parsed = urlparse(blob_url)

    # Example path: /resumes/uuid_filename.pdf
    blob_name = parsed.path.split(f"/{container_name}/")[-1]

    blob_client = container_client.get_blob_client(blob_name)

    download_stream = blob_client.download_blob()
    return download_stream.readall()
        else:
            # Blob already deleted → safe to ignore
            pass

    except Exception as e:
        raise RuntimeError(str(e))
