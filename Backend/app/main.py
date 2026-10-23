
import re

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.core.security import (
    get_current_user,
    hash_password,
    verify_password,
    create_access_token,
)
from app.database.database import Base, engine, get_db
from app.models import user, subject, task, session, note
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin

from app.routers.subjects import router as subjects_router
from app.routers.sessions import router as sessions_router
from app.routers.tasks import router as tasks_router
from app.routers.notes import router as notes_router
from app.routers.progress import router as progress_router
from app.routers.dashboard import router as dashboard_router


Base.metadata.create_all(bind=engine)

app = FastAPI(title="StudyFlow API")

# CORS configuration for deployed and local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://study-flow-ma4ee58l2-renu25.vercel.app",
        "https://study-flow-1w9z9getq-renu25.vercel.app",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(subjects_router)
app.include_router(sessions_router)
app.include_router(tasks_router)
app.include_router(notes_router)
app.include_router(progress_router)
app.include_router(dashboard_router)


class UserSettingsUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    dark_mode: bool = False
    notifications: bool = True


@app.get("/api/health")
def health_check():
    return {"message": "StudyFlow Backend is running"}


@app.post("/api/auth/register")
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists",
        )

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registration successful",
        "user_id": new_user.id,
    }


@app.post("/api/auth/login")
def login(
    user_data: UserLogin,
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if not existing_user or not verify_password(
        user_data.password,
        existing_user.hashed_password,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    access_token = create_access_token(
        data={"sub": str(existing_user.id)}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@app.get("/api/auth/me")
def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "dark_mode": bool(current_user.dark_mode),
        "notifications": bool(current_user.notifications),
    }


@app.put("/api/auth/settings")
def update_my_settings(
    settings: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cleaned_name = settings.name.strip()
    cleaned_email = str(settings.email).strip().lower()

    if not cleaned_name:
        raise HTTPException(
            status_code=400,
            detail="Name cannot be empty",
        )

    email_owner = (
        db.query(User)
        .filter(
            User.email == cleaned_email,
            User.id != current_user.id,
        )
        .first()
    )

    if email_owner:
        raise HTTPException(
            status_code=409,
            detail="This email is already used by another account",
        )

    try:
        current_user.name = cleaned_name
        current_user.email = cleaned_email
        current_user.dark_mode = settings.dark_mode
        current_user.notifications = settings.notifications

        db.commit()
        db.refresh(current_user)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Could not save settings. Please check your database columns.",
        )

    return {
        "message": "Settings saved successfully",
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "dark_mode": bool(current_user.dark_mode),
        "notifications": bool(current_user.notifications),
    }
