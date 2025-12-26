from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import require_role
from app.db.session import get_db
from app.models.reservation import Reservation
from app.models.restaurant import Restaurant, RestaurantStatus
from app.models.user import User
from app.schemas.restaurant import RestaurantListResponse
from app.services.restaurant import restaurant_service

router = APIRouter()


@router.get("/restaurants", response_model=list[RestaurantListResponse])
async def list_all_restaurants(
    db: Annotated[AsyncSession, Depends(get_db)],
    _current_user: Annotated[User, Depends(require_role(["admin"]))],
    status_filter: str | None = None,
    skip: int = 0,
    limit: int = 100,
) -> list[RestaurantListResponse]:
    restaurants = await restaurant_service.get_list(
        db, skip=skip, limit=limit, status=status_filter
    )
    return [RestaurantListResponse.model_validate(r) for r in restaurants]


@router.put("/restaurants/{restaurant_id}/approve", response_model=RestaurantListResponse)
async def approve_restaurant(
    restaurant_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    _current_user: Annotated[User, Depends(require_role(["admin"]))],
) -> RestaurantListResponse:
    restaurant = await restaurant_service.get(db, id=restaurant_id)
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="店舗が見つかりません",
        )

    restaurant = await restaurant_service.update_status(
        db, db_obj=restaurant, status=RestaurantStatus.ACTIVE.value
    )
    return RestaurantListResponse.model_validate(restaurant)


@router.put("/restaurants/{restaurant_id}/suspend", response_model=RestaurantListResponse)
async def suspend_restaurant(
    restaurant_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    _current_user: Annotated[User, Depends(require_role(["admin"]))],
) -> RestaurantListResponse:
    restaurant = await restaurant_service.get(db, id=restaurant_id)
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="店舗が見つかりません",
        )

    restaurant = await restaurant_service.update_status(
        db, db_obj=restaurant, status=RestaurantStatus.INACTIVE.value
    )
    return RestaurantListResponse.model_validate(restaurant)


@router.get("/sales/summary")
async def get_sales_summary(
    db: Annotated[AsyncSession, Depends(get_db)],
    _current_user: Annotated[User, Depends(require_role(["admin"]))],
    date_from: date | None = None,
    date_to: date | None = None,
) -> dict:
    query = select(
        func.count(Reservation.id).label("total_reservations"),
        func.sum(Reservation.amount).label("total_sales"),
    ).where(Reservation.status != "cancelled")

    if date_from:
        query = query.where(Reservation.reservation_date >= date_from)
    if date_to:
        query = query.where(Reservation.reservation_date <= date_to)

    result = await db.execute(query)
    row = result.one()

    # Get active restaurant count
    restaurant_count = await db.execute(
        select(func.count(Restaurant.id)).where(
            Restaurant.status == RestaurantStatus.ACTIVE.value
        )
    )
    active_restaurants = restaurant_count.scalar() or 0

    total_reservations = row.total_reservations or 0
    total_sales = row.total_sales or 0

    return {
        "total_sales": total_sales,
        "total_reservations": total_reservations,
        "active_restaurants": active_restaurants,
        "average_per_restaurant": (
            total_sales // active_restaurants if active_restaurants > 0 else 0
        ),
    }


@router.get("/sales/by-restaurant")
async def get_sales_by_restaurant(
    db: Annotated[AsyncSession, Depends(get_db)],
    _current_user: Annotated[User, Depends(require_role(["admin"]))],
    date_from: date | None = None,
    date_to: date | None = None,
    limit: int = 10,
) -> list[dict]:
    query = (
        select(
            Restaurant.id,
            Restaurant.name,
            func.count(Reservation.id).label("reservations"),
            func.sum(Reservation.amount).label("sales"),
        )
        .join(Reservation, Restaurant.id == Reservation.restaurant_id)
        .where(Reservation.status != "cancelled")
        .group_by(Restaurant.id, Restaurant.name)
        .order_by(func.sum(Reservation.amount).desc())
        .limit(limit)
    )

    if date_from:
        query = query.where(Reservation.reservation_date >= date_from)
    if date_to:
        query = query.where(Reservation.reservation_date <= date_to)

    result = await db.execute(query)
    rows = result.all()

    return [
        {
            "id": row.id,
            "name": row.name,
            "reservations": row.reservations or 0,
            "sales": row.sales or 0,
        }
        for row in rows
    ]
