from fastapi import FastAPI
from app.api.resume import router as resume_router
from app.api.match import router as match_router

app = FastAPI(title="Smart Resume Screening API")

app.include_router(resume_router, prefix="/resume", tags=["Resume"])
app.include_router(match_router, prefix="/match", tags=["Matching"])


@app.get("/health")
def health_check():
    return {"status": "OK"}
