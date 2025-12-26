#!/usr/bin/env python3
"""Seed initial data into the database."""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.security import get_password_hash
from app.db.session import async_session_maker
from app.models.reservation import Reservation  # noqa: F401
from app.models.restaurant import Restaurant, Seat
from app.models.user import User


async def seed_users():
    """Create test users."""
    users = [
        User(
            email="customer@reservation.local",
            hashed_password=get_password_hash("Customer123!"),
            name="山田 太郎",
            role="customer",
            is_active=True,
        ),
        User(
            email="store@reservation.local",
            hashed_password=get_password_hash("Store123!"),
            name="鈴木 花子（店舗オーナー）",
            role="store",
            is_active=True,
        ),
        User(
            email="admin@reservation.local",
            hashed_password=get_password_hash("Admin123!"),
            name="管理者",
            role="admin",
            is_active=True,
        ),
    ]
    return users


async def seed_restaurants(owner_id: str):
    """Create sample restaurants."""
    restaurants = [
        Restaurant(
            owner_id=owner_id,
            name="寿司処 匠",
            description="厳選された新鮮な魚介を使用した本格江戸前寿司。職人の技が光る握りをお楽しみください。",
            genre="和食",
            area="銀座",
            address="東京都中央区銀座4-5-6",
            phone="03-1234-5678",
            email="info@sushi-takumi.example.com",
            opening_hours="11:30-14:00, 17:00-22:00",
            closing_days="日曜日",
            image_url="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800",
            status="active",
        ),
        Restaurant(
            owner_id=owner_id,
            name="イタリアーナ ベッラ",
            description="本場イタリアの味を再現した本格イタリアン。手打ちパスタと薪窯ピッツァが自慢です。",
            genre="イタリアン",
            area="表参道",
            address="東京都港区南青山5-1-2",
            phone="03-2345-6789",
            email="info@italiana-bella.example.com",
            opening_hours="11:30-15:00, 18:00-23:00",
            closing_days="月曜日",
            image_url="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
            status="active",
        ),
        Restaurant(
            owner_id=owner_id,
            name="焼肉 炎",
            description="A5ランク黒毛和牛を中心とした厳選肉を炭火で。特製タレと岩塩でお召し上がりください。",
            genre="焼肉",
            area="渋谷",
            address="東京都渋谷区道玄坂2-3-4",
            phone="03-3456-7890",
            email="info@yakiniku-honoo.example.com",
            opening_hours="17:00-24:00",
            closing_days="火曜日",
            image_url="https://images.unsplash.com/photo-1544025162-d76694265947?w=800",
            status="active",
        ),
        Restaurant(
            owner_id=owner_id,
            name="中華楼 龍門",
            description="本格四川料理から広東料理まで。点心師が作る手作り点心も人気です。",
            genre="中華",
            area="横浜中華街",
            address="神奈川県横浜市中区山下町100",
            phone="045-123-4567",
            email="info@ryumon.example.com",
            opening_hours="11:00-22:00",
            closing_days="水曜日",
            image_url="https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800",
            status="active",
        ),
        Restaurant(
            owner_id=owner_id,
            name="ビストロ パリジャン",
            description="パリの街角にあるような温かみのあるビストロ。季節の食材を使ったフレンチをカジュアルに。",
            genre="フレンチ",
            area="代官山",
            address="東京都渋谷区代官山町15-8",
            phone="03-4567-8901",
            email="info@bistro-parisien.example.com",
            opening_hours="12:00-14:30, 18:00-22:00",
            closing_days="月曜日・火曜日",
            image_url="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800",
            status="active",
        ),
        Restaurant(
            owner_id=owner_id,
            name="居酒屋 まんぷく",
            description="新鮮な刺身と手作り料理が自慢の大衆居酒屋。リーズナブルな価格で本格的な味を。",
            genre="居酒屋",
            area="新橋",
            address="東京都港区新橋3-5-7",
            phone="03-5678-9012",
            email="info@manpuku.example.com",
            opening_hours="17:00-24:00",
            closing_days="日曜日・祝日",
            image_url="https://images.unsplash.com/photo-1554502078-ef0fc409efce?w=800",
            status="active",
        ),
    ]
    return restaurants


async def seed_seats(restaurants: list[Restaurant]):
    """Create sample seats for restaurants."""
    seat_configs = [
        # 寿司処 匠
        [
            {"name": "カウンター1", "capacity": 2},
            {"name": "カウンター2", "capacity": 2},
            {"name": "カウンター3", "capacity": 2},
            {"name": "個室A", "capacity": 4},
            {"name": "個室B", "capacity": 6},
        ],
        # イタリアーナ ベッラ
        [
            {"name": "テーブル1", "capacity": 2},
            {"name": "テーブル2", "capacity": 4},
            {"name": "テーブル3", "capacity": 4},
            {"name": "テラス席", "capacity": 6},
        ],
        # 焼肉 炎
        [
            {"name": "テーブルA", "capacity": 4},
            {"name": "テーブルB", "capacity": 4},
            {"name": "テーブルC", "capacity": 6},
            {"name": "個室", "capacity": 8},
        ],
        # 中華楼 龍門
        [
            {"name": "円卓A", "capacity": 8},
            {"name": "円卓B", "capacity": 10},
            {"name": "テーブル1", "capacity": 4},
            {"name": "テーブル2", "capacity": 4},
        ],
        # ビストロ パリジャン
        [
            {"name": "窓際1", "capacity": 2},
            {"name": "窓際2", "capacity": 2},
            {"name": "テーブル1", "capacity": 4},
            {"name": "テーブル2", "capacity": 4},
        ],
        # 居酒屋 まんぷく
        [
            {"name": "カウンター", "capacity": 6},
            {"name": "座敷A", "capacity": 4},
            {"name": "座敷B", "capacity": 6},
            {"name": "テーブル席", "capacity": 4},
        ],
    ]

    seats = []
    for restaurant, configs in zip(restaurants, seat_configs, strict=True):
        for config in configs:
            seats.append(
                Seat(
                    restaurant_id=restaurant.id,
                    name=config["name"],
                    capacity=config["capacity"],
                )
            )
    return seats


async def main():
    """Main function to seed all data."""
    print("Starting database seeding...")

    async with async_session_maker() as session:
        # Check if data already exists
        from sqlalchemy import select

        existing_users = await session.execute(select(User).limit(1))
        if existing_users.scalar_one_or_none():
            print("Data already exists. Skipping seed.")
            return

        # Create users
        print("Creating users...")
        users = await seed_users()
        for user in users:
            session.add(user)
        await session.flush()
        print(f"  Created {len(users)} users")

        # Get store owner user
        store_user = next(u for u in users if u.role == "store")

        # Create restaurants
        print("Creating restaurants...")
        restaurants = await seed_restaurants(store_user.id)
        for restaurant in restaurants:
            session.add(restaurant)
        await session.flush()
        print(f"  Created {len(restaurants)} restaurants")

        # Create seats
        print("Creating seats...")
        seats = await seed_seats(restaurants)
        for seat in seats:
            session.add(seat)
        await session.flush()
        print(f"  Created {len(seats)} seats")

        await session.commit()
        print("Database seeding completed successfully!")


if __name__ == "__main__":
    asyncio.run(main())
