from fastapi import APIRouter, Query, HTTPException, Depends, status
from typing import Optional
from datetime import datetime
from app.database.connection import get_database
from app.schemas.places_schema import PlaceListResponseSchema, ImportPlaceSchema
from app.services.places_service import get_nearby_places
from app.services.auth_service import get_current_admin
from app.models.room import room_helper

router = APIRouter(prefix="/places", tags=["Nearby Real Places"])

@router.get("/nearby", response_model=PlaceListResponseSchema)
async def list_nearby_places(
    lat: Optional[float] = Query(None, description="User current latitude"),
    lon: Optional[float] = Query(None, description="User current longitude"),
    city: Optional[str] = Query(None, description="City or location search query"),
    category: str = Query("all", description="Filter category: all, hotel, motel, resort, sweets, restaurant"),
    radius_km: float = Query(20.0, ge=0.5, le=20.0, description="Strict Max Radius in km (20km)")
):
    """Fetches real-time location-based nearby hotels, motels, resorts, sweets shops, and restaurants."""
    res = await get_nearby_places(
        lat=lat,
        lon=lon,
        city=city,
        category=category.lower(),
        radius_km=radius_km
    )
    return res

@router.post("/import", status_code=status.HTTP_201_CREATED)
async def import_place_to_rooms(
    data: ImportPlaceSchema,
    admin: dict = Depends(get_current_admin)
):
    """Allows importing a real discovered venue into MongoDB rooms inventory."""
    db = get_database()
    
    # Check if place is already imported
    existing = await db.rooms.find_one({"room_number": f"REAL-{data.place_id[-6:]}"})
    if existing:
        return room_helper(existing)

    now = datetime.utcnow()
    doc = {
        "title": data.title,
        "room_number": f"REAL-{data.place_id[-6:]}",
        "type": data.type,
        "price_per_night": data.price_per_night,
        "capacity": data.capacity,
        "description": data.description,
        "amenities": data.amenities,
        "images": data.images,
        "is_available": True,
        "rating": 4.9,
        "created_at": now,
        "updated_at": now
    }
    
    result = await db.rooms.insert_one(doc)
    created = await db.rooms.find_one({"_id": result.inserted_id})
    return room_helper(created)
