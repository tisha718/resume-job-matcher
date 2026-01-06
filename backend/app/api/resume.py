from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Depends
from sqlalchemy.orm import Session
from fastapi.responses import StreamingResponse
import io

from app.services.text_extraction import extract_text
from app.services.skill_extraction import extract_skills
from app.services.azure_document_intelligence import extract_text_from_image
from app.services.blob_storage import (
    upload_resume_to_blob,
    delete_blob,
    download_resume_from_blob
)

from app.db.session import get_db
from app.db.models import Resume

router = APIRouter(tags=["Resume"])

# ------------------------------------------------------------------
# Existing simple endpoints (DO NOT REMOVE)
# ------------------------------------------------------------------

@router.post("/resume/upload")
async def upload_resume(file: UploadFile = File(...)):
    """
    Basic resume upload (text preview only).
    Stateless endpoint.
    """

    content_type = file.content_type.lower()

    if content_type.startswith("image/"):
        file_bytes = await file.read()
        text = extract_text_from_image(file_bytes)
    else:
        text = extract_text(file)

    return {
        "filename": file.filename,
        "text_length": len(text),
        "preview": text[:300]
    }


@router.post("/resume/extract-skills")
async def extract_resume_skills(file: UploadFile = File(...)):
    """
    Extract skills from resume (stateless).
    """

    content_type = file.content_type.lower()

    if content_type.startswith("image/"):
        file_bytes = await file.read()
        text = extract_text_from_image(file_bytes)
    else:
        text = extract_text(file)

    skills = extract_skills(text)

    return {
        "filename": file.filename,
        "skills": skills,
        "total_skills_found": len(skills)
    }


# ------------------------------------------------------------------
# Candidate Resume Management APIs (Azure Blob + PostgreSQL)
# ------------------------------------------------------------------

@router.post("/candidate/upload-resume")
async def candidate_upload_resume(
    resume: UploadFile = File(...),
    user_id: int = Form(...),
    db: Session = Depends(get_db),
):
    """
    Upload resume to Azure Blob, parse it, extract skills,
    and store metadata in DB.
    """

    try:
        # ✅ READ FILE ONCE
        file_bytes = await resume.read()

        # ✅ Rewind stream for blob upload
        resume.file = io.BytesIO(file_bytes)

        # 1. Upload to Azure Blob
        blob_url = upload_resume_to_blob(resume)

        # 2. Extract text based on file type
        content_type = resume.content_type.lower()

        if content_type.startswith("image/"):
            resume_text = extract_text_from_image(file_bytes)
        else:
            # For PDF/DOCX, recreate UploadFile stream
            resume.file = io.BytesIO(file_bytes)
            resume_text = extract_text(resume)

        skills = extract_skills(resume_text)

        # 3. Store in DB
        new_resume = Resume(
            user_id=user_id,
            filename=resume.filename,
            file_path=blob_url,
            parsed_text=resume_text,
            skills_json=skills
        )

        db.add(new_resume)
        db.commit()
        db.refresh(new_resume)

        return {
            "message": "Resume uploaded and stored successfully",
            "resume_id": new_resume.id,
            "filename": resume.filename,
            "file_url": blob_url,
            "total_skills_found": len(skills),
            "skills": skills
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Resume upload failed: {str(e)}"
        )


@router.get("/candidate/resumes")
def get_all_resumes_for_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    resumes = (
        db.query(Resume)
        .filter(Resume.user_id == user_id)
        .order_by(Resume.created_at.desc())
        .all()
    )

    if not resumes:
        raise HTTPException(
            status_code=404,
            detail="No resumes found for this user"
        )

    return {
        "user_id": user_id,
        "total_resumes": len(resumes),
        "resumes": [
            {
                "resume_id": r.id,
                "filename": r.filename,
                "file_url": r.file_path,
                "total_skills_found": len(r.skills_json) if r.skills_json else 0,
                "uploaded_at": r.created_at
            }
            for r in resumes
        ]
    }


@router.delete("/candidate/resume/{resume_id}")
def delete_candidate_resume(
    resume_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    resume = (
        db.query(Resume)
        .filter(
            Resume.id == resume_id,
            Resume.user_id == user_id
        )
        .first()
    )

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="Resume not found for this user"
        )

    try:
        delete_blob(resume.file_path)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete resume file from storage: {str(e)}"
        )

    db.delete(resume)
    db.commit()

    return {
        "message": "Resume deleted successfully",
        "resume_id": resume_id
    }


@router.get("/candidate/resume/{resume_id}/download")
def download_candidate_resume(
    resume_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    resume = (
        db.query(Resume)
        .filter(
            Resume.id == resume_id,
            Resume.user_id == user_id
        )
        .first()
    )

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="Resume not found for this user"
        )

    try:
        file_bytes = download_resume_from_blob(resume.file_path)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to download resume: {str(e)}"
        )

    return StreamingResponse(
        io.BytesIO(file_bytes),
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": f'attachment; filename="{resume.filename}"'
        }
    )
