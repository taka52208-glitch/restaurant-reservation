import logging
from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.deps import get_current_active_user
from app.core.security import (
    create_access_token,
    create_password_reset_token,
    create_refresh_token,
    verify_refresh_token,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    LogoutResponse,
    PasswordResetRequest,
    PasswordResetResponse,
    RefreshTokenRequest,
    RegisterRequest,
    Token,
)
from app.schemas.user import UserResponse
from app.services.user import user_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/login", response_model=Token)
async def login(
    db: Annotated[AsyncSession, Depends(get_db)],
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    user = await user_service.authenticate(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="メールアドレスまたはパスワードが正しくありません",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="このアカウントは無効化されています",
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(user.id, expires_delta=access_token_expires)
    refresh_token = create_refresh_token(user.id)
    return Token(access_token=access_token, refresh_token=refresh_token, token_type="bearer")


@router.post("/login/json", response_model=Token)
async def login_json(
    db: Annotated[AsyncSession, Depends(get_db)],
    login_data: LoginRequest,
) -> Token:
    user = await user_service.authenticate(
        db, email=login_data.email, password=login_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="メールアドレスまたはパスワードが正しくありません",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="このアカウントは無効化されています",
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(user.id, expires_delta=access_token_expires)
    refresh_token = create_refresh_token(user.id)
    return Token(access_token=access_token, refresh_token=refresh_token, token_type="bearer")


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    db: Annotated[AsyncSession, Depends(get_db)],
    register_data: RegisterRequest,
) -> UserResponse:
    existing_user = await user_service.get_by_email(db, email=register_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="このメールアドレスは既に登録されています",
        )

    from app.schemas.user import UserCreate

    user_in = UserCreate(
        email=register_data.email,
        password=register_data.password,
        name=register_data.name,
        role=register_data.role,
    )
    user = await user_service.create(db, obj_in=user_in)
    return UserResponse.model_validate(user)


@router.post("/logout", response_model=LogoutResponse)
async def logout(
    current_user: Annotated[User, Depends(get_current_active_user)],
) -> LogoutResponse:
    """
    ログアウトエンドポイント。
    サーバー側でのトークン無効化は行わず、フロントエンド側でトークンを削除する想定。
    認証済みユーザーであることを確認するために get_current_active_user を使用。
    """
    logger.info(f"ユーザー {current_user.email} がログアウトしました")
    return LogoutResponse(message="ログアウトしました")


@router.post("/refresh", response_model=Token)
async def refresh_token(
    db: Annotated[AsyncSession, Depends(get_db)],
    refresh_data: RefreshTokenRequest,
) -> Token:
    """
    リフレッシュトークンを使用して新しいアクセストークンを発行する。
    """
    payload = verify_refresh_token(refresh_data.refresh_token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="リフレッシュトークンが無効または期限切れです",
        )

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="リフレッシュトークンが無効です",
        )

    user = await user_service.get(db, id=user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ユーザーが見つかりません",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="このアカウントは無効化されています",
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    new_access_token = create_access_token(user.id, expires_delta=access_token_expires)
    new_refresh_token = create_refresh_token(user.id)

    logger.info(f"ユーザー {user.email} のトークンをリフレッシュしました")
    return Token(
        access_token=new_access_token, refresh_token=new_refresh_token, token_type="bearer"
    )


@router.post("/password-reset", response_model=PasswordResetResponse)
async def password_reset_request(
    db: Annotated[AsyncSession, Depends(get_db)],
    reset_data: PasswordResetRequest,
) -> PasswordResetResponse:
    """
    パスワードリセットリクエスト。
    メールアドレスが登録されている場合、パスワードリセットメールを送信する（スタブ）。
    セキュリティのため、メールアドレスの存在有無に関わらず同じレスポンスを返す。
    """
    user = await user_service.get_by_email(db, email=reset_data.email)

    if user:
        # パスワードリセットトークンを生成
        reset_token = create_password_reset_token()

        # メール送信のスタブ（実際のメール送信の代わりにログ出力）
        logger.info(
            f"[STUB] パスワードリセットメールを送信: "
            f"宛先={reset_data.email}, トークン={reset_token}"
        )
        # 実際の実装では、ここでメール送信サービスを呼び出す
        # await email_service.send_password_reset_email(user.email, reset_token)
    else:
        # ユーザーが存在しない場合もログに記録（セキュリティ監視用）
        logger.warning(
            f"[STUB] 存在しないメールアドレスへのパスワードリセットリクエスト: {reset_data.email}"
        )

    # セキュリティのため、メールアドレスの存在有無に関わらず同じレスポンスを返す
    return PasswordResetResponse(
        message="パスワードリセット用のメールを送信しました。メールをご確認ください。"
    )
