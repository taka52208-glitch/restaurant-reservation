from datetime import date, datetime, time

from pydantic import BaseModel


class ReservationBase(BaseModel):
    restaurant_id: str
    reservation_date: date
    reservation_time: time
    party_size: int
    payment_method: str
    amount: int
    notes: str | None = None


class ReservationCreate(ReservationBase):
    pass


class ReservationUpdate(BaseModel):
    status: str | None = None
    payment_status: str | None = None


class ReservationResponse(ReservationBase):
    id: str
    customer_id: str
    status: str
    payment_status: str
    stripe_payment_intent_id: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ReservationWithRestaurant(ReservationResponse):
    restaurant_name: str


class ReservationWithCustomer(ReservationResponse):
    customer_name: str
    customer_email: str
