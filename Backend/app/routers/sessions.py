
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.session import StudySession
from app.models.subject import Subject
from app.models.user import User
from app.schemas.study_session import (
    StudySessionCreate,
    StudySessionUpdate,
    StudySessionResponse
)
from app.core.security import get_current_user


router = APIRouter(
    prefix="/api/sessions",
    tags=["Study Sessions"]
)


# Create a study session
@router.post(
    "/",
    response_model=StudySessionResponse,
    status_code=status.HTTP_201_CREATED
)
def create_session(
    session_data: StudySessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if session_data.subject_id is not None:
        subject = db.query(Subject).filter(
            Subject.id == session_data.subject_id,
            Subject.user_id == current_user.id
        ).first()

        if subject is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subject not found"
            )

    new_session = StudySession(
        user_id=current_user.id,
        subject_id=session_data.subject_id,
        duration=session_data.duration,
        scheduled_for=session_data.scheduled_for
    )

    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return new_session


@router.get("/", response_model=list[StudySessionResponse])
def get_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sessions = db.query(StudySession).filter(
        StudySession.user_id == current_user.id
    ).all()

    return sessions


@router.put("/{session_id}", response_model=StudySessionResponse)
def update_session(
    session_id: int,
    session_data: StudySessionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    study_session = db.query(StudySession).filter(
        StudySession.id == session_id,
        StudySession.user_id == current_user.id
    ).first()

    if study_session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study session not found"
        )

    update_data = session_data.model_dump(exclude_unset=True)

    if (
        "subject_id" in update_data
        and update_data["subject_id"] is not None
    ):
        subject = db.query(Subject).filter(
            Subject.id == update_data["subject_id"],
            Subject.user_id == current_user.id
        ).first()

        if subject is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subject not found"
            )

    for field, value in update_data.items():
        setattr(study_session, field, value)

    if update_data.get("completed") is True:
        if not study_session.completed:
            study_session.completed_at = datetime.now(timezone.utc)
    elif update_data.get("completed") is False:
        study_session.completed_at = None

    db.commit()
    db.refresh(study_session)

    return study_session


@router.delete(
    "/{session_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    study_session = db.query(StudySession).filter(
        StudySession.id == session_id,
        StudySession.user_id == current_user.id
    ).first()

    if study_session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Study session not found"
        )

    db.delete(study_session)
    db.commit()

    return None
