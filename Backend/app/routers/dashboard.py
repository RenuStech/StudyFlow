

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.subject import Subject
from app.models.task import Task
from app.models.session import StudySession
from app.models.note import Note


router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)

@router.get("/")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_subjects = db.query(Subject).filter(
        Subject.user_id == current_user.id
    ).count()

    total_tasks = db.query(Task).filter(
        Task.user_id == current_user.id
    ).count()

    completed_tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.completed == True
    ).count()

    pending_tasks = total_tasks - completed_tasks


    total_sessions = db.query(StudySession).filter(
        StudySession.user_id == current_user.id
    ).count()

    completed_sessions = db.query(StudySession).filter(
        StudySession.user_id == current_user.id,
        StudySession.completed == True
    ).count()


    total_notes = db.query(Note).filter(
        Note.user_id == current_user.id
    ).count()



    return {
        "total_subjects": total_subjects,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks,
        "total_sessions": total_sessions,
        "completed_sessions": completed_sessions,
        "total_notes": total_notes
    }
