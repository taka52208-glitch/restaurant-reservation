from fastapi import APIRouter

from app.api.v1.endpoints import admin, auth, payments, reservations, restaurants, users

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["認証"])
api_router.include_router(users.router, prefix="/users", tags=["ユーザー"])
api_router.include_router(restaurants.router, prefix="/restaurants", tags=["店舗"])
api_router.include_router(reservations.router, prefix="/reservations", tags=["予約"])
api_router.include_router(payments.router, prefix="/payments", tags=["決済"])
api_router.include_router(admin.router, prefix="/admin", tags=["管理者"])
