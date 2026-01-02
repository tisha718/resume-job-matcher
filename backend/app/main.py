from fastapi import FastAPI
from app.api.resume import router as resume_router
from app.api.match import router as candidate_router
from app.api.preparation import router as preparation_router
from app.api.recruiter import router as recruiter_router

app = FastAPI(title="Smart Resume Screening API")

# Resume-related endpoints
app.include_router(resume_router, tags=["Resume"])

# Candidate job matching & applications
app.include_router(candidate_router)

app.include_router(preparation_router)


app.include_router(recruiter_router)


@app.get("/health")
def health_check():
    return {"status": "OK"}
