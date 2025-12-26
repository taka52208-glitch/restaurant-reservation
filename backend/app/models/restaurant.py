import uuid
from enum import Enum

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class RestaurantStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    INACTIVE = "inactive"


class Restaurant(Base, TimestampMixin):
    __tablename__ = "restaurants"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    owner_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"))
    name: Mapped[str] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    genre: Mapped[str] = mapped_column(String(50))
    area: Mapped[str] = mapped_column(String(100))
    address: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str] = mapped_column(String(20))
    email: Mapped[str] = mapped_column(String(255))
    opening_hours: Mapped[str] = mapped_column(String(100))
    closing_days: Mapped[str | None] = mapped_column(String(100), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default=RestaurantStatus.PENDING.value)

    # Relationships
    owner: Mapped["User"] = relationship(back_populates="store")  # noqa: F821
    seats: Mapped[list["Seat"]] = relationship(back_populates="restaurant", cascade="all, delete")
    reservations: Mapped[list["Reservation"]] = relationship(  # noqa: F821
        back_populates="restaurant"
    )


class Seat(Base, TimestampMixin):
    __tablename__ = "seats"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    restaurant_id: Mapped[str] = mapped_column(String(36), ForeignKey("restaurants.id"))
    name: Mapped[str] = mapped_column(String(50))
    capacity: Mapped[int] = mapped_column()

    # Relationships
    restaurant: Mapped["Restaurant"] = relationship(back_populates="seats")
