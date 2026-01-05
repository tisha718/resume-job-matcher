from sqlalchemy.orm import Session

from app.db.models import Resume, Job
from app.services.skill_extraction import extract_skills
from app.services.azure_search_client import search_client


# --------------------------------------------------
# Azure AI Search semantic similarity
# --------------------------------------------------
def compute_semantic_score(resume_text: str, top_k: int = 10) -> dict:
    safe_resume_text = resume_text[:1500]

    results = list(search_client.search(
        search_text=safe_resume_text,
        top=top_k,
        include_total_count=False
    ))

    if not results:
        return {}

    # 🔑 Normalize against the best match
    max_raw_score = max(r["@search.score"] for r in results)

    semantic_scores = {}

    for r in results:
        job_id = int(r["job_id"])
        raw_score = r["@search.score"]

        normalized_score = (raw_score / max_raw_score) * 100
        semantic_scores[job_id] = round(normalized_score, 2)

    return semantic_scores

# --------------------------------------------------
# Skill-only Resume ↔ Job Matching
# --------------------------------------------------
def match_resume_to_job(resume_text: str, job_description: str) -> dict:
    """
    Skill-based matching only.
    Semantic relevance comes from Azure AI Search.
    """

    resume_skills = set(extract_skills(resume_text))
    job_skills = set(extract_skills(job_description))

    matched_skills = resume_skills & job_skills
    missing_skills = job_skills - resume_skills

    if job_skills:
        skill_score = (len(matched_skills) / len(job_skills)) * 100
    else:
        skill_score = 0.0

    return {
        "skill_score": round(skill_score, 2),
        "matched_skills": sorted(matched_skills),
        "missing_skills": sorted(missing_skills),
    }


# --------------------------------------------------
# Recommend jobs for a selected resume (DB + Azure)
# --------------------------------------------------
def recommend_jobs_for_resume(
    db: Session,
    user_id: int,
    resume_id: int,
    limit: int = 5
):
    """
    1. Fetch resume from DB
    2. Query Azure AI Search for semantic ranking
    3. Merge with skill-based scoring
    """

    resume = (
        db.query(Resume)
        .filter(
            Resume.id == resume_id,
            Resume.user_id == user_id
        )
        .first()
    )

    if not resume:
        raise ValueError("Resume not found for user")

    semantic_scores = compute_semantic_score(
        resume.parsed_text,
        top_k=50
    )

    if not semantic_scores:
        return []

    jobs = (
        db.query(Job)
        .filter(Job.id.in_(semantic_scores.keys()))
        .all()
    )

    recommendations = []

    for job in jobs:
        skill_result = match_resume_to_job(
            resume_text=resume.parsed_text,
            job_description=job.description
        )

        semantic_score = semantic_scores.get(job.id, 0.0)

        fit_score = round(
            0.6 * skill_result["skill_score"] +
            0.4 * semantic_score,
            2
        )

        recommendations.append({
            "job_id": job.id,
            "title": job.title,
            "description": job.description,
            "location": job.location,
            "job_type": job.job_type,
            "fit_score": fit_score,
            "skill_score": skill_result["skill_score"],
            "semantic_score": semantic_score,
            "matched_skills": skill_result["matched_skills"],
            "missing_skills": skill_result["missing_skills"],
        })

    recommendations.sort(
        key=lambda x: x["fit_score"],
        reverse=True
    )

    return recommendations[:limit]
