import logging
from typing import Any

import stripe
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.reservation import PaymentStatus, Reservation
from app.services.reservation import reservation_service
from app.schemas.reservation import ReservationUpdate


logger = logging.getLogger(__name__)


class PaymentError(Exception):
    """決済処理のエラー"""

    def __init__(self, message: str, code: str = "payment_error"):
        self.message = message
        self.code = code
        super().__init__(self.message)


class PaymentService:
    def __init__(self):
        stripe.api_key = settings.STRIPE_SECRET_KEY

    async def create_payment_intent(
        self, db: AsyncSession, *, reservation_id: str
    ) -> dict[str, Any]:
        """予約に対してStripe Payment Intentを作成する"""
        # 予約を取得
        reservation = await reservation_service.get(db, id=reservation_id)
        if not reservation:
            raise PaymentError("予約が見つかりません", "reservation_not_found")

        # オンライン決済でない場合はエラー
        if reservation.payment_method != "online":
            raise PaymentError(
                "この予約はオンライン決済ではありません",
                "invalid_payment_method",
            )

        # 既に決済済みの場合はエラー
        if reservation.payment_status == PaymentStatus.PAID.value:
            raise PaymentError("この予約は既に決済済みです", "already_paid")

        # 既にPayment Intentが存在する場合は、それを返す
        if reservation.stripe_payment_intent_id:
            try:
                payment_intent = stripe.PaymentIntent.retrieve(
                    reservation.stripe_payment_intent_id
                )
                if payment_intent.status in ["requires_payment_method", "requires_confirmation"]:
                    return {
                        "client_secret": payment_intent.client_secret,
                        "payment_intent_id": payment_intent.id,
                        "amount": reservation.amount,
                    }
            except stripe.error.StripeError as e:
                logger.warning(f"既存のPayment Intent取得エラー: {e}")

        # 新しいPayment Intentを作成
        try:
            payment_intent = stripe.PaymentIntent.create(
                amount=reservation.amount,
                currency="jpy",
                metadata={
                    "reservation_id": reservation_id,
                    "customer_id": reservation.customer_id,
                    "restaurant_id": reservation.restaurant_id,
                },
                automatic_payment_methods={"enabled": True},
            )

            # 予約にPayment Intent IDを保存
            update_data = ReservationUpdate(payment_status=PaymentStatus.PENDING.value)
            reservation.stripe_payment_intent_id = payment_intent.id
            await db.commit()
            await db.refresh(reservation)

            logger.info(
                f"Payment Intent作成完了: {payment_intent.id}, "
                f"予約ID: {reservation_id}, 金額: {reservation.amount}"
            )

            return {
                "client_secret": payment_intent.client_secret,
                "payment_intent_id": payment_intent.id,
                "amount": reservation.amount,
            }

        except stripe.error.StripeError as e:
            logger.error(f"Stripe Payment Intent作成エラー: {e}")
            raise PaymentError(f"決済の初期化に失敗しました: {str(e)}", "stripe_error")

    async def confirm_payment(
        self, db: AsyncSession, *, payment_intent_id: str
    ) -> Reservation | None:
        """決済完了を確認し、予約ステータスを更新する（Webhook用）"""
        from sqlalchemy import select

        # payment_intent_idから予約を検索
        result = await db.execute(
            select(Reservation).where(
                Reservation.stripe_payment_intent_id == payment_intent_id
            )
        )
        reservation = result.scalar_one_or_none()

        if not reservation:
            logger.warning(f"Payment Intent {payment_intent_id}に対応する予約が見つかりません")
            return None

        # 既に決済済みの場合はスキップ
        if reservation.payment_status == PaymentStatus.PAID.value:
            logger.info(f"予約 {reservation.id} は既に決済済みです")
            return reservation

        # ステータスを更新
        reservation.payment_status = PaymentStatus.PAID.value
        await db.commit()
        await db.refresh(reservation)

        logger.info(f"決済確認完了: 予約ID {reservation.id}, Payment Intent {payment_intent_id}")

        return reservation

    async def refund_payment(
        self, db: AsyncSession, *, reservation_id: str
    ) -> dict[str, Any]:
        """予約に対して返金処理を実行する"""
        # 予約を取得
        reservation = await reservation_service.get(db, id=reservation_id)
        if not reservation:
            raise PaymentError("予約が見つかりません", "reservation_not_found")

        # オンライン決済でない場合はエラー
        if reservation.payment_method != "online":
            raise PaymentError(
                "この予約はオンライン決済ではありません",
                "invalid_payment_method",
            )

        # 決済済みでない場合はエラー
        if reservation.payment_status != PaymentStatus.PAID.value:
            raise PaymentError("この予約は決済されていません", "not_paid")

        # Payment Intent IDがない場合はエラー
        if not reservation.stripe_payment_intent_id:
            raise PaymentError(
                "決済情報が見つかりません",
                "payment_intent_not_found",
            )

        # Stripe返金処理
        try:
            refund = stripe.Refund.create(
                payment_intent=reservation.stripe_payment_intent_id,
            )

            # 予約のpayment_statusを更新
            reservation.payment_status = PaymentStatus.REFUNDED.value
            await db.commit()
            await db.refresh(reservation)

            logger.info(
                f"返金処理完了: 返金ID {refund.id}, "
                f"予約ID {reservation_id}, 金額 {refund.amount}"
            )

            return {
                "refund_id": refund.id,
                "amount": refund.amount,
                "status": refund.status,
                "reservation_id": reservation_id,
            }

        except stripe.error.StripeError as e:
            logger.error(f"Stripe返金処理エラー: {e}")
            raise PaymentError(f"返金処理に失敗しました: {str(e)}", "stripe_error")

    def verify_webhook_signature(self, payload: bytes, signature: str) -> dict[str, Any]:
        """Webhookの署名を検証する"""
        try:
            event = stripe.Webhook.construct_event(
                payload, signature, settings.STRIPE_WEBHOOK_SECRET
            )
            return event
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Webhook署名検証エラー: {e}")
            raise PaymentError("Webhook署名の検証に失敗しました", "invalid_signature")
        except ValueError as e:
            logger.error(f"Webhookペイロードエラー: {e}")
            raise PaymentError("無効なペイロードです", "invalid_payload")


payment_service = PaymentService()
