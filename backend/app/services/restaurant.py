from datetime import date, time

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.reservation import PaymentMethod, Reservation, ReservationStatus
from app.models.restaurant import Restaurant, RestaurantStatus, Seat
from app.schemas.restaurant import (
    AvailabilityResponse,
    RestaurantCreate,
    RestaurantSalesResponse,
    RestaurantUpdate,
    SeatCreate,
)


class RestaurantService:
    async def get(self, db: AsyncSession, *, id: str) -> Restaurant | None:
        result = await db.execute(
            select(Restaurant).options(selectinload(Restaurant.seats)).where(Restaurant.id == id)
        )
        return result.scalar_one_or_none()

    async def get_by_owner(self, db: AsyncSession, *, owner_id: str) -> Restaurant | None:
        result = await db.execute(
            select(Restaurant)
            .options(selectinload(Restaurant.seats))
            .where(Restaurant.owner_id == owner_id)
        )
        return result.scalar_one_or_none()

    async def get_list(
        self,
        db: AsyncSession,
        *,
        skip: int = 0,
        limit: int = 100,
        status: str | None = None,
        genre: str | None = None,
        area: str | None = None,
    ) -> list[Restaurant]:
        query = select(Restaurant)

        if status:
            query = query.where(Restaurant.status == status)
        else:
            query = query.where(Restaurant.status == RestaurantStatus.ACTIVE.value)

        if genre:
            query = query.where(Restaurant.genre == genre)
        if area:
            query = query.where(Restaurant.area == area)

        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())

    async def create(
        self, db: AsyncSession, *, obj_in: RestaurantCreate, owner_id: str
    ) -> Restaurant:
        db_obj = Restaurant(
            owner_id=owner_id,
            name=obj_in.name,
            description=obj_in.description,
            genre=obj_in.genre,
            area=obj_in.area,
            address=obj_in.address,
            phone=obj_in.phone,
            email=obj_in.email,
            opening_hours=obj_in.opening_hours,
            closing_days=obj_in.closing_days,
            image_url=obj_in.image_url,
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(
        self, db: AsyncSession, *, db_obj: Restaurant, obj_in: RestaurantUpdate
    ) -> Restaurant:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update_status(
        self, db: AsyncSession, *, db_obj: Restaurant, status: str
    ) -> Restaurant:
        db_obj.status = status
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def add_seat(
        self, db: AsyncSession, *, restaurant_id: str, obj_in: SeatCreate
    ) -> Seat:
        db_obj = Seat(
            restaurant_id=restaurant_id,
            name=obj_in.name,
            capacity=obj_in.capacity,
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def delete_seat(self, db: AsyncSession, *, seat_id: str) -> None:
        result = await db.execute(select(Seat).where(Seat.id == seat_id))
        seat = result.scalar_one_or_none()
        if seat:
            await db.delete(seat)
            await db.commit()

    async def get_sales(
        self,
        db: AsyncSession,
        *,
        restaurant_id: str,
        date_from: date | None = None,
        date_to: date | None = None,
    ) -> RestaurantSalesResponse:
        """店舗の売上を集計する"""
        # 総売上・予約件数を取得（キャンセル以外）
        base_query = select(
            func.count(Reservation.id).label("total_reservations"),
            func.coalesce(func.sum(Reservation.amount), 0).label("total_sales"),
        ).where(
            Reservation.restaurant_id == restaurant_id,
            Reservation.status != "cancelled",
        )

        if date_from:
            base_query = base_query.where(Reservation.reservation_date >= date_from)
        if date_to:
            base_query = base_query.where(Reservation.reservation_date <= date_to)

        result = await db.execute(base_query)
        row = result.one()
        total_reservations = row.total_reservations or 0
        total_sales = row.total_sales or 0

        # 事前決済（online）の売上・件数を取得
        online_query = select(
            func.count(Reservation.id).label("online_reservations"),
            func.coalesce(func.sum(Reservation.amount), 0).label("online_sales"),
        ).where(
            Reservation.restaurant_id == restaurant_id,
            Reservation.status != "cancelled",
            Reservation.payment_method == PaymentMethod.ONLINE.value,
        )

        if date_from:
            online_query = online_query.where(Reservation.reservation_date >= date_from)
        if date_to:
            online_query = online_query.where(Reservation.reservation_date <= date_to)

        online_result = await db.execute(online_query)
        online_row = online_result.one()
        online_reservations = online_row.online_reservations or 0
        online_sales = online_row.online_sales or 0

        # 現地払い（onsite）の売上・件数を取得
        onsite_query = select(
            func.count(Reservation.id).label("onsite_reservations"),
            func.coalesce(func.sum(Reservation.amount), 0).label("onsite_sales"),
        ).where(
            Reservation.restaurant_id == restaurant_id,
            Reservation.status != "cancelled",
            Reservation.payment_method == PaymentMethod.ONSITE.value,
        )

        if date_from:
            onsite_query = onsite_query.where(Reservation.reservation_date >= date_from)
        if date_to:
            onsite_query = onsite_query.where(Reservation.reservation_date <= date_to)

        onsite_result = await db.execute(onsite_query)
        onsite_row = onsite_result.one()
        onsite_reservations = onsite_row.onsite_reservations or 0
        onsite_sales = onsite_row.onsite_sales or 0

        return RestaurantSalesResponse(
            restaurant_id=restaurant_id,
            date_from=date_from,
            date_to=date_to,
            total_sales=total_sales,
            total_reservations=total_reservations,
            online_sales=online_sales,
            online_reservations=online_reservations,
            onsite_sales=onsite_sales,
            onsite_reservations=onsite_reservations,
        )

    async def check_availability(
        self,
        db: AsyncSession,
        *,
        restaurant_id: str,
        reservation_date: date,
        reservation_time: time,
        party_size: int,
    ) -> AvailabilityResponse:
        """店舗の空席状況を確認する

        指定された日時・人数で予約可能かどうかを判定する。
        店舗の席の合計キャパシティと既存予約の人数を比較して判定。

        Args:
            db: データベースセッション
            restaurant_id: 店舗ID
            reservation_date: 予約日
            reservation_time: 予約時間
            party_size: 人数

        Returns:
            AvailabilityResponse: 空席状況レスポンス
        """
        date_str = reservation_date.isoformat()
        time_str = reservation_time.strftime("%H:%M")

        # 店舗と席情報を取得
        restaurant = await self.get(db, id=restaurant_id)
        if not restaurant:
            return AvailabilityResponse(
                available=False,
                restaurant_id=restaurant_id,
                date=date_str,
                time=time_str,
                party_size=party_size,
                message="店舗が見つかりません",
            )

        # 店舗がアクティブかチェック
        if restaurant.status != RestaurantStatus.ACTIVE.value:
            return AvailabilityResponse(
                available=False,
                restaurant_id=restaurant_id,
                date=date_str,
                time=time_str,
                party_size=party_size,
                message="この店舗は現在予約を受け付けていません",
            )

        # 席情報を取得
        seats = restaurant.seats
        if not seats:
            return AvailabilityResponse(
                available=False,
                restaurant_id=restaurant_id,
                date=date_str,
                time=time_str,
                party_size=party_size,
                message="この店舗には席が登録されていません",
            )

        # 店舗の総キャパシティを計算
        total_capacity = sum(seat.capacity for seat in seats)

        # 人数が最大キャパシティを超えている場合
        if party_size > total_capacity:
            return AvailabilityResponse(
                available=False,
                restaurant_id=restaurant_id,
                date=date_str,
                time=time_str,
                party_size=party_size,
                message=f"指定された人数（{party_size}名）は店舗の最大収容人数（{total_capacity}名）を超えています",
            )

        # 同じ日時の既存予約を取得（キャンセル以外）
        existing_reservations_query = select(
            func.coalesce(func.sum(Reservation.party_size), 0).label("reserved_count")
        ).where(
            and_(
                Reservation.restaurant_id == restaurant_id,
                Reservation.reservation_date == reservation_date,
                Reservation.reservation_time == reservation_time,
                Reservation.status != ReservationStatus.CANCELLED.value,
            )
        )
        result = await db.execute(existing_reservations_query)
        row = result.one()
        reserved_count = row.reserved_count or 0

        # 空き人数を計算
        available_capacity = total_capacity - reserved_count

        if party_size <= available_capacity:
            return AvailabilityResponse(
                available=True,
                restaurant_id=restaurant_id,
                date=date_str,
                time=time_str,
                party_size=party_size,
                message=None,
            )
        else:
            return AvailabilityResponse(
                available=False,
                restaurant_id=restaurant_id,
                date=date_str,
                time=time_str,
                party_size=party_size,
                message=f"指定された日時の空き人数は{available_capacity}名です",
            )


restaurant_service = RestaurantService()
