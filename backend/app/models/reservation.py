import uuid
from datetime import date, time
from enum import Enum

from sqlalchemy import Date, ForeignKey, String, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin


class ReservationStatus(str, Enum):
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class PaymentMethod(str, Enum):
    ONLINE = "online"
    ONSITE = "onsite"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    REFUNDED = "refunded"


class Reservation(Base, TimestampMixin):
    __tablename__ = "reservations"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    customer_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"))
    restaurant_id: Mapped[str] = mapped_column(String(36), ForeignKey("restaurants.id"))
    reservation_date: Mapped[date] = mapped_column(Date)
    reservation_time: Mapped[time] = mapped_column(Time)
    party_size: Mapped[int] = mapped_column()
    status: Mapped[str] = mapped_column(String(20), default=ReservationStatus.CONFIRMED.value)
    payment_method: Mapped[str] = mapped_column(String(20))
    payment_status: Mapped[str] = mapped_column(String(20), default=PaymentStatus.PENDING.value)
    amount: Mapped[int] = mapped_column()  # Amount in JPY
    stripe_payment_intent_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Relationships
    customer: Mapped["User"] = relationship(  # noqa: F821
        back_populates="reservations", foreign_keys=[customer_id]
    )
    restaurant: Mapped["Restaurant"] = relationship(  # noqa: F821
        back_populates="reservations"
    )
