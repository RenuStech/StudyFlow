
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class NoteCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    content: str
    subject_id: int | None = None


class NoteUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    content: str | None = None
    subject_id: int | None = None


class NoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    subject_id: int | None
    title: str
    content: str
    created_at: datetime
    updated_at: datetime
