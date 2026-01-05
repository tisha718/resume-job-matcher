from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Job

router = APIRouter(
    prefix="/api/recruiter",
    tags=["Job Management"]
)

@router.get("/jobs")
async def get_jobs(
    db: Session = Depends(get_db),
    # limit: int = Query(20, ge=1, le=100, description="Number of jobs to return"),
    # offset: int = Query(0, ge=0, description="Number of jobs to skip (for pagination)")
):
    
    jobs = (
        db.query(Job)
        .order_by(Job.id.desc())  # or Job.created_at.desc() if you have it
        # .limit(limit)
        # .offset(offset)
        .all()
    )

    return jobs

@router.get("/jobs/{job_id}")  
async def read_users(job_id: int, db: Session = Depends(get_db)):
    job = db.get(Job, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")

    return job

@router.post("/jobs/new")
async def create_job(
    recruiter_id: int=Query(...),
    title: str=Query(...),
    description: str=Query(...),
    company: str=Query(...),
    location: str=Query(...),
    job_type: str=Query(...),
    job_status: str=Query(...),
    db: Session = Depends(get_db)
):
    job=Job(
        recruiter_id = recruiter_id,
        title = title,
        description = description,
        company=company,
        location = location,
        job_type = job_type,
        job_status=job_status
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    return {
        "message": "Job created successfully",
        "job_id": job.id,
    }