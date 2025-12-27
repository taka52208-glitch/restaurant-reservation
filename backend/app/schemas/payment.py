from pydantic import BaseModel


class PaymentIntentRequest(BaseModel):
    """Payment Intent作成リクエスト"""
    reservation_id: str


class PaymentIntentResponse(BaseModel):
    """Payment Intent作成レスポンス"""
    client_secret: str
    payment_intent_id: str
    amount: int


class PaymentConfirmRequest(BaseModel):
    """決済確認リクエスト（Webhook経由）"""
    payment_intent_id: str


class PaymentConfirmResponse(BaseModel):
    """決済確認レスポンス"""
    success: bool
    reservation_id: str | None = None
    message: str


class RefundRequest(BaseModel):
    """返金リクエスト"""
    reservation_id: str


class RefundResponse(BaseModel):
    """返金レスポンス"""
    refund_id: str
    amount: int
    status: str
    reservation_id: str


class WebhookResponse(BaseModel):
    """Webhookレスポンス"""
    received: bool
