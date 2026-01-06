# app/main.py
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.api.resume import router as resume_router
from app.api.match import router as candidate_router
from app.api.preparation import router as preparation_router

from app.auth.routes import router as auth_router
from app.auth.deps import get_current_user

app = FastAPI(title="Smart Resume Screening API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Public auth routes
app.include_router(auth_router)

# Protected routes
app.include_router(
    resume_router,
    dependencies=[Depends(get_current_user)],
)
app.include_router(
    candidate_router,
    dependencies=[Depends(get_current_user)],
)
app.include_router(
    preparation_router,
    dependencies=[Depends(get_current_user)],
)

@app.get("/")
def root():
    return {"message": "Smart Resume Screening API is running"}

@app.get("/health")
def health():
    return {"status": "OK"}
