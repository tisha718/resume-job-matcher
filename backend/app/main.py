# main.py
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

# Load environment early
from dotenv import load_dotenv
load_dotenv()

# Routers
from app.api.resume import router as resume_router
from app.api.match import router as candidate_router
from app.api.preparation import router as preparation_router

# Auth
from app.auth.deps import get_current_user
from app.auth.routes import router as auth_router
from app.auth.csv_store import preload_csv_users  # ensure CSV loads on startup

app = FastAPI(title="Smart Resume Screening API")

# CORS - CRITICAL for frontend to connect
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

# ---- Public endpoints
@app.get("/", tags=["default"])
def read_root():
    return {"message": "Smart Resume Screening API is running!"}

@app.get("/health", tags=["default"])
def health_check():
    return {"status": "OK"}

# ---- Auth endpoints (public)
app.include_router(auth_router, tags=["auth"])

# ---- Protected business endpoints
app.include_router(resume_router, tags=["Resume"], dependencies=[Depends(get_current_user)])
app.include_router(candidate_router, tags=["Candidate"], dependencies=[Depends(get_current_user)])
app.include_router(preparation_router, tags=["Preparation"], dependencies=[Depends(get_current_user)])

# (Optional) load CSV at startup so first request is fast
# @app.on_event("startup")
# async def startup_event():
#     preload_csv_users()
