import csv
import random
from datetime import datetime, timedelta
import os

# ================= CONFIG =================
NUM_RECRUITERS = 10
NUM_CANDIDATES = 40
NUM_JOBS = 300

START_DATE = datetime(2024, 1, 1)

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

job_descriptions = {
    "Data Analyst": "SQL, Python, Pandas, Power BI, Tableau",
    "Backend Engineer": "Python, FastAPI, PostgreSQL, APIs",
    "Frontend Engineer": "React, JavaScript, UI Development",
    "Full Stack Engineer": "React, Node.js, Python, Databases",
    "ML Engineer": "Python, NLP, Machine Learning",
    "DevOps Engineer": "Docker, Kubernetes, CI/CD, AWS",
    "Cloud Engineer": "AWS, Azure, Cloud Infrastructure",
    "QA Engineer": "Selenium, Automation Testing"
}

locations = ["Remote", "Bangalore, India", "Delhi, India", "Mumbai, India"]
job_types = ["Full-time", "Part-time", "Contract", "Internship"]

jobs = []
job_id = 1

for _ in range(NUM_JOBS):
    title = random.choice(job_titles)
    recruiter_id = random.randint(1, NUM_RECRUITERS)  # FK-safe

    jobs.append([
        job_id,
        recruiter_id,
        title,
        job_descriptions[title],
        random.choice(locations),
        random.choice(job_types),
        rand_date()
    ])
    job_id += 1

# ================= WRITE CSVs =================
def write_csv(filename, header, rows):
    with open(os.path.join(DATASETS_DIR, filename), "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(rows)

write_csv(
    "users.csv",
    ["id", "email", "password_hash", "role", "created_at"],
    users
)

write_csv(
    "jobs.csv",
    ["id", "recruiter_id", "title", "description", "location", "job_type", "created_at"],
    jobs
)

print("✅ Dataset generation complete")
print(f"📁 CSVs written to: {DATASETS_DIR}")
print(" - users.csv")
print(" - jobs.csv")
