
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    first_name: str = Field(min_length=1)
    last_name: str = Field(min_length=1)
    role: Optional[str] = Field(default="candidate")  # recruiter/candidate

class SignupResponse(BaseModel):
    message: str
    id: Optional[int] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserPublic(BaseModel):
    id: int
    email: EmailStr
    role: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    created_at: str
