from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_active_user, require_role
from app.db.session import get_db
from app.models.reservation import ReservationStatus
from app.models.user import User
from app.schemas.reservation import (
    ReservationCreate,
    ReservationResponse,
    ReservationUpdate,
)
from app.services.reservation import reservation_service
from app.services.restaurant import restaurant_service

router = APIRouter()


@router.get("/my", response_model=list[ReservationResponse])
async def get_my_reservations(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    skip: int = 0,
    limit: int = 100,
) -> list[ReservationResponse]:
    reservations = await reservation_service.get_by_customer(
        db, customer_id=current_user.id, skip=skip, limit=limit
    )
    return [ReservationResponse.model_validate(r) for r in reservations]


@router.post("", response_model=ReservationResponse, status_code=status.HTTP_201_CREATED)
async def create_reservation(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    reservation_in: ReservationCreate,
) -> ReservationResponse:
    restaurant = await restaurant_service.get(db, id=reservation_in.restaurant_id)
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="店舗が見つかりません",
        )

    reservation = await reservation_service.create(
        db, obj_in=reservation_in, customer_id=current_user.id
    )
    return ReservationResponse.model_validate(reservation)


@router.get("/{reservation_id}", response_model=ReservationResponse)
async def get_reservation(
    reservation_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> ReservationResponse:
    reservation = await reservation_service.get(db, id=reservation_id)
    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="予約が見つかりません",
        )
    if reservation.customer_id != current_user.id and current_user.role not in ["store", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="この予約を閲覧する権限がありません",
        )
    return ReservationResponse.model_validate(reservation)


@router.put("/{reservation_id}/cancel", response_model=ReservationResponse)
async def cancel_reservation(
    reservation_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> ReservationResponse:
    reservation = await reservation_service.get(db, id=reservation_id)
    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="予約が見つかりません",
        )
    if reservation.customer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="この予約をキャンセルする権限がありません",
        )
    if reservation.status != ReservationStatus.CONFIRMED.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="この予約はキャンセルできません",
        )

    update_data = ReservationUpdate(status=ReservationStatus.CANCELLED.value)
    reservation = await reservation_service.update(db, db_obj=reservation, obj_in=update_data)
    return ReservationResponse.model_validate(reservation)


# Store endpoints
@router.get("/store/list", response_model=list[ReservationResponse])
async def get_store_reservations(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role(["store"]))],
    date_filter: date | None = None,
    status_filter: str | None = None,
    skip: int = 0,
    limit: int = 100,
) -> list[ReservationResponse]:
    restaurant = await restaurant_service.get_by_owner(db, owner_id=current_user.id)
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="店舗が登録されていません",
        )

    reservations = await reservation_service.get_by_restaurant(
        db,
        restaurant_id=restaurant.id,
        date_filter=date_filter,
        status=status_filter,
        skip=skip,
        limit=limit,
    )
    return [ReservationResponse.model_validate(r) for r in reservations]


@router.put("/store/{reservation_id}/complete", response_model=ReservationResponse)
async def complete_reservation(
    reservation_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role(["store"]))],
) -> ReservationResponse:
    reservation = await reservation_service.get(db, id=reservation_id)
    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="予約が見つかりません",
        )

    restaurant = await restaurant_service.get_by_owner(db, owner_id=current_user.id)
    if not restaurant or reservation.restaurant_id != restaurant.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="この予約を更新する権限がありません",
        )

    update_data = ReservationUpdate(status=ReservationStatus.COMPLETED.value)
    reservation = await reservation_service.update(db, db_obj=reservation, obj_in=update_data)
    return ReservationResponse.model_validate(reservation)
