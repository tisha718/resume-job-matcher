# app/auth/routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.auth.deps import get_current_user

from app.db.session import get_db
from app.db import models
from .security import (
    Token,
    create_access_token,
    verify_password,
    get_password_hash,
)

router = APIRouter(tags=["Auth"])

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    email = form_data.username.lower()   # ✅ FIX HERE

    user = (
        db.query(models.User)
        .filter(models.User.email == email)
        .first()
    )

    if not user or not verify_password(
        form_data.password, user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    token = create_access_token(
        {"sub": user.email, "scope": user.role}
    )

    return Token(access_token=token)


@router.post("/signup", response_model=Token)
async def signup(
    firstname: str,
    lastname: str,
    email: str,
    password: str,
    role: str,
    db: Session = Depends(get_db),
):
    email = email.lower()   # ✅ FIX HERE

    if role not in ("candidate", "recruiter"):
        raise HTTPException(
            status_code=400,
            detail="Invalid role",
        )

    existing_user = (
        db.query(models.User)
        .filter(models.User.email == email)
        .first()
    )
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    user = models.User(
        first_name=firstname,
        last_name=lastname,
        email=email,
        password_hash=get_password_hash(password),
        role=role,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(
        {"sub": user.email, "scope": user.role}
    )

    return Token(access_token=token)

@router.post("/logout")
async def logout(current_user = Depends(get_current_user)):
    """
    JWT logout is handled on the client side.
    Backend simply confirms logout.
    """
    return {
        "message": "Logout successful. Please delete token on client."
    }