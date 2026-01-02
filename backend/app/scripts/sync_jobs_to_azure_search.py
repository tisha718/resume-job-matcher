from app.db.database import SessionLocal
from app.db.models import Job
from app.services.azure_search_client import search_client

def sync_jobs():
    db = SessionLocal()
    jobs = db.query(Job).all()

    documents = []

    for job in jobs:
        documents.append({
        "job_id": str(job.id),         
        "title": job.title,
        "description": job.description,
        "location": job.location,
        "job_type": job.job_type,
    })

    if documents:
        search_client.upload_documents(documents)
        print(f"✅ Synced {len(documents)} jobs to Azure Search")

    db.close()

if __name__ == "__main__":
    sync_jobs()
