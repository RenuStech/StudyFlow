
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class StudySessionCreate(BaseModel):
    subject_id: int | None = None
    duration: int = Field(gt=0)
    scheduled_for: datetime | None = None


class StudySessionUpdate(BaseModel):
    subject_id: int | None = None
    duration: int | None = Field(default=None, gt=0)
    scheduled_for: datetime | None = None
    completed: bool | None = None


class StudySessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    subject_id: int | None
    duration: int
    scheduled_for: datetime | None
    completed: bool
    completed_at: datetime | None
