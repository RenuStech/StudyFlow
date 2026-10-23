
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, ConfigDict


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    priority: Literal["Low", "Medium", "High"] = "Medium"
    subject_id: int | None = None


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    priority: Literal["Low", "Medium", "High"] | None = None
    subject_id: int | None = None
    completed: bool | None = None


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    subject_id: int | None
    title: str
    priority: str
    completed: bool
    created_at: datetime
    updated_at: datetime
