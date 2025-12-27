from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    access_token: str
    refresh_token: str | None = None
    token_type: str


class TokenPayload(BaseModel):
    sub: str
    exp: int | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "customer"


class LogoutResponse(BaseModel):
    message: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetResponse(BaseModel):
    message: str
