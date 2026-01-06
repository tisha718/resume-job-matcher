
# app/security.py
import os, datetime
from typing import Optional
from fastapi import HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer(auto_error=False)

def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)

def verify_password(plain: str, password_hash: str) -> bool:
    return pwd_context.verify(plain, password_hash)

def create_access_token(subject: str, role: str) -> str:
    now = datetime.datetime.utcnow()
    exp = now + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": subject, "role": role, "iat": now, "exp": exp}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

def get_current_user(
    request: Request,
    creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if creds is None or creds.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="missing bearer token")
    token = creds.credentials
    try:
        payload = decode_token(token)
        email = payload.get("sub")
        role = payload.get("role")
        if not email:
            raise HTTPException(status_code=401, detail="invalid token payload")
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"invalid token: {str(e)}")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="user no longer exists")
    # attach to request for downstream use
    request.state.user = user
    request.state.role = role or user.role
    return user

def require_role(required: str):
    def _inner(
        request: Request,
        current_user: User = Depends(get_current_user)
    ):
        role = getattr(request.state, "role", None) or current_user.role
        if role != required:
            raise HTTPException(status_code=403, detail="forbidden")
        return current_user
    return _inner

