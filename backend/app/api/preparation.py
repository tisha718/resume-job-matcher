# app/api/preparation.py

from fastapi import APIRouter, Depends, HTTPException, Query
from enum import Enum
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import Job
from app.core.prompts import build_prompt
from app.services.question_generator import generate_interview_questions

router = APIRouter(
    prefix="/candidate",
    tags=["Interview Preparation"]
)


class DifficultyLevel(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


def extract_questions(section_text: str):
    lines = section_text.splitlines()
    questions = []

    for line in lines:
        line = line.strip()
        if line and line[0].isdigit():
            parts = line.split(".", 1)
            if len(parts) == 2:
                questions.append(parts[1].strip())

    return questions


def number_questions(questions: list):
    return [f"{i + 1}. {q}" for i, q in enumerate(questions)]


@router.get("/jobs/{job_id}/prepare")
def prepare_for_job(
    job_id: int,
    difficulty: DifficultyLevel = Query(DifficultyLevel.medium),
    db: Session = Depends(get_db),
):
    """
    Generate interview questions for a job using Azure Foundry (DeepSeek)
    """

    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    prompt = build_prompt(job.description, difficulty.value)
    raw_output = generate_interview_questions(prompt)

    try:
        tech_part = raw_output.split("TECHNICAL:")[1].split("BEHAVIORAL:")[0]
        beh_part = raw_output.split("BEHAVIORAL:")[1]
    except IndexError:
        raise HTTPException(
            status_code=500,
            detail="AI response format invalid"
        )

    technical_questions = extract_questions(tech_part)
    behavioral_questions = extract_questions(beh_part)

    if len(technical_questions) < 10 or len(behavioral_questions) < 5:
        raise HTTPException(
            status_code=500,
            detail="AI did not generate required number of questions"
        )

    return {
        "job_id": job_id,
        "difficulty": difficulty.value,
        "technical_questions": number_questions(technical_questions[:10]),
        "behavioral_questions": number_questions(behavioral_questions[:5])
    }
