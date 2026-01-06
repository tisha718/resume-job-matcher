from fastapi import APIRouter, Depends, Query, HTTPException, Path, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.db.session import get_db
from app.db.models import Job

router = APIRouter(
    prefix="/recruiter",
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
async def get_job_by_job_id(job_id: int, db: Session = Depends(get_db)):
    job = db.get(Job, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")

    return job

@router.get("/jobs/by-recruiter/{recruiter_id}")  
async def get_job_by_recruiter_id(recruiter_id: int, db: Session = Depends(get_db)):
    job = (
        db.query(Job)
        .filter(Job.recruiter_id == recruiter_id)
        .all()
    )

    if job is None:
        raise HTTPException(status_code=404, detail=f"Job {recruiter_id} not found")

    return job

@router.put("/jobs/{job_id}", summary="Update job posting")
async def update_job(
    job_id: int = Path(..., gt=0, description="Job ID"),

    # All fields are REQUIRED: use Query(...) with ellipsis to mark required
    title: str = Query(..., description="Job title (≤255 chars, non-empty)"),
    description: str = Query(..., description="Job description (non-empty)"),
    company: str = Query(..., description="Company (≤255 chars)"),
    job_status: str = Query(..., description='Job status: "active" or "closed"'),
    location: str = Query(..., description="Location (≤255 chars)"),
    job_type: str = Query(..., description='Job type: "Full-time", "Contract", "Part-Time", "Internship"'),

    db: Session = Depends(get_db),
    # current_recruiter = Depends(get_current_recruiter)  # if you want ownership checks
):
    job = db.get(Job, job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Job {job_id} not found")

    # Allowed sets
    allowed_job_types = {"Full-time", "Contract", "Part-time", "Internship"}
    allowed_job_statuses = {"active", "closed"}

    # --- Validation ---
    title = title.strip()
    if not title:
        raise HTTPException(status_code=422, detail="title cannot be empty")
    if len(title) > 255:
        raise HTTPException(status_code=422, detail="title exceeds 255 characters")

    description = description.strip()
    if not description:
        raise HTTPException(status_code=422, detail="description cannot be empty")

    if len(company) > 255:
        raise HTTPException(status_code=422, detail="company exceeds 255 characters")

    job_status = job_status.strip()
    if len(job_status) > 50:
        raise HTTPException(status_code=422, detail="job_status exceeds 50 characters")
    if job_status not in allowed_job_statuses:
        raise HTTPException(status_code=422, detail=f'job_status must be one of {sorted(allowed_job_statuses)}')

    if len(location) > 255:
        raise HTTPException(status_code=422, detail="location exceeds 255 characters")

    job_type = job_type.strip()
    if len(job_type) > 50:
        raise HTTPException(status_code=422, detail="job_type exceeds 50 characters")
    if job_type not in allowed_job_types:
        raise HTTPException(status_code=422, detail=f'job_type must be one of {sorted(allowed_job_types)}')

    # --- Apply updates (all required fields) ---
    job.title = title
    job.description = description
    job.company = company
    job.job_status = job_status
    job.location = location
    job.job_type = job_type

    db.add(job)
    db.commit()
    db.refresh(job)

    
    # try:
    #     db.add(job)
    #     db.commit()
    #     db.refresh(job)
    # except Exception as e:
    #     db.rollback()
    #     raise


    return {
        "id": job.id,
        "recruiter_id": job.recruiter_id,
        "title": job.title,
        "description": job.description,
        "company": job.company,
        "job_status": job.job_status,
        "location": job.location,
        "job_type": job.job_type,
        "created_at": job.created_at.isoformat() if job.created_at else None,
    }

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


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a job posting")
async def delete_job(
    job_id: int = Path(..., gt=0, description="Job ID to delete"),
    db: Session = Depends(get_db),
    # current_recruiter = Depends(get_current_recruiter)  # ← uncomment when you have auth
):
    job = db.get(Job, job_id)
    if job is None:
        # No resource to delete
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Job {job_id} not found")

    # Ownership (optional)
    # assert_recruiter_owns_job(job, current_recruiter.id)

    try:
        db.delete(job)
        db.commit()
    except IntegrityError:
        db.rollback()
        # Likely due to FK constraint (applications referencing this job)
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete job due to existing references (e.g., applications). Consider closing the job instead."
        )
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete job due to a database error")

    # 204 No Content (empty body)
    return
