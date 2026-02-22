from fastapi import Depends, APIRouter, Request, Response
from fastapi.exceptions import HTTPException
from ..database import get_db
from sqlalchemy.orm import Session
from ..schemas import ResponseUser, UserCreate
from passlib.context import CryptContext
from .. import models, oauth2
from ..oauth2 import check_authorization
from typing import List
from ..limiter import limiter

router = APIRouter()


@router.get("/")
def home():
    return {"ping": "pong"}


@router.post("/register", status_code=201, tags=["user"])
@limiter.limit("5/minute")
# 2. CHANGE THIS LINE: Change `user: User` to `user: UserCreate` 👇
def create_user(
    request: Request,
    response: Response,
    user: UserCreate,
    db: Session = Depends(get_db),
):
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    # check for same email or username
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username unavailable")
    if len(user.password) < 8:
        raise HTTPException(
            status_code=400, detail="Password must be at least 8 characters"
        )

    hashed_pass = pwd_context.hash(user.password)
    user_data = user.dict()

    # Backend securely hardcodes the role to 2 (Customer)
    user_data["role"] = 2
    user_data["password"] = hashed_pass

    new_user = models.User(**user_data)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate the access token
    access_token = oauth2.create_access_token(
        {"id": new_user.id, "email": new_user.email}
    )

    # Set the cookie so the user is instantly logged in
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        secure=True,
        samesite="Lax",
        max_age=60 * 60,
    )

    return {
        "message": "Registration successful",
        "user": {"username": new_user.username, "role": new_user.role},
    }


@router.get("/me", response_model=ResponseUser, tags=["user"])
def get_info(db: Session = Depends(get_db), user=Depends(oauth2.get_current_user)):
    user_from_db = db.query(models.User).filter(models.User.id == user.id).first()
    if user_from_db is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user_from_db


@router.get(
    "/users", response_model=List[ResponseUser], tags=["user"]
)  # <--- Added response_model
def get_users(db: Session = Depends(get_db), user=Depends(oauth2.get_current_user)):
    check_authorization(user)
    users = db.query(models.User).all()
    return users
