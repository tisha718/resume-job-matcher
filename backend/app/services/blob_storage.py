import os
import uuid
from dotenv import load_dotenv
from urllib.parse import urlparse
from azure.storage.blob import BlobServiceClient
from azure.core.exceptions import ResourceNotFoundError

# Load environment variables
load_dotenv()

# Read env vars
connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
container_name = os.getenv("AZURE_CONTAINER_NAME")

# Safety checks
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
    Idempotent:
    - If blob exists → delete
    - If blob does not exist → ignore
    """

    if not blob_url:
        return

    parsed = urlparse(blob_url)

    # Extract blob name safely
    path = parsed.path.lstrip("/")
    if path.startswith(f"{container_name}/"):
        blob_name = path[len(container_name) + 1 :]
    else:
        blob_name = path

    blob_client = container_client.get_blob_client(blob_name)

    try:
        blob_client.delete_blob()
    except ResourceNotFoundError:
        # Blob already deleted or never existed → SAFE
        return


def download_resume_from_blob(blob_url: str) -> bytes:
    """
    Download a resume file from Azure Blob Storage
    using its full blob URL.
    Returns the file content as bytes.
    """

    parsed = urlparse(blob_url)

    path = parsed.path.lstrip("/")
    if path.startswith(f"{container_name}/"):
        blob_name = path[len(container_name) + 1 :]
    else:
        blob_name = path

    blob_client = container_client.get_blob_client(blob_name)

    download_stream = blob_client.download_blob()
    return download_stream.readall()
