from fastapi import FastAPI, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from .schemas import SignupRequest, SignupResponse, LoginRequest, TokenResponse, UserPublic
from .storage import find_by_email, append_user, _read_all
from .auth import hash_password, verify_password, create_access_token

app = FastAPI(title="CSV-backed Auth API")

# CORS (optional)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

# @app.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
# def signup(payload: SignupRequest):
#     existing = find_by_email(payload.email)
#     if existing:
#         # Per your requested wording:
#         return JSONResponse(
#             status_code=status.HTTP_409_CONFLICT,
#             content={"message": "Person already logged in"}
#         )

#     pw_hash = hash_password(payload.password)
#     user_id = append_user(
#         email=payload.email,
#         password_hash=pw_hash,
#         role=payload.role or "candidate",
#         first_name=payload.first_name,
#         last_name=payload.last_name,
#     )
#     return {"message": "Signup successful", "id": user_id}

# app/main.py (inside signup)
@app.post("/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest):
    try:
        existing = find_by_email(payload.email)
        if existing:
            return JSONResponse(
                status_code=status.HTTP_409_CONFLICT,
                content={"message": "Person already logged in"}
            )

        pw_hash = hash_password(payload.password)
        user_id = append_user(
            email=payload.email,
            password_hash=pw_hash,
            role=payload.role or "candidate",
            first_name=payload.first_name,
            last_name=payload.last_name,
        )
        return {"message": "Signup successful", "id": user_id}
    except Exception as exc:
        # Temporary: provide a descriptive 500 for debugging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add user: {type(exc).__name__}: {exc}"
        )


@app.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest):
    existing = find_by_email(payload.email)
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # The CSV currently contains 'hashed_pw' placeholders for many rows; for such rows
    # login will fail until they sign up again to set a real bcrypt hash. [1](https://capgemini-my.sharepoint.com/personal/azhikkagath_sharon-lilly_capgemini_com/_layouts/15/Doc.aspx?sourcedoc=%7B3989CB65-2475-4610-A044-C84123440894%7D&file=users.csv&action=default&mobileredirect=true)
    stored_hash = (existing.get("password_hash") or "").strip()
    if not stored_hash or not stored_hash.startswith("$2b$"):
        # Not a valid bcrypt hash – ask user to reset or re-signup
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password not set or invalid; please sign up or reset")

    if not verify_password(payload.password, stored_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect password")

    token = create_access_token(subject=payload.email)
    return {"access_token": token, "token_type": "bearer"}

@app.get("/users", response_model=list[UserPublic])
def list_users():
    rows, header = _read_all()
    # Map to response model
    result = []
    for r in rows:
        result.append({
            "id": int(r.get("id", "0") or 0),
            "email": r.get("email", ""),
            "role": r.get("role", ""),
            "first_name": r.get("first_name", ""),
            "last_name": r.get("last_name", ""),
            "created_at": r.get("created_at", ""),
        })
    return result
