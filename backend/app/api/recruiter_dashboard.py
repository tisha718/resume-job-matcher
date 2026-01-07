from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db
from app.db.models import Application, User
from app.auth.deps import get_current_user
from app.auth.security import TokenData


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)

# ==================================================
# 🔐 Helper: recruiter-only guard
# ==================================================
def ensure_recruiter(current_user: TokenData):
    if current_user.scope != "recruiter":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Recruiter access required",
        )


# ==================================================
# 1️⃣ OVERALL APPLICATION SUMMARY
# ==================================================
@router.get("/summary")
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
):
    ensure_recruiter(current_user)

    total = db.query(Application).count()

    status_counts = (
        db.query(Application.application_status, func.count(Application.id))
        .group_by(Application.application_status)
        .all()
    )

    response = {
        "total_applications": total,
        "applied": 0,
        "shortlisted": 0,
        "interviewed": 0,
        "offered": 0,
        "rejected": 0,
    }

    for status_name, count in status_counts:
        if status_name in response:
            response[status_name] = count

    return response


# ==================================================
# 2️⃣ APPLICATION SUMMARY FOR A PARTICULAR JOB
# ==================================================
@router.get("/particular-job/applications-summary")
def get_particular_job_application_summary(
    job_id: int = Query(..., gt=0),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
):
    ensure_recruiter(current_user)

    total = (
        db.query(Application)
        .filter(Application.job_id == job_id)
        .count()
    )

    status_counts = (
        db.query(Application.application_status, func.count(Application.id))
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
        "rejected": 0,
    }

    for status_name, count in status_counts:
        if status_name in response:
            response[status_name] = count

    return response


# ==================================================
# 3️⃣ OVERALL FIT SCORE DISTRIBUTION (ALL JOBS)
# ==================================================
@router.get("/overall-job-fit-score-distribution")
def overall_fit_score_distribution(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
):
    ensure_recruiter(current_user)

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
            "strong": strong,
            "good": good,
            "average": average,
        },
    }


# ==================================================
# 4️⃣ JOB-WISE FIT SCORE DISTRIBUTION
# ==================================================
@router.get("/{job_id}/fit-score-distribution")
def job_fit_score_distribution(
    job_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
):
    ensure_recruiter(current_user)

    applications = (
        db.query(Application)
        .filter(Application.job_id == job_id)
        .all()
    )

    if not applications:
        raise HTTPException(
            status_code=404,
            detail="No applications found for this job",
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
            "strong": strong,
            "good": good,
        },
    }


# ==================================================
# 5️⃣ UPDATE APPLICATION STATUS
# ==================================================
@router.put("/{application_id}/status")
def update_application_status(
    application_id: int = Path(..., gt=0),
    status: str = Query(...),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
):
    ensure_recruiter(current_user)

    allowed_statuses = [
        "applied",
        "shortlisted",
        "interviewed",
        "offered",
        "rejected",
    ]

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Allowed values: {allowed_statuses}",
        )

    application = (
        db.query(Application)
        .filter(Application.id == application_id)
        .first()
    )

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found",
        )

    old_status = application.application_status
    application.application_status = status

    db.commit()
    db.refresh(application)

    return {
        "application_id": application_id,
        "old_status": old_status,
        "new_status": status,
        "message": "Application status updated successfully",
    }


# ==================================================
# 6️⃣ GET ALL APPLICATIONS FOR A JOB (WITH USER DETAILS)
# ==================================================
@router.get("/{job_id}/applications")
def get_applications_for_job(
    job_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
):
    ensure_recruiter(current_user)

    results = (
        db.query(Application, User)
        .join(User, Application.user_id == User.id)
        .filter(Application.job_id == job_id)
        .all()
    )

    if not results:
        raise HTTPException(
            status_code=404,
            detail="No applications found for this job",
        )

    applications = []

    for app, user in results:
        applications.append({
            "user_id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "job_id": app.job_id,
            "fit_score": app.fit_score,
            "skill_score": app.skill_score,
            "semantic_score": app.semantic_score,
            "matched_skills": app.matched_skills,
            "missing_skills": app.missing_skills,
            "application_status": app.application_status,
            "applied_at": app.applied_at,
        })

    return {
        "job_id": job_id,
        "total_applications": len(applications),
        "applications": applications,
    }
