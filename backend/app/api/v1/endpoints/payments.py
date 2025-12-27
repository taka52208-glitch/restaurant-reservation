import logging
from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_active_user, require_role
from app.db.session import get_db
from app.models.user import User
from app.schemas.payment import (
    PaymentConfirmResponse,
    PaymentIntentRequest,
    PaymentIntentResponse,
    RefundRequest,
    RefundResponse,
    WebhookResponse,
)
from app.services.payment import PaymentError, payment_service
from app.services.reservation import reservation_service


logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/create-intent", response_model=PaymentIntentResponse)
async def create_payment_intent(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)],
    request: PaymentIntentRequest,
) -> PaymentIntentResponse:
    """
    予約に対してStripe Payment Intentを作成する。

    - reservation_id: 予約ID
    - 予約のpayment_methodが"online"である必要がある
    - 成功時: client_secret, payment_intent_id, amountを返す
    """
    # 予約の所有者確認
    reservation = await reservation_service.get(db, id=request.reservation_id)
    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="予約が見つかりません",
        )

    if reservation.customer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="この予約の決済を行う権限がありません",
        )

    try:
        result = await payment_service.create_payment_intent(
            db, reservation_id=request.reservation_id
        )
        return PaymentIntentResponse(**result)
    except PaymentError as e:
        logger.error(f"Payment Intent作成エラー: {e.message}")
        if e.code == "reservation_not_found":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=e.message,
            )
        elif e.code in ["invalid_payment_method", "already_paid"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=e.message,
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=e.message,
            )


@router.post("/confirm", response_model=PaymentConfirmResponse)
async def confirm_payment_webhook(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    stripe_signature: str = Header(None, alias="Stripe-Signature"),
) -> PaymentConfirmResponse:
    """
    Stripe Webhookから呼ばれる決済確認エンドポイント。

    - Stripe-Signatureヘッダーで署名を検証
    - payment_intent.succeededイベントで予約のpayment_statusを"paid"に更新
    """
    if not stripe_signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stripe-Signatureヘッダーが必要です",
        )

    payload = await request.body()

    try:
        event = payment_service.verify_webhook_signature(payload, stripe_signature)
    except PaymentError as e:
        logger.error(f"Webhook署名検証エラー: {e.message}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=e.message,
        )

    # payment_intent.succeededイベントを処理
    if event["type"] == "payment_intent.succeeded":
        payment_intent = event["data"]["object"]
        payment_intent_id = payment_intent["id"]

        reservation = await payment_service.confirm_payment(
            db, payment_intent_id=payment_intent_id
        )

        if reservation:
            logger.info(f"Webhook処理完了: 予約ID {reservation.id} の決済を確認")
            return PaymentConfirmResponse(
                success=True,
                reservation_id=reservation.id,
                message="決済が確認されました",
            )
        else:
            logger.warning(f"Webhook処理: 対応する予約が見つかりません (Payment Intent: {payment_intent_id})")
            return PaymentConfirmResponse(
                success=False,
                reservation_id=None,
                message="対応する予約が見つかりません",
            )

    # その他のイベントはログのみ
    logger.info(f"Webhookイベント受信: {event['type']}")
    return PaymentConfirmResponse(
        success=True,
        reservation_id=None,
        message=f"イベント {event['type']} を受信しました",
    )


@router.post("/refund", response_model=RefundResponse)
async def refund_payment(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(require_role(["store", "admin"]))],
    request: RefundRequest,
) -> RefundResponse:
    """
    予約に対して返金処理を実行する。

    - reservation_id: 予約ID
    - 店舗オーナーまたは管理者のみ実行可能
    - 予約のpayment_statusが"paid"である必要がある
    - 成功時: 予約のpayment_statusを"refunded"に更新
    """
    # 予約の確認
    reservation = await reservation_service.get(db, id=request.reservation_id)
    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="予約が見つかりません",
        )

    # 店舗オーナーの場合、自店舗の予約のみ返金可能
    if current_user.role == "store":
        from app.services.restaurant import restaurant_service

        restaurant = await restaurant_service.get_by_owner(db, owner_id=current_user.id)
        if not restaurant or reservation.restaurant_id != restaurant.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="この予約の返金を行う権限がありません",
            )

    try:
        result = await payment_service.refund_payment(
            db, reservation_id=request.reservation_id
        )
        return RefundResponse(**result)
    except PaymentError as e:
        logger.error(f"返金処理エラー: {e.message}")
        if e.code == "reservation_not_found":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=e.message,
            )
        elif e.code in ["invalid_payment_method", "not_paid", "payment_intent_not_found"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=e.message,
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=e.message,
            )
