# import os
# os.environ["HF_HUB_DISABLE_SSL_VERIFICATION"] = "1"

# from huggingface_hub import snapshot_download

# # BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# # MODEL_DIR = os.path.join(BASE_DIR, "models")

# # os.makedirs(MODEL_DIR, exist_ok=True)

# snapshot_download(
#     repo_id="sentence-transformers/all-MiniLM-L6-v2",
#     cache_dir="models",
#     local_dir_use_symlinks=False
# )

# print("✅ Download completed")

# import certifi
# print(certifi.where)