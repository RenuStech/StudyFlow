from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from datetime import datetime
from app.database.database import Base

class Subject(Base):
    __tablename__ = "subjects"

    id=Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete = "CASCADE"),
        nullable=False
    )

    name = Column(String, nullable=False)
    icon = Column(String, nullable =False)
    color = Column(String, nullable=False)

    progress =Column(Integer,default=0)

    created_at = Column(DateTime,default=datetime.utcnow)