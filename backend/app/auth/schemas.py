
# app/auth/schemas.py
from pydantic import BaseModel, EmailStr, Field

class SignUpRequest(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str  = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str   = Field(..., min_length=8, max_length=256)
    role: str       = Field("candidate", pattern="^(candidate|recruiter)$")

class UserPublic(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    role: str
