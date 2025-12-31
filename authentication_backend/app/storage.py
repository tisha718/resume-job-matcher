import csv
import os
from datetime import datetime
from filelock import FileLock
from typing import Dict, List, Optional, Tuple
from .config import USERS_CSV_PATH

BASE_HEADERS = ["id", "email", "password_hash", "role", "created_at"]
NEW_HEADERS = ["first_name", "last_name"]
CANONICAL_HEADERS = BASE_HEADERS + NEW_HEADERS

def _trim(s: Optional[str]) -> str:
    return (s or "").strip()

def _ensure_csv_exists_with_headers() -> None:
    os.makedirs(os.path.dirname(USERS_CSV_PATH), exist_ok=True)

    if not os.path.exists(USERS_CSV_PATH):
        with open(USERS_CSV_PATH, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=CANONICAL_HEADERS)
            writer.writeheader()
        return

    # Read raw to inspect header exactly as stored
    with open(USERS_CSV_PATH, "r", newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        rows = list(reader)

    if not rows:
        # empty file – write canonical header
        with open(USERS_CSV_PATH, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=CANONICAL_HEADERS)
            writer.writeheader()
        return

    raw_header = rows[0]
    normalized_header = [h.strip() for h in raw_header]

    # If header already canonical, just return
    if set(normalized_header) == set(CANONICAL_HEADERS):
        # ensure order canonical (even if set matches but order differs)
        if normalized_header != CANONICAL_HEADERS:
            # rewrite rows with canonical order
            data_rows = rows[1:]
            dict_rows = []
            for r in data_rows:
                d = {}
                for i, h in enumerate(normalized_header):
                    d[h] = r[i] if i < len(r) else ""
                dict_rows.append(d)
            with open(USERS_CSV_PATH, "w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=CANONICAL_HEADERS)
                writer.writeheader()
                for d in dict_rows:
                    # fill missing fields
                    for h in CANONICAL_HEADERS:
                        d.setdefault(h, "")
                    writer.writerow(d)
        return

    # Otherwise, migrate: re-map existing rows into canonical headers
    data_rows = rows[1:]
    dict_rows = []
    for r in data_rows:
        d = {}
        for i, h in enumerate(normalized_header):
            key = h.strip()
            val = r[i] if i < len(r) else ""
            d[key] = val.strip()
        # add missing new headers
        for extra in NEW_HEADERS:
            d.setdefault(extra, "")
        dict_rows.append(d)

    # Write with canonical headers
    with open(USERS_CSV_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CANONICAL_HEADERS)
        writer.writeheader()
        for d in dict_rows:
            # normalize required base headers even if spelling was off
            d_norm = {h: _trim(d.get(h, "")) for h in CANONICAL_HEADERS}
            writer.writerow(d_norm)

def _read_all() -> Tuple[List[Dict[str, str]], List[str]]:
    _ensure_csv_exists_with_headers()
    with open(USERS_CSV_PATH, "r", newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        # normalize fieldnames
        fieldnames = [h.strip() for h in (reader.fieldnames or [])]
        rows = []
        for r in reader:
            rows.append({k.strip(): (v or "").strip() for k, v in r.items()})
    return rows, fieldnames

def find_by_email(email: str) -> Optional[Dict[str, str]]:
    rows, _ = _read_all()
    email_norm = _trim(email).lower()
    for r in rows:
        if _trim(r.get("email")).lower() == email_norm:
            return r
    return None

def next_id() -> int:
    rows, _ = _read_all()
    max_id = 0
    for r in rows:
        try:
            max_id = max(max_id, int(_trim(r.get("id")) or "0"))
        except Exception:
            continue
    return max_id + 1

def append_user(email: str, password_hash: str, role: str, first_name: str, last_name: str) -> int:
    _ensure_csv_exists_with_headers()
    lock = FileLock(USERS_CSV_PATH + ".lock")
    with lock:
        rows, header = _read_all()
        uid = next_id()
        created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        record = {
            "id": str(uid),
            "email": _trim(email),
            "password_hash": _trim(password_hash),
            "role": _trim(role or "candidate"),
            "created_at": created_at,
            "first_name": _trim(first_name),
            "last_name": _trim(last_name),
        }

        # Rewrite the whole file: canonical header + existing + new record
        rows.append(record)
        with open(USERS_CSV_PATH, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=CANONICAL_HEADERS)
            writer.writeheader()
            for r in rows:
                row_out = {h: _trim(r.get(h, "")) for h in CANONICAL_HEADERS}
                writer.writerow(row_out)
        return uid