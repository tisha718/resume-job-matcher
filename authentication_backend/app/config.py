import os
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "change-this-in-prod")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

DATA_DIR = os.getenv("DATA_DIR", os.path.join(os.path.dirname(os.path.dirname(__file__)), "data"))
USERS_CSV_PATH = os.path.join(DATA_DIR, "users.csv")
