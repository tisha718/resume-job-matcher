import csv
import os
from fastapi import HTTPException

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CSV_PATH = os.path.join(BASE_DIR, "datasets", "jobs.csv")

def get_job_description(id: int) -> str:
    if not os.path.exists(CSV_PATH):
        raise HTTPException(status_code=500, detail="jobs.csv not found")

    with open(CSV_PATH, encoding="utf-8") as file:
        reader = csv.DictReader(file)

        for row in reader:
            if int(row["id"]) == id: 
                return row["description"] 

    raise HTTPException(status_code=404, detail="ID not found in jobs.csv")