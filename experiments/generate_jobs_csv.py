import csv
import random
from datetime import datetime, timedelta

# ---------------- CONFIG ----------------
NUM_JOBS = 300
NUM_RECRUITERS = 10

start_date = datetime(2024, 1, 1)

# ---------------- HELPERS ----------------
def rand_date(days=365):
    return (start_date + timedelta(days=random.randint(0, days))).strftime(
        "%Y-%m-%d %H:%M:%S"
    )

locations = [
    "Bangalore, India",
    "Hyderabad, India",
    "Pune, India",
    "Delhi, India",
    "Mumbai, India",
    "Remote"
]

job_types = ["Full-time", "Part-time", "Internship", "Contract"]

# ---------------- JOB ROLES ----------------
job_roles = [
    "Backend Engineer",
    "Frontend Engineer",
    "Full Stack Engineer",
    "Data Analyst",
    "Data Engineer",
    "Machine Learning Engineer",
    "DevOps Engineer",
    "QA Automation Engineer",
    "Software Engineer",
    "Cloud Engineer",
    "Cybersecurity Analyst",
]

# ---------------- DETAILED DESCRIPTIONS ----------------
job_descriptions = {
    "Backend Engineer": (
        "We are looking for a Backend Engineer with strong experience in Python, "
        "FastAPI or Django, REST APIs, and relational databases such as PostgreSQL. "
        "The role involves designing scalable backend systems, handling authentication, "
        "and integrating third-party services."
    ),
    "Frontend Engineer": (
        "Seeking a Frontend Engineer skilled in React, JavaScript, HTML, CSS, and "
        "modern UI frameworks. Responsibilities include building responsive interfaces, "
        "collaborating with backend teams, and ensuring high-quality user experience."
    ),
    "Full Stack Engineer": (
        "Hiring a Full Stack Engineer with experience in React, backend frameworks "
        "like Django or Node.js, API development, and databases. The candidate should "
        "deliver end-to-end features across the stack."
    ),
    "Data Analyst": (
        "Looking for a Data Analyst with strong skills in SQL, Python, Pandas, and "
        "data visualization tools such as Power BI or Tableau. Responsibilities include "
        "analyzing datasets, building dashboards, and generating business insights."
    ),
    "Data Engineer": (
        "We are hiring a Data Engineer experienced in ETL pipelines, SQL databases, "
        "Python, and data processing systems. Knowledge of data warehousing is a plus."
    ),
    "Machine Learning Engineer": (
        "Seeking a Machine Learning Engineer with experience in Python, machine learning, "
        "scikit-learn, model training, and deployment. Familiarity with NLP and embeddings "
        "is preferred."
    ),
    "DevOps Engineer": (
        "Hiring a DevOps Engineer with hands-on experience in Docker, Kubernetes, "
        "CI/CD pipelines, Jenkins, Git, and cloud platforms such as AWS or Azure."
    ),
    "QA Automation Engineer": (
        "Looking for a QA Automation Engineer with experience in Selenium, Python, "
        "automation frameworks, and CI/CD integration to ensure software quality."
    ),
    "Software Engineer": (
        "We are seeking a Software Engineer proficient in Python or Java, with strong "
        "software development fundamentals, debugging skills, and system design knowledge."
    ),
    "Cloud Engineer": (
        "Hiring a Cloud Engineer with expertise in AWS, Azure, or GCP. Responsibilities "
        "include managing cloud infrastructure, optimizing deployments, and security."
    ),
    "Cybersecurity Analyst": (
        "Looking for a Cybersecurity Analyst with knowledge of cybersecurity, network "
        "security, penetration testing, ethical hacking, and risk assessment."
    ),
}

# ---------------- GENERATE JOBS ----------------
jobs = []

for idx in range(1, NUM_JOBS + 1):
    role = random.choice(job_roles)
    recruiter_id = random.randint(1, NUM_RECRUITERS)

    jobs.append([
        idx,                     # id (SERIAL equivalent for CSV)
        1000 + idx,              # job_id (business identifier)
        recruiter_id,            # recruiter_id
        role,                    # title
        job_descriptions[role],  # description
        random.choice(locations),
        random.choice(job_types),
        rand_date()
    ])

# ---------------- WRITE CSV ----------------
output_path = "./datasets/jobs.csv"

with open(output_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow([
        "id",
        "job_id",
        "recruiter_id",
        "title",
        "description",
        "location",
        "job_type",
        "created_at"
    ])
    writer.writerows(jobs)

print(f"jobs.csv generated successfully at {output_path} with {len(jobs)} records.")
