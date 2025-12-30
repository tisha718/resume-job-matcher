from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    JSON,
)
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


# --------------------------------------------------
# USERS
# --------------------------------------------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    role = Column(String(20), nullable=False)  # candidate / recruiter
    created_at = Column(DateTime, server_default=func.now())


# --------------------------------------------------
# RESUMES (REAL DATA ONLY)
# --------------------------------------------------
class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    filename = Column(String(255), nullable=False)

    # Azure Blob URL
    file_path = Column(Text, nullable=False)

    parsed_text = Column(Text, nullable=True)
    skills_json = Column(JSON, nullable=True)

    created_at = Column(DateTime, server_default=func.now())


# --------------------------------------------------
# JOBS (USED FOR MATCHING)
# --------------------------------------------------
class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)

    location = Column(String(255), nullable=True)
    job_type = Column(String(50), nullable=True)

    created_at = Column(DateTime, server_default=func.now())
