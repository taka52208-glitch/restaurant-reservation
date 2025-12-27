from datetime import date, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import require_role
from app.db.session import get_db
from app.models.user import User
from app.schemas.restaurant import (
    AvailabilityResponse,
    RestaurantCreate,
    RestaurantListResponse,
    RestaurantResponse,
    RestaurantSalesResponse,
    RestaurantUpdate,
    SeatCreate,
    SeatResponse,
)
from app.services.restaurant import restaurant_service

router = APIRouter()


@router.get("", response_model=list[RestaurantListResponse])
async def list_restaurants(
    db: Annotated[AsyncSession, Depends(get_db)],
    genre: str | None = None,
    area: str | None = None,
    skip: int = 0,
    limit: int = 100,
) -> list[RestaurantListResponse]:
    restaurants = await restaurant_service.get_list(
        db, skip=skip, limit=limit, genre=genre, area=area
    )
    return [RestaurantListResponse.model_validate(r) for r in restaurants]


@router.get("/{restaurant_id}", response_model=RestaurantResponse)
async def get_restaurant(
    restaurant_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> RestaurantResponse:
    restaurant = await restaurant_service.get(db, id=restaurant_id)
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="店舗が見つかりません",
        )
    return RestaurantResponse.model_validate(restaurant)


@router.post("", response_model=RestaurantResponse, status_code=status.HTTP_201_CREATED)
async def create_restaurant(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role(["store"]))],
    restaurant_in: RestaurantCreate,
) -> RestaurantResponse:
    existing = await restaurant_service.get_by_owner(db, owner_id=current_user.id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="既に店舗が登録されています",
        )

    restaurant = await restaurant_service.create(
        db, obj_in=restaurant_in, owner_id=current_user.id
    )
    return RestaurantResponse.model_validate(restaurant)


@router.put("/{restaurant_id}", response_model=RestaurantResponse)
async def update_restaurant(
    restaurant_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role(["store"]))],
    restaurant_in: RestaurantUpdate,
) -> RestaurantResponse:
    restaurant = await restaurant_service.get(db, id=restaurant_id)
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="店舗が見つかりません",
        )
    if restaurant.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="この店舗を編集する権限がありません",
        )

    restaurant = await restaurant_service.update(db, db_obj=restaurant, obj_in=restaurant_in)
    return RestaurantResponse.model_validate(restaurant)


@router.get("/my/store", response_model=RestaurantResponse)
async def get_my_restaurant(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role(["store"]))],
) -> RestaurantResponse:
    restaurant = await restaurant_service.get_by_owner(db, owner_id=current_user.id)
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="店舗が登録されていません",
        )
    return RestaurantResponse.model_validate(restaurant)


@router.post("/{restaurant_id}/seats", response_model=SeatResponse)
async def add_seat(
    restaurant_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role(["store"]))],
    seat_in: SeatCreate,
) -> SeatResponse:
    restaurant = await restaurant_service.get(db, id=restaurant_id)
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="店舗が見つかりません",
        )
    if restaurant.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="この店舗を編集する権限がありません",
        )

    seat = await restaurant_service.add_seat(db, restaurant_id=restaurant_id, obj_in=seat_in)
    return SeatResponse.model_validate(seat)


@router.delete("/{restaurant_id}/seats/{seat_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_seat(
    restaurant_id: str,
    seat_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role(["store"]))],
) -> None:
    restaurant = await restaurant_service.get(db, id=restaurant_id)
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="店舗が見つかりません",
        )
    if restaurant.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="この店舗を編集する権限がありません",
        )

    await restaurant_service.delete_seat(db, seat_id=seat_id)


@router.get("/{restaurant_id}/availability", response_model=AvailabilityResponse)
async def check_availability(
    restaurant_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    date_param: str = Query(..., alias="date", description="予約日 (YYYY-MM-DD形式)"),
    time_param: str = Query(..., alias="time", description="予約時間 (HH:MM形式)"),
    party_size: int = Query(..., ge=1, description="人数"),
) -> AvailabilityResponse:
    """店舗の空席状況を確認する

    指定された日時・人数で予約可能かどうかを判定する。
    ゲストユーザーでもアクセス可能。

    Args:
        restaurant_id: 店舗ID
        date_param: 予約日 (YYYY-MM-DD形式)
        time_param: 予約時間 (HH:MM形式)
        party_size: 人数

    Returns:
        AvailabilityResponse: 空席状況レスポンス
    """
    # 日付のパース
    try:
        reservation_date = datetime.strptime(date_param, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="日付の形式が正しくありません。YYYY-MM-DD形式で指定してください。",
        )

    # 時間のパース
    try:
        reservation_time = datetime.strptime(time_param, "%H:%M").time()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="時間の形式が正しくありません。HH:MM形式で指定してください。",
        )

    return await restaurant_service.check_availability(
        db,
        restaurant_id=restaurant_id,
        reservation_date=reservation_date,
        reservation_time=reservation_time,
        party_size=party_size,
    )


@router.get("/{restaurant_id}/sales", response_model=RestaurantSalesResponse)
async def get_restaurant_sales(
    restaurant_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role(["store"]))],
    date_from: date | None = None,
    date_to: date | None = None,
) -> RestaurantSalesResponse:
    """店舗オーナーが自店舗の売上を確認する

    - 店舗オーナーのみアクセス可能
    - 日付範囲でフィルタ可能（date_from, date_to）
    - 集計項目：総売上、予約件数、事前決済/現地払い別売上
    """
    restaurant = await restaurant_service.get(db, id=restaurant_id)
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="店舗が見つかりません",
        )
    if restaurant.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="この店舗の売上を閲覧する権限がありません",
        )

    return await restaurant_service.get_sales(
        db, restaurant_id=restaurant_id, date_from=date_from, date_to=date_to
    )
