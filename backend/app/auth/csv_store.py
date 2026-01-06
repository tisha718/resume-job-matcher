
# app/auth/csv_store.py
import os, csv
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, Optional

CSV_PATH = os.getenv("USERS_CSV_PATH", "data/users.csv")

@dataclass
class CsvUser:
    id: int
    first_name: str
    last_name: str
    email: str
    password_hash: str
    role: str
    created_at: datetime

_USERS_BY_EMAIL: Dict[str, CsvUser] = {}

def preload_csv_users():
    global _USERS_BY_EMAIL
    _USERS_BY_EMAIL = {}
    path = CSV_PATH
    if not os.path.exists(path):
        return
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                created = row.get("created_at") or row.get("createdAt") or ""
                created_dt = None
                if created:
                    # Try both “YYYY-MM-DD HH:MM:SS” and ISO formats
                    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"):
                        try:
                            created_dt = datetime.strptime(created, fmt)
                            break
                        except ValueError:
                            pass
                user = CsvUser(
                    id=int(row.get("id", "0") or 0),
                    first_name=row.get("first_name") or row.get("firstName") or "",
                    last_name=row.get("last_name") or row.get("lastName") or "",
                    email=(row.get("email") or "").strip().lower(),
                    password_hash=(row.get("password_hash") or "").strip(),
                    role=(row.get("role") or "candidate").strip(),
                    created_at=created_dt or datetime.utcnow(),
                )
                if user.email:
                    _USERS_BY_EMAIL[user.email] = user
            except Exception:
                # skip malformed rows
                continue

def get_csv_user(email: str) -> Optional[CsvUser]:
    if not _USERS_BY_EMAIL:
        preload_csv_users()
    return _USERS_BY_EMAIL.get(email.strip().lower())
