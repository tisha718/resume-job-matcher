import os
from azure.search.documents import SearchClient
from azure.core.credentials import AzureKeyCredential

AZURE_SEARCH_ENDPOINT = os.getenv("AZURE_SEARCH_ENDPOINT")
AZURE_SEARCH_API_KEY = os.getenv("AZURE_SEARCH_API_KEY")
AZURE_SEARCH_INDEX = os.getenv("AZURE_SEARCH_INDEX")

if not AZURE_SEARCH_ENDPOINT or not AZURE_SEARCH_API_KEY:
    raise RuntimeError("Azure Search credentials not configured")

search_client = SearchClient(
    endpoint=AZURE_SEARCH_ENDPOINT,
    index_name=AZURE_SEARCH_INDEX,
    credential=AzureKeyCredential(AZURE_SEARCH_API_KEY)
)
