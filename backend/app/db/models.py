from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    JSON,
    Float,
)
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base

from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, CheckConstraint, func


Base = declarative_base()


# --------------------------------------------------
# USERS
# --------------------------------------------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name  = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    role = Column(String(20), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    __table_args__ = (
        CheckConstraint("role IN ('candidate','recruiter')", name="users_role_check"),
    )

# --------------------------------------------------
# RESUMES
# --------------------------------------------------
class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    filename = Column(String(255), nullable=False)
    file_path = Column(Text, nullable=False)   # Azure Blob URL

    parsed_text = Column(Text)
    skills_json = Column(JSON)

    created_at = Column(DateTime, server_default=func.now())


# --------------------------------------------------
# JOBS
# --------------------------------------------------
class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)

    company = Column(String(255), nullable=True)    
    job_status = Column(String(50), nullable=False)

    location = Column(String(255))
    job_type = Column(String(50))

    created_at = Column(DateTime, server_default=func.now())


# --------------------------------------------------
# APPLICATIONS (NO resume_id ❌)
# --------------------------------------------------
class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)

    fit_score = Column(Float, nullable=False)
    skill_score = Column(Float, nullable=False)
    semantic_score = Column(Float, nullable=False)

    matched_skills = Column(JSON)
    missing_skills = Column(JSON)

    application_status = Column(String(50), default="applied")
    applied_at = Column(DateTime, server_default=func.now())
