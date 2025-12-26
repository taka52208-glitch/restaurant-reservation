from datetime import datetime

from pydantic import BaseModel


class SeatBase(BaseModel):
    name: str
    capacity: int


class SeatCreate(SeatBase):
    pass


class SeatResponse(SeatBase):
    id: str

    class Config:
        from_attributes = True


class RestaurantBase(BaseModel):
    name: str
    description: str | None = None
    genre: str
    area: str
    address: str
    phone: str
    email: str
    opening_hours: str
    closing_days: str | None = None
    image_url: str | None = None


class RestaurantCreate(RestaurantBase):
    pass


class RestaurantUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    genre: str | None = None
    area: str | None = None
    address: str | None = None
    phone: str | None = None
    email: str | None = None
    opening_hours: str | None = None
    closing_days: str | None = None
    image_url: str | None = None


class RestaurantResponse(RestaurantBase):
    id: str
    owner_id: str
    status: str
    created_at: datetime
    updated_at: datetime
    seats: list[SeatResponse] = []

    class Config:
        from_attributes = True


class RestaurantListResponse(BaseModel):
    id: str
    name: str
    description: str | None
    genre: str
    area: str
    opening_hours: str
    image_url: str | None
    status: str

    class Config:
        from_attributes = True
