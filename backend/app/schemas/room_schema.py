from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class RoomBaseSchema(BaseModel):
    title: str = Field(..., example="Royal Deluxe Ocean Suite")
    room_number: str = Field(..., example="101")
    type: str = Field(..., example="Deluxe")  # Single, Double, Deluxe, Suite, Presidential
    price_per_night: float = Field(..., gt=0, example=18500.0)
    capacity: int = Field(..., gt=0, example=2)
    description: str = Field(..., example="Spacious luxury suite with ocean view, king bed, and private balcony.")
    amenities: List[str] = Field(default_factory=list, example=["WiFi", "Air Conditioning", "Ocean View", "Mini Bar", "Spa Access"])
    images: List[str] = Field(default_factory=list, example=["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"])
    is_available: bool = True
    rating: float = Field(4.8, ge=0, le=5.0)

class RoomCreateSchema(RoomBaseSchema):
    pass

class RoomUpdateSchema(BaseModel):
    title: Optional[str] = None
    room_number: Optional[str] = None
    type: Optional[str] = None
    price_per_night: Optional[float] = None
    capacity: Optional[int] = None
    description: Optional[str] = None
    amenities: Optional[List[str]] = None
    images: Optional[List[str]] = None
    is_available: Optional[bool] = None
    rating: Optional[float] = None

class RoomResponseSchema(RoomBaseSchema):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class RoomListResponseSchema(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int
    rooms: List[RoomResponseSchema]
