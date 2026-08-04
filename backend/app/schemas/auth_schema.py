from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserRegisterSchema(BaseModel):
    name: str = Field(..., min_length=2, max_length=50, example="John Doe")
    email: EmailStr = Field(..., example="john@example.com")
    password: str = Field(..., min_length=6, example="password123")
    phone: Optional[str] = Field(None, example="+1234567890")

class UserLoginSchema(BaseModel):
    email: EmailStr = Field(..., example="john@example.com")
    password: str = Field(..., example="password123")

class GoogleAuthSchema(BaseModel):
    email: EmailStr = Field(..., example="john.google@gmail.com")
    name: str = Field(..., example="John Google")
    google_id: Optional[str] = Field(None, example="google-uid-12345")
    avatar: Optional[str] = None

class SendOTPSchema(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15, example="+919876543210")

class VerifyOTPSchema(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15, example="+919876543210")
    otp: str = Field(..., min_length=4, max_length=6, example="555888")

class UserUpdateSchema(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None

class ChangePasswordSchema(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=6)

class UserResponseSchema(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str
    phone: Optional[str] = None
    avatar: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponseSchema(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponseSchema
    welcome_message: Optional[str] = None
    notification_sent: Optional[str] = None
