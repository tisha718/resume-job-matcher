from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db
from app.db.models import Application # make sure this exists

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)

# TOTAL APPLICATIONS & STATUS COUNTS   
 
@router.get("/summary")
def dashboard_summary(db: Session = Depends(get_db)):
    total = db.query(Application).count()

    status_counts = (
        db.query(Application.application_status, func.count(Application.id))
        .group_by(Application.application_status)
        .all()
    )

    # Default values
    response = { 
        "total_applications": total,
        "applied": 0,
        "shortlisted": 0,
        "interviewed": 0,
        "offered": 0,
        "rejected": 0
    }

    for status, count in status_counts:
        if status in response:
            response[status] = count

    return response

# TOTAL APPLICATIONS & STATUS COUNTS FOR A PARTICULAR JOB

@router.get("/particular-job/applications-summary")
def get_particular_job_application_summary(
    job_id: int,
    db: Session = Depends(get_db)
):
    total = (
        db.query(Application)
        .filter(Application.job_id == job_id)
        .count()
    )

    status_counts = (
        db.query(
            Application.application_status,
            func.count(Application.id)
        )
        .filter(Application.job_id == job_id)
        .group_by(Application.application_status)
        .all()
    )

    response = {
        "job_id": job_id,
        "total_applications": total,
        "applied": 0,
        "shortlisted": 0,
        "interviewed": 0,
        "offered": 0,
        "rejected": 0
    }

    for status, count in status_counts:
        if status in response:
            response[status] = count

    return response

# OVERALL JOB FIT-SCORE DISTRIBUTION

@router.get("/Overall job fit-score-distribution")
def fit_score_distribution(db: Session = Depends(get_db)):
    applications = db.query(Application).all()

    strong = 0
    good = 0
    average = 0

    for app in applications:
        if app.fit_score >= 80:
            strong += 1
        elif app.fit_score >= 60:
            good += 1
        else:
            average += 1

    return {
        "total_applications": len(applications),
        "fit_score_distribution": {
            "strong (>=80)": strong,
            "good (60-79)": good
        }
    }

# JOB-WISE FIT-SCORE DISTRIBUTION

@router.get("/{job_id}/fit-score-distribution")
def job_fit_score_distribution(
    job_id: int,
    db: Session = Depends(get_db)
):
    applications = (
        db.query(Application)
        .filter(Application.job_id == job_id)
        .all()
    )

    if not applications:
        raise HTTPException(
            status_code=404,
            detail="No applications found for this job"
        )

    strong = 0
    good = 0

    for app in applications:
        if app.fit_score >= 80:
            strong += 1
        elif app.fit_score >= 60:
            good += 1

    return {
        "job_id": job_id,
        "fit_score_distribution": {
            "strong (>=80)": strong,
            "good (60-79)": good
        }
    }

# UPDATE APPLICATION STATUS

@router.put("/{application_id}/status")
def update_application_status(
    application_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    allowed_statuses = [
        "applied",
        "shortlisted",
        "interviewed",
        "offered",
        "rejected"
    ]

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Allowed values: {allowed_statuses}"
        )

    application = (
        db.query(Application)
        .filter(Application.id == application_id)
        .first()
    )

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    old_status = application.application_status
    application.application_status = status

    db.commit()
    db.refresh(application)

    return {
        "application_id": application_id,
        "old_status": old_status,
        "new_status": status,
        "message": "Application status updated successfully"
    }

# WHOLE status update for a particular job

@router.get("/{job_id}/applications")
def get_applications_for_job(
    job_id: int,
    db: Session = Depends(get_db)
):
    applications = (
        db.query(Application)
        .filter(Application.job_id == job_id)
        .all()
    )

    if not applications:
        raise HTTPException(
            status_code=404,
            detail="No applications found for this job"
        )

    application_list = []

    for app in applications:
        application_list.append({
            "user_id": app.user_id,
            "job_id": app.job_id,
            "fit_score": app.fit_score,
            "skill_score": app.skill_score,
            "semantic_score": app.semantic_score,
            "matched_skills": app.matched_skills,
            "missing_skills": app.missing_skills,
            "application_status": app.application_status,
            "applied_at": app.applied_at
        })

    return {
        "job_id": job_id,
        "total_applications": len(application_list),
        "applications": application_list
    }
