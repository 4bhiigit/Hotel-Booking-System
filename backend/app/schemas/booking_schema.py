from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from app.schemas.room_schema import RoomResponseSchema
from app.schemas.auth_schema import UserResponseSchema

class BookingCreateSchema(BaseModel):
    room_id: str
    check_in: str = Field(..., example="2026-08-10")
    check_out: str = Field(..., example="2026-08-15")
    guests_count: int = Field(1, gt=0, example=2)
    special_requests: Optional[str] = Field(None, example="High floor preferred, late check-in.")

class BookingStatusUpdateSchema(BaseModel):
    status: str = Field(..., example="confirmed")  # pending, confirmed, cancelled, checked_in, completed
    payment_status: Optional[str] = Field(None, example="paid")  # pending, paid, refunded

class BookingResponseSchema(BaseModel):
    id: str
    booking_reference: str
    user_id: str
    room_id: str
    check_in: str
    check_out: str
    nights_count: int
    guests_count: int
    total_price: float
    status: str
    payment_status: str
    special_requests: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    room_details: Optional[RoomResponseSchema] = None
    user_details: Optional[UserResponseSchema] = None

    class Config:
        from_attributes = True

class BookingListResponseSchema(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
    bookings: List[BookingResponseSchema]
