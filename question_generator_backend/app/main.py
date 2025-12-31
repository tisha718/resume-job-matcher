from fastapi import FastAPI, Form, HTTPException
from enum import Enum

from app.jobs import get_job_description
from app.prompt import build_prompt
from app.ai import generate_questions

app = FastAPI(title="Interview Question Generator")

class DifficultyLevel(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"

@app.get("/")
def home():
    return {"message": "API is running successfully"}

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

@app.post("/generate-questions")
def generate_questions_api(
    id: int = Form(...),
    difficulty: DifficultyLevel = Form(...)
):
    description = get_job_description(id)

    prompt = build_prompt(description, difficulty.value)

    raw_output = generate_questions(prompt)

    try:
        tech_part = raw_output.split("TECHNICAL:")[1].split("BEHAVIORAL:")[0]
        beh_part = raw_output.split("BEHAVIORAL:")[1]
    except IndexError:
        raise HTTPException(
            status_code=500,
            detail="AI response format invalid. Expected TECHNICAL and BEHAVIORAL sections."
        )

    technical_questions = extract_questions(tech_part)
    behavioral_questions = extract_questions(beh_part)

    if len(technical_questions) < 10 or len(behavioral_questions) < 5:
        raise HTTPException(
            status_code=500,
            detail="AI did not generate the required number of questions"
        )

    #  Return NUMBERED questions
    return {
        "id": id,
        "difficulty": difficulty.value,
        "technical_questions": number_questions(technical_questions[:10]),
        "behavioral_questions": number_questions(behavioral_questions[:5])
    }