
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.note import Note
from app.models.subject import Subject
from app.models.user import User
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse
from app.core.security import get_current_user


router = APIRouter(
    prefix="/api/notes",
    tags=["Notes"]
)

@router.post(
    "/",
    response_model=NoteResponse,
    status_code=status.HTTP_201_CREATED
)
def create_note(
    note_data: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if note_data.subject_id is not None:
        subject = db.query(Subject).filter(
            Subject.id == note_data.subject_id,
            Subject.user_id == current_user.id
        ).first()

        if subject is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subject not found"
            )

    new_note = Note(
        user_id=current_user.id,
        subject_id=note_data.subject_id,
        title=note_data.title,
        content=note_data.content
    )

    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    return new_note


@router.get("/", response_model=list[NoteResponse])
def get_notes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notes = db.query(Note).filter(
        Note.user_id == current_user.id
    ).all()

    return notes


@router.put("/{note_id}", response_model=NoteResponse)
def update_note(
    note_id: int,
    note_data: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == current_user.id
    ).first()

    if note is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )

    update_data = note_data.model_dump(exclude_unset=True)

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
        setattr(note, field, value)

    db.commit()
    db.refresh(note)

    return note


@router.delete(
    "/{note_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == current_user.id
    ).first()

    if note is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )

    db.delete(note)
    db.commit()

    return None
