from fastapi import Depends, Request, Response, status, APIRouter, HTTPException, Body
from ..database import get_db
from sqlalchemy.orm import Session
from ..schemas import Token
from .. import models, utils, oauth2
from passlib.context import CryptContext
from ..limiter import limiter

router = APIRouter()


@router.post("/login", tags=["auth"])
@limiter.limit("5/minute")
def login_user(
    request: Request,
    response: Response,
    user_credentials: dict = Body(...),
    db: Session = Depends(get_db),
):
    username = user_credentials.get("username")
    password = user_credentials.get("password")

    if username is None or password is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required",
        )

    user = db.query(models.User).filter(models.User.email == username).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No user found with this email",
        )

    if not utils.verify_password(password, user.password):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Incorrect password"
        )

    access_token = oauth2.create_access_token({"id": user.id, "email": user.email})
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,  # JavaScript cannot read this
        secure=True,  # Only sends over HTTPS
        samesite="Lax",  # CSRF protection
        max_age=60 * 60,  # 1 Hour
    )

    return {
        "message": "Login successful",
        # Change username to full_name here
        "user": {"full_name": user.full_name, "role": user.role},
    }


# update password
@router.put("/password", tags=["auth"])
def update_password(
    passwords: dict = Body(...),
    db: Session = Depends(get_db),
    user=Depends(oauth2.get_current_user),
):
    old_password = passwords.get("old_password")
    new_password = passwords.get("new_password")
    if old_password is None or new_password is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Old and new password are required",
        )

    user = db.query(models.User).filter(models.User.id == user.id).first()
    if not utils.verify_password(old_password, user.password):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Incorrect password"
        )
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    hashed_pass = pwd_context.hash(new_password)
    user.password = hashed_pass
    db.commit()
    return {"message": "Password updated successfully"}


@router.post("/logout", tags=["auth"])
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out successfully"}
