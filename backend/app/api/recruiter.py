from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Job

router = APIRouter(
    prefix="/api/recruiter",
    tags=["Job Management"]
)

@router.post("/jobs/new")
async def create_job(
    recruiter_id: int=Query(...),
    title: str=Query(...),
    description: str=Query(...),
    location: str=Query(...),
    job_type: str=Query(...),
    db: Session = Depends(get_db)
):
    job=Job(
        recruiter_id = recruiter_id,
        title = title,
        description = description,
        location = location,
        job_type = job_type
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    return {
        "message": "Job created successfully",
        "job_id": job.id,
    }