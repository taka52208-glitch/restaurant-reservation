from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.restaurant import Restaurant, RestaurantStatus, Seat
from app.schemas.restaurant import RestaurantCreate, RestaurantUpdate, SeatCreate


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


restaurant_service = RestaurantService()
