import csv

JOBS_CSV_PATH = "../datasets/jobs.csv"


def load_jobs():
    jobs = []

    with open(JOBS_CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            jobs.append(row)

    return jobs
