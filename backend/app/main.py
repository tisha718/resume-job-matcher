from fastapi import FastAPI
from app.api.resume import router as resume_router
from app.api.match import router as candidate_router
from .api.recruiter_dashboard import router as recruiter_dashboard
from app.api.preparation import router as preparation_router
from fastapi.middleware.cors import CORSMiddleware
from app.api.recruiter import router as recruiter_router

app = FastAPI(title="Smart Resume Screening API")

# CORS - CRITICAL for frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Resume-related endpoints
app.include_router(resume_router, tags=["Resume"])

# Candidate job matching & applications
app.include_router(candidate_router)

app.include_router(preparation_router)

app.include_router(recruiter_router)

app.include_router(recruiter_dashboard)

@app.get("/")
def read_root():
    return {"message": "Smart Resume Screening API is running!"}

@app.get("/health")
def health_check():
    return {"status": "OK"}
 