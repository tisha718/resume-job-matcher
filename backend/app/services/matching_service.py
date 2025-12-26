from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

from app.services.skill_extraction import extract_skills
from app.services.job_loader import load_jobs

def recommend_jobs_for_resume(resume_text: str, top_n: int = 5):
    jobs = load_jobs()
    recommendations = []

    for job in jobs:
        result = resume_job_match(
            resume_text=resume_text,
            job_text=job["description"]
        )

        recommendations.append({
            "job_id": job["job_id"],
            "title": job["title"],
            "location": job["location"],
            "job_type": job["job_type"],
            "fit_score": result["fit_score"],
            "matched_skills": result["matched_skills"],
            "missing_skills": result["missing_skills"],
        })

    # sort by fit score (descending)
    recommendations.sort(key=lambda x: x["fit_score"], reverse=True)

    return recommendations[:top_n]

# Lightweight + fast model (FREE)
model = SentenceTransformer("all-MiniLM-L6-v2")


def compute_similarity(text1: str, text2: str) -> float:
    """
    Returns cosine similarity score between two texts.
    """
    embeddings = model.encode([text1, text2])
    score = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
    return round(score * 100, 2)  # percentage


def resume_job_match(resume_text: str, job_text: str) -> dict:
    """
    Match resume against job description.
    """
    resume_skills = set(extract_skills(resume_text))
    job_skills = set(extract_skills(job_text))

    matched_skills = sorted(resume_skills & job_skills)
    missing_skills = sorted(job_skills - resume_skills)

    fit_score = compute_similarity(resume_text, job_text)

    return {
        "fit_score": fit_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "total_resume_skills": len(resume_skills),
        "total_job_skills": len(job_skills),
    }
