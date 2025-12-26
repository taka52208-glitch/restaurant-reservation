import uuid
from enum import Enum

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class UserRole(str, Enum):
    CUSTOMER = "customer"
    STORE = "store"
    ADMIN = "admin"


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    name: Mapped[str] = mapped_column(String(100))
    role: Mapped[str] = mapped_column(String(20), default=UserRole.CUSTOMER.value)
    is_active: Mapped[bool] = mapped_column(default=True)

    # Relationships
    reservations: Mapped[list["Reservation"]] = relationship(  # noqa: F821
        back_populates="customer", foreign_keys="Reservation.customer_id"
    )
    store: Mapped["Restaurant"] = relationship(  # noqa: F821
        back_populates="owner", uselist=False
    )
