
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from .config import JWT_SECRET, JWT_ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

def get_current_subject(token: str = Depends(oauth2_scheme)) -> str:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        sub = payload.get("sub")
        if not sub:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return sub
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
