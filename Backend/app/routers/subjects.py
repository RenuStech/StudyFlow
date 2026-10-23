
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.subject import Subject
from app.models.user import User
from app.schemas.subject import (
    SubjectCreate,
    SubjectUpdate,
    SubjectResponse
)
from app.core.security import get_current_user


router = APIRouter(
    prefix="/api/subjects",
    tags=["Subjects"]
)


@router.post(
    "/",
    response_model=SubjectResponse,
    status_code=status.HTTP_201_CREATED
)
def create_subject(
    subject_data: SubjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing_subject = db.query(Subject).filter(
        Subject.user_id == current_user.id,
        Subject.name == subject_data.name
    ).first()

    if existing_subject:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already have a subject with this name"
        )

    new_subject = Subject(
        user_id=current_user.id,
        name=subject_data.name,
        icon=subject_data.icon,
        color=subject_data.color
    )

    db.add(new_subject)
    db.commit()
    db.refresh(new_subject)

    return new_subject


@router.get("/", response_model=list[SubjectResponse])
def get_subjects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    subjects = db.query(Subject).filter(
        Subject.user_id == current_user.id
    ).all()

    return subjects


@router.put("/{subject_id}", response_model=SubjectResponse)
def update_subject(
    subject_id: int,
    subject_data: SubjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    subject = db.query(Subject).filter(
        Subject.id == subject_id,
        Subject.user_id == current_user.id
    ).first()

    if subject is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found"
        )

    update_data = subject_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(subject, field, value)

    db.commit()
    db.refresh(subject)

    return subject



@router.delete(
    "/{subject_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    subject = db.query(Subject).filter(
        Subject.id == subject_id,
        Subject.user_id == current_user.id
    ).first()

    if subject is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found"
        )

    db.delete(subject)
    db.commit()

    return None
