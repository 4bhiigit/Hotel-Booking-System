from pydantic import BaseModel, Field
from typing import Optional, List

class PlaceItemSchema(BaseModel):
    id: str
    name: str
    category: str  # hotel, motel, resort, sweets, restaurant
    category_label: str
    address: str
    city: str
    lat: float
    lon: float
    distance_km: float
    rating: float
    reviews_count: int
    price_level: str
    price_per_night: float
    price_unit: Optional[str] = "/ night"
    price_label: Optional[str] = "Est. Price"
    phone: Optional[str] = None
    website: Optional[str] = None
    images: List[str]
    amenities: List[str]
    menu: Optional[List[dict]] = []
    is_open_now: bool = True
    description: str

class PlaceListResponseSchema(BaseModel):
    success: bool = True
    total: int
    query_location: str
    user_lat: Optional[float] = None
    user_lon: Optional[float] = None
    category: str
    places: List[PlaceItemSchema]

class ImportPlaceSchema(BaseModel):
    place_id: str
    title: str
    type: str  # Suite, Deluxe, Presidential, Bakery, Restaurant
    price_per_night: float
    capacity: int = 2
    description: str
    amenities: List[str] = []
    images: List[str] = []
