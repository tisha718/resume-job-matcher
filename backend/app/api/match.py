from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Resume, Job
from app.services.matching_service import match_resume_to_job

router = APIRouter(
    prefix="/api/candidate",
    tags=["Candidate Jobs"]
)

# ------------------------------------------------------------------
# 1️⃣ Recommended Jobs
# ------------------------------------------------------------------
@router.get("/recommended-jobs")
def get_recommended_jobs(
    user_id: int = Query(..., description="Candidate user id"),
    resume_id: int = Query(..., description="Resume selected by candidate"),
    limit: int = Query(5, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """
    Get AI-matched job recommendations for a selected resume.
    Includes job description for UI cards.
    """

    resume = (
        db.query(Resume)
        .filter(
            Resume.id == resume_id,
            Resume.user_id == user_id
        )
        .first()
    )

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found for user")

    jobs = db.query(Job).all()
    recommendations = []

    for job in jobs:
        result = match_resume_to_job(
            resume_text=resume.parsed_text,
            job_description=job.description
        )

        recommendations.append({
            "job_id": job.id,
            "title": job.title,
            "description": job.description,
            "location": job.location,
            "job_type": job.job_type,
            "fit_score": result["fit_score"],
        })

    recommendations.sort(
        key=lambda x: x["fit_score"],
        reverse=True
    )

    return {
        "user_id": user_id,
        "resume_id": resume_id,
        "recommended_jobs": recommendations[:limit]
    }


# ------------------------------------------------------------------
# 2️⃣ Skill Analysis (Merged: score + gaps)
# ------------------------------------------------------------------
@router.get("/jobs/{job_id}/skill-analysis")
def get_job_skill_analysis(
    job_id: int,
    user_id: int = Query(...),
    resume_id: int = Query(...),
    db: Session = Depends(get_db),
):
    """
    Detailed skill analysis for a job against a selected resume.
    """

    resume = (
        db.query(Resume)
        .filter(
            Resume.id == resume_id,
            Resume.user_id == user_id
        )
        .first()
    )

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found for user")

    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    result = match_resume_to_job(
        resume_text=resume.parsed_text,
        job_description=job.description
    )

    return {
        "job_id": job.id,
        "title": job.title,
        "description": job.description,
        "fit_score": result["fit_score"],
        "skill_score": result["skill_score"],
        "semantic_score": result["semantic_score"],
        "matched_skills": result["matched_skills"],
        "missing_skills": result["missing_skills"],
    }


# ------------------------------------------------------------------
# 3️⃣ Apply for Job (stub)
# ------------------------------------------------------------------
@router.post("/jobs/{job_id}/apply")
def apply_for_job(
    job_id: int,
    user_id: int = Query(...)
):
    """
    Apply for a job.
    DB persistence will be added later.
    """
    return {
        "job_id": job_id,
        "user_id": user_id,
        "status": "Application submitted successfully"
    }
