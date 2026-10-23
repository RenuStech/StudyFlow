from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer

from app.database.database import Base


class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    subject_id = Column(
        Integer,
        ForeignKey("subjects.id", ondelete="SET NULL"),
        nullable=True
    )

    duration = Column(Integer, nullable=False)
    scheduled_for = Column(DateTime, nullable=True)

    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)