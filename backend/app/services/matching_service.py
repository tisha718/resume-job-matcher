from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import Session

from app.db.models import Resume, Job
from app.services.skill_extraction import extract_skills

# -----------------------------
# Load FREE sentence transformer
# -----------------------------
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2", cache_folder = "models", local_files_only = True)


def compute_semantic_similarity(text1: str, text2: str) -> float:
    """
    Compute semantic similarity between resume and job description.
    Returns percentage score.
    """
    embeddings = model.encode([text1, text2])
    score = cosine_similarity(
        [embeddings[0]],
        [embeddings[1]]
    )[0][0]
    return round(score * 100, 2)


def match_resume_to_job(resume_text: str, job_description: str) -> dict:
    """
    Hybrid matching: skills + semantic similarity
    """
    resume_skills = set(extract_skills(resume_text))
    job_skills = set(extract_skills(job_description))

    matched_skills = resume_skills & job_skills
    missing_skills = job_skills - resume_skills

    # Skill score
    if job_skills:
        skill_score = (len(matched_skills) / len(job_skills)) * 100
    else:
        skill_score = 0.0

    # Semantic score
    semantic_score = compute_semantic_similarity(
        resume_text, job_description
    )

    # Final weighted score
    final_score = round(
        0.6 * skill_score + 0.4 * semantic_score,
        2
    )

    return {
        "fit_score": final_score,
        "skill_score": round(skill_score, 2),
        "semantic_score": semantic_score,
        "matched_skills": sorted(matched_skills),
        "missing_skills": sorted(missing_skills),
    }


def recommend_jobs_for_user(
    db: Session,
    user_id: int,
    top_n: int = 5
):
    """
    Fetch resume + jobs from DB and return top matches
    """

    resume = (
        db.query(Resume)
        .filter(Resume.user_id == user_id)
        .order_by(Resume.created_at.desc())
        .first()
    )

    if not resume:
        raise ValueError("Resume not found for user")

    jobs = db.query(Job).all()

    recommendations = []

    for job in jobs:
        result = match_resume_to_job(
            resume_text=resume.parsed_text,
            job_description=job.description
        )

        recommendations.append({
            "job_id": job.id,
            "title": job.title,
            "location": job.location,
            "job_type": job.job_type,
            "fit_score": result["fit_score"],
            "matched_skills": result["matched_skills"],
            "missing_skills": result["missing_skills"],
            "skill_score": result["skill_score"],
            "semantic_score": result["semantic_score"],
        })

    recommendations.sort(
        key=lambda x: x["fit_score"],
        reverse=True
    )

    return recommendations[:top_n]
