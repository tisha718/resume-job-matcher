from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Resume, Job, Application
from app.services.matching_service import (
    match_resume_to_job,
    compute_semantic_score,
)

router = APIRouter(
    prefix="/api/candidate",
    tags=["Candidate Jobs"]
)

# ==================================================
# 1️⃣ RECOMMENDED JOBS (LEAN, UI-FRIENDLY)
# ==================================================
@router.get("/recommended-jobs")
def get_recommended_jobs(
    user_id: int = Query(...),
    resume_id: int = Query(...),
    limit: int = Query(5, ge=1, le=50),
    db: Session = Depends(get_db),
):
    resume = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == user_id)
        .first()
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # 🔹 Azure semantic scores
    semantic_scores = compute_semantic_score(resume.parsed_text, top_k=50)
    if not semantic_scores:
        return {"recommended_jobs": []}

    jobs = (
        db.query(Job)
        .filter(Job.id.in_(semantic_scores.keys()))
        .all()
    )

    recommendations = []

    for job in jobs:
        skill_result = match_resume_to_job(
            resume_text=resume.parsed_text,
            job_description=job.description
        )

        semantic_score = semantic_scores.get(job.id, 0.0)

        fit_score = round(
            0.6 * skill_result["skill_score"] +
            0.4 * semantic_score,
            2
        )

        # ✅ ONLY what job cards need
        recommendations.append({
            "job_id": job.id,
            "title": job.title,
            "description": job.description,
            "location": job.location,
            "job_type": job.job_type,
            "fit_score": fit_score,
        })

    recommendations.sort(key=lambda x: x["fit_score"], reverse=True)

    return {
        "user_id": user_id,
        "resume_id": resume_id,
        "recommended_jobs": recommendations[:limit]
    }


# ==================================================
# 2️⃣ SKILL ANALYSIS (FULL BREAKDOWN)
# ==================================================
@router.get("/jobs/{job_id}/skill-analysis")
def get_job_skill_analysis(
    job_id: int,
    user_id: int = Query(...),
    resume_id: int = Query(...),
    db: Session = Depends(get_db),
):
    resume = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == user_id)
        .first()
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Skill-based analysis
    skill_result = match_resume_to_job(
        resume_text=resume.parsed_text,
        job_description=job.description
    )

    # Semantic score ONLY for this job
    semantic_scores = compute_semantic_score(resume.parsed_text, top_k=20)
    semantic_score = semantic_scores.get(job_id, 0.0)

    fit_score = round(
        0.6 * skill_result["skill_score"] +
        0.4 * semantic_score,
        2
    )

    # ✅ FULL ANALYSIS (as you demanded)
    return {
        "job_id": job.id,
        "title": job.title,
        "fit_score": fit_score,
        "skill_score": skill_result["skill_score"],
        "semantic_score": semantic_score,
        "matched_skills": skill_result["matched_skills"],
        "missing_skills": skill_result["missing_skills"],
    }


# ==================================================
# 3️⃣ APPLY FOR JOB (SNAPSHOT STORED)
# ==================================================
@router.post("/jobs/{job_id}/apply")
def apply_for_job(
    job_id: int,
    user_id: int = Query(...),
    resume_id: int = Query(...),
    db: Session = Depends(get_db),
):
    resume = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_id == user_id)
        .first()
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    skill_result = match_resume_to_job(
        resume_text=resume.parsed_text,
        job_description=job.description
    )

    semantic_scores = compute_semantic_score(resume.parsed_text, top_k=20)
    semantic_score = semantic_scores.get(job_id, 0.0)

    fit_score = round(
        0.6 * skill_result["skill_score"] +
        0.4 * semantic_score,
        2
    )

    application = Application(
        user_id=user_id,
        job_id=job_id,
        fit_score=fit_score,
        skill_score=skill_result["skill_score"],
        semantic_score=semantic_score,
        matched_skills=skill_result["matched_skills"],
        missing_skills=skill_result["missing_skills"],
        application_status="applied"
    )

    db.add(application)
    db.commit()
    db.refresh(application)

    return {
        "message": "Application submitted successfully",
        "application_id": application.id,
    }
