# app/api/resume.py

from fastapi import APIRouter, UploadFile, File
from app.services.text_extraction import extract_text
from app.services.skill_extraction import extract_skills

router = APIRouter()


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    text = extract_text(file)
    return {
        "filename": file.filename,
        "text_length": len(text),
        "preview": text[:300]
    }


@router.post("/extract-skills")
async def extract_resume_skills(file: UploadFile = File(...)):
    text = extract_text(file)
    skills = extract_skills(text)

    return {
        "filename": file.filename,
        "skills": skills,
        "total_skills_found": len(skills)
    }
