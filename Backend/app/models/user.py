from sqlalchemy import Boolean, Column, DateTime, Integer, String
from datetime import datetime

from app.database.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)

    dark_mode = Column(Boolean, default=False)
    notifications = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)