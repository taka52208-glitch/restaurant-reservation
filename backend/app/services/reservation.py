from datetime import date

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.reservation import Reservation
from app.schemas.reservation import ReservationCreate, ReservationUpdate


class ReservationService:
    async def get(self, db: AsyncSession, *, id: str) -> Reservation | None:
        result = await db.execute(select(Reservation).where(Reservation.id == id))
        return result.scalar_one_or_none()

    async def get_by_customer(
        self, db: AsyncSession, *, customer_id: str, skip: int = 0, limit: int = 100
    ) -> list[Reservation]:
        result = await db.execute(
            select(Reservation)
            .where(Reservation.customer_id == customer_id)
            .order_by(Reservation.reservation_date.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_by_restaurant(
        self,
        db: AsyncSession,
        *,
        restaurant_id: str,
        date_filter: date | None = None,
        status: str | None = None,
        skip: int = 0,
        limit: int = 100,
    ) -> list[Reservation]:
        query = select(Reservation).where(Reservation.restaurant_id == restaurant_id)

        if date_filter:
            query = query.where(Reservation.reservation_date == date_filter)
        if status:
            query = query.where(Reservation.status == status)

        query = query.order_by(
            Reservation.reservation_date.desc(), Reservation.reservation_time
        ).offset(skip).limit(limit)

        result = await db.execute(query)
        return list(result.scalars().all())

    async def get_all(
        self,
        db: AsyncSession,
        *,
        date_from: date | None = None,
        date_to: date | None = None,
        skip: int = 0,
        limit: int = 100,
    ) -> list[Reservation]:
        query = select(Reservation)

        if date_from and date_to:
            query = query.where(
                and_(
                    Reservation.reservation_date >= date_from,
                    Reservation.reservation_date <= date_to,
                )
            )

        query = query.order_by(Reservation.reservation_date.desc()).offset(skip).limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())

    async def create(
        self, db: AsyncSession, *, obj_in: ReservationCreate, customer_id: str
    ) -> Reservation:
        db_obj = Reservation(
            customer_id=customer_id,
            restaurant_id=obj_in.restaurant_id,
            reservation_date=obj_in.reservation_date,
            reservation_time=obj_in.reservation_time,
            party_size=obj_in.party_size,
            payment_method=obj_in.payment_method,
            amount=obj_in.amount,
            notes=obj_in.notes,
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(
        self, db: AsyncSession, *, db_obj: Reservation, obj_in: ReservationUpdate
    ) -> Reservation:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj


reservation_service = ReservationService()
