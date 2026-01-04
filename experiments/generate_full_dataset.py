import csv
import random
from datetime import datetime, timedelta
import os
import json

# ================= CONFIG =================
NUM_RECRUITERS = 10
NUM_CANDIDATES = 40
NUM_JOBS = 300
NUM_APPLICATIONS = 500

START_DATE = datetime(2024, 1, 1)

APPLICATION_STATUSES = [
    "applied",
    "shortlisted",
    "interviewed",
    "offered",
    "rejected"
]

FIRST_NAMES = [
    "Aarav", "Riya", "Ananya", "Karan", "Neha",
    "Rahul", "Sneha", "Arjun", "Priya", "Vikram"
]

LAST_NAMES = [
    "Sharma", "Verma", "Singh", "Patel", "Gupta",
    "Mehta", "Kumar", "Agarwal", "Jain", "Malhotra"
]

COMPANIES = [
    "Google", "Microsoft", "Amazon", "Flipkart",
    "Infosys", "TCS", "Accenture", "Deloitte",
    "PwC", "Uber"
]

JOB_STATUSES = ["active", "closed"]

# ================= PATH =================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASETS_DIR = os.path.join(BASE_DIR, "datasets")
os.makedirs(DATASETS_DIR, exist_ok=True)

# ================= HELPERS =================
def rand_date(days=180):
    return (
        START_DATE + timedelta(days=random.randint(0, days))
    ).strftime("%Y-%m-%d %H:%M:%S")


# ================= USERS =================
users = []
user_id = 1

# Recruiters
for i in range(NUM_RECRUITERS):
    users.append([
        user_id,
        random.choice(FIRST_NAMES),
        random.choice(LAST_NAMES),
        f"recruiter{i+1}@test.com",
        "hashed_password",
        "recruiter",
        rand_date()
    ])
    user_id += 1

# Candidates
for i in range(NUM_CANDIDATES):
    users.append([
        user_id,
        random.choice(FIRST_NAMES),
        random.choice(LAST_NAMES),
        f"candidate{i+1}@test.com",
        "hashed_password",
        "candidate",
        rand_date()
    ])
    user_id += 1


# ================= JOBS =================
job_titles = [
    "Data Analyst", "Backend Engineer", "Frontend Engineer",
    "Full Stack Engineer", "ML Engineer",
    "DevOps Engineer", "Cloud Engineer", "QA Engineer"
]

# ❗ YOUR GOOD DESCRIPTIONS — KEPT AS IS
job_description_templates = {
    "Data Analyst": (
        "We are looking for a Data Analyst with strong experience in SQL, Python, "
        "and data visualization tools like Power BI and Tableau. The candidate will "
        "analyze large datasets, build dashboards, and support data-driven decisions."
    ),
    "Backend Engineer": (
        "Seeking a Backend Engineer skilled in Python, FastAPI, and PostgreSQL. "
        "You will design scalable APIs, optimize database performance, and work "
        "closely with frontend and DevOps teams."
    ),
    "Frontend Engineer": (
        "We are hiring a Frontend Engineer proficient in React and JavaScript. "
        "You will build responsive UIs, collaborate with designers, and ensure "
        "excellent user experience."
    ),
    "Full Stack Engineer": (
        "Looking for a Full Stack Engineer with experience in React, Node.js, and Python. "
        "The role involves building end-to-end web applications and integrating APIs."
    ),
    "ML Engineer": (
        "Hiring an ML Engineer with expertise in Python, machine learning, and NLP. "
        "You will develop models, work on data pipelines, and deploy AI solutions."
    ),
    "DevOps Engineer": (
        "We are seeking a DevOps Engineer experienced in Docker, Kubernetes, CI/CD, "
        "and cloud platforms like AWS. You will manage infrastructure and deployments."
    ),
    "Cloud Engineer": (
        "Looking for a Cloud Engineer with strong knowledge of AWS or Azure. "
        "You will design cloud architectures and ensure scalability and security."
    ),
    "QA Engineer": (
        "Hiring a QA Engineer with experience in Selenium and automation testing. "
        "You will ensure software quality through test planning and execution."
    )
}

