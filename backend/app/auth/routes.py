from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.db.database import get_db
from .security import Token, create_access_token, verify_password, get_password_hash
from app.db import models
from sqlalchemy.orm import Session
router = APIRouter(prefix="/auth", tags=["auth"])

# Replace with your actual DB user retrieval
# FAKE_USERS_DB = {
#     "alice@example.com": {
#         "email": "alice@example.com",
#         "hashed_password": get_password_hash("secret123"),
#         "scope": "candidate",  # or "admin"
#     }
# }

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # OAuth2 form uses 'username' field for email/username
    user = FAKE_USERS_DB.get(form_data.username)
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect username or password"
        )
    token = create_access_token({"sub": user["email"]})
    return Token(access_token=token)

# Optional signup
@router.post("/signup", response_model=Token)
async def signup(firstname:str,lastname:str,email: str, password: str,role:str,
    # if email in FAKE_USERS_DB:
    #     raise HTTPException(status_code=400, detail="User already exists")
    db: Session = Depends(get_db)):
    user = models.User(
        first_name= firstname,
        last_name = lastname,
        email = email,
        password_hash = get_password_hash(password),
        role = "candidate"
    )
    token = create_access_token({"sub": email, "scope": "candidate"})
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
