
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.task import Task
from app.models.user import User
from app.core.security import get_current_user


router = APIRouter(
    prefix="/api/progress",
    tags=["Progress"]
)


@router.get("/")
def get_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_tasks = db.query(Task).filter(
        Task.user_id == current_user.id
    ).count()

    completed_tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.completed == True
    ).count()

    if total_tasks == 0:
        completion_percentage = 0
    else:
        completion_percentage = round(
            (completed_tasks / total_tasks) * 100
        )

    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "completion_percentage": completion_percentage
    }