locations = ["Remote", "Bangalore, India", "Delhi, India", "Mumbai, India"]
job_types = ["Full-time", "Part-time", "Contract", "Internship"]

jobs = []
job_id = 1

for _ in range(NUM_JOBS):
    title = random.choice(job_titles)
    recruiter_id = random.randint(1, NUM_RECRUITERS)

    jobs.append([
        job_id,
        recruiter_id,
        title,
        random.choice(COMPANIES),        
        job_description_templates[title],
        random.choice(locations),
        random.choice(job_types),
        random.choice(JOB_STATUSES),     
        rand_date()
    ])
    job_id += 1


# ================= APPLICATIONS =================
ROLE_SKILLS = {
    "Data Analyst": [
        "python", "sql", "pandas", "numpy",
        "data analysis", "data visualization",
        "power bi", "tableau", "excel", "google sheets"
    ],
    "Backend Engineer": [
        "python", "fastapi", "django",
        "postgresql", "rest api", "git"
    ],
    "Frontend Engineer": [
        "javascript", "react", "html", "css"
    ],
    "Full Stack Engineer": [
        "python", "javascript", "react",
        "fastapi", "postgresql", "git"
    ],
    "ML Engineer": [
        "python", "machine learning",
        "deep learning", "scikit-learn",
        "sentiment analysis", "time series analysis"
    ],
    "DevOps Engineer": [
        "docker", "kubernetes", "jenkins", "git", "aws"
    ],
    "Cloud Engineer": [
        "aws", "azure", "gcp", "docker"
    ],
    "QA Engineer": [
        "selenium", "automation testing", "python"
    ],
}

applications = []
application_id = 1

candidate_user_ids = list(
    range(NUM_RECRUITERS + 1, NUM_RECRUITERS + NUM_CANDIDATES + 1)
)

for _ in range(NUM_APPLICATIONS):
    user_id = random.choice(candidate_user_ids)
    job = random.choice(jobs)

    job_id = job[0]
    job_title = job[2]

    all_skills = ROLE_SKILLS[job_title]

    matched_count = random.randint(
        max(1, int(len(all_skills) * 0.6)),
        len(all_skills)
    )

    matched_skills = random.sample(all_skills, matched_count)
    missing_skills = list(set(all_skills) - set(matched_skills))

    skill_score = round((len(matched_skills) / len(all_skills)) * 100, 2)
    semantic_score = round(random.uniform(40, 85), 2)
    fit_score = round(0.6 * skill_score + 0.4 * semantic_score, 2)

    applications.append([
        application_id,
        user_id,
        job_id,
        fit_score,
        skill_score,
        semantic_score,
        json.dumps(matched_skills),
        json.dumps(missing_skills),
        random.choice(APPLICATION_STATUSES),
        rand_date()
    ])

    application_id += 1


# ================= WRITE CSVs =================
def write_csv(filename, header, rows):
    with open(os.path.join(DATASETS_DIR, filename), "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(rows)


write_csv(
    "users.csv",
    ["id", "first_name", "last_name", "email", "password_hash", "role", "created_at"],
    users
)

write_csv(
    "jobs.csv",
    [
        "id",
        "recruiter_id",
        "title",
        "company",
        "description",
        "location",
        "job_type",
        "job_status",
        "created_at"
    ],
    jobs
)

write_csv(
    "applications.csv",
    [
        "id",
        "user_id",
        "job_id",
        "fit_score",
        "skill_score",
        "semantic_score",
        "matched_skills",
        "missing_skills",
        "application_status",
        "applied_at"
    ],
    applications
)

print("✅ Dataset generation complete")
print(f"📁 CSVs written to: {DATASETS_DIR}")
print(" - users.csv")
print(" - jobs.csv")
print(" - applications.csv")
