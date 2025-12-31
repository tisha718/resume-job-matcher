from pydantic import BaseModel, Field
from typing import List

class QuestionResponse(BaseModel):
    job_id: int = Field(..., example=1)
    difficulty: str = Field(..., example="medium")
    technical_questions: List[str]
    behavioral_questions: List[str]