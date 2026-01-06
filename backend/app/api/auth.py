
# app/api/auth.py
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from app.db.security import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

class SignupIn(BaseModel):
    email: EmailStr
    first_name: str | None = None
    last_name: str | None = None
    password: str
    role: str | None = "candidate"  # default

class LoginIn(BaseModel):
    email: EmailStr
    password: str

@router.post("/signup")
def signup(body: SignupIn, db: Session = Depends(get_db)):
    email = body.email.strip().lower()

    # If email exists from CSV → 409 "account already exists"
    csv_hit = db.query(User).filter(User.email == email, User.source == "csv").first()
    if csv_hit:
        raise HTTPException(status_code=409, detail="account already exists")

    exists = db.query(User).filter(User.email == email).first()
    if exists:
        raise HTTPException(status_code=409, detail="email already registered")

    user = User(
        email=email,
        first_name=body.first_name,
        last_name=body.last_name,
        role=body.role if body.role in {"candidate","recruiter"} else "candidate",
        source="local",
        password_hash=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    return {"message": "signup successful"}

@router.post("/login")
def login(body: LoginIn, db: Session = Depends(get_db)):
    email = body.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.password_hash:
        # Either not found or CSV user without a password set
        raise HTTPException(status_code=401, detail="invalid credentials")

    if not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="invalid credentials")

    token = create_access_token(subject=user.email, role=user.role)
    return {"access_token": token, "token_type": "bearer", "expires_in": 60*30}

@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "role": current_user.role,
        "source": current_user.source,
    }
