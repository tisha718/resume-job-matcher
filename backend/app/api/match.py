from fastapi import APIRouter, UploadFile, File, Form
from app.services.text_extraction import extract_text
from app.services.matching_service import resume_job_match
from app.services.matching_service import recommend_jobs_for_resume

router = APIRouter()


@router.post("/resume-job")
async def match_resume_job(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    resume_text = extract_text(resume)

    result = resume_job_match(
        resume_text=resume_text,
        job_text=job_description
    )

    return {
        "filename": resume.filename,
        **result
    }

router = APIRouter()

@router.post("/recommend-jobs")
async def recommend_jobs(resume: UploadFile = File(...)):
    resume_text = extract_text(resume)

    recommendations = recommend_jobs_for_resume(
        resume_text=resume_text,
        top_n=5
    )

    return {
        "filename": resume.filename,
        "recommended_jobs": recommendations
    }
