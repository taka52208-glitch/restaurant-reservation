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


class RestaurantSalesResponse(BaseModel):
    """店舗売上レスポンススキーマ"""
    restaurant_id: str
    date_from: datetime | None
    date_to: datetime | None
    total_sales: int
    total_reservations: int
    online_sales: int
    online_reservations: int
    onsite_sales: int
    onsite_reservations: int


class AvailabilityResponse(BaseModel):
    """空席確認レスポンススキーマ"""
    available: bool
    restaurant_id: str
    date: str
    time: str
    party_size: int
    message: str | None = None
