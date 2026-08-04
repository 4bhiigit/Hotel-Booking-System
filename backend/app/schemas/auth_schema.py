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
