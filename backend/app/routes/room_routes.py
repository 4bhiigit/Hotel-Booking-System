from fastapi import APIRouter, Depends, HTTPException, Query, status
from bson import ObjectId
from datetime import datetime
from typing import Optional, List
from app.database.connection import get_database
from app.schemas.room_schema import (
    RoomCreateSchema, RoomUpdateSchema, RoomResponseSchema, RoomListResponseSchema
)
from app.services.auth_service import get_current_admin
from app.models.room import room_helper

router = APIRouter(prefix="/rooms", tags=["Rooms"])

@router.get("", response_model=RoomListResponseSchema)
async def list_rooms(
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    search: Optional[str] = None,
    type: Optional[str] = None,
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    capacity: Optional[int] = Query(None, ge=1),
    is_available: Optional[bool] = None,
    sort_by: str = Query("price_asc", regex="^(price_asc|price_desc|rating_desc|newest)$")
):
    db = get_database()
    query = {}
    
    if is_available is not None:
        query["is_available"] = is_available

    if type and type != "All":
        query["type"] = type

    if min_price is not None or max_price is not None:
        price_query = {}
        if min_price is not None:
            price_query["$gte"] = min_price
        if max_price is not None:
            price_query["$lte"] = max_price
        query["price_per_night"] = price_query

    if capacity is not None:
        query["capacity"] = {"$gte": capacity}

    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"room_number": {"$regex": search, "$options": "i"}},
            {"amenities": {"$elemMatch": {"$regex": search, "$options": "i"}}}
        ]

    # Sorting options
    sort_option = [("price_per_night", 1)]
    if sort_by == "price_desc":
        sort_option = [("price_per_night", -1)]
    elif sort_by == "rating_desc":
        sort_option = [("rating", -1)]
    elif sort_by == "newest":
        sort_option = [("created_at", -1)]

    total = await db.rooms.count_documents(query)
    skip = (page - 1) * limit
    
    cursor = db.rooms.find(query).sort(sort_option).skip(skip).limit(limit)
    rooms_list = []
    async for doc in cursor:
        rooms_list.append(room_helper(doc))

    total_pages = (total + limit - 1) // limit if total > 0 else 1

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "rooms": rooms_list
    }

@router.get("/{room_id}", response_model=RoomResponseSchema)
async def get_room_by_id(room_id: str):
    if not ObjectId.is_valid(room_id):
        raise HTTPException(status_code=400, detail="Invalid room ID format.")

    db = get_database()
    room = await db.rooms.find_one({"_id": ObjectId(room_id)})
    if not room:
        raise HTTPException(status_code=4404, detail="Room not found.")

    return room_helper(room)

@router.post("", response_model=RoomResponseSchema, status_code=status.HTTP_201_CREATED)
async def create_room(
    room_data: RoomCreateSchema,
    admin: dict = Depends(get_current_admin)
):
    db = get_database()
    
    # Check if room_number already exists
    existing = await db.rooms.find_one({"room_number": room_data.room_number})
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Room number '{room_data.room_number}' already exists."
        )

    now = datetime.utcnow()
    doc = room_data.model_dump()
    doc["created_at"] = now
    doc["updated_at"] = now

    result = await db.rooms.insert_one(doc)
    created = await db.rooms.find_one({"_id": result.inserted_id})
    return room_helper(created)

@router.put("/{room_id}", response_model=RoomResponseSchema)
async def update_room(
    room_id: str,
    room_data: RoomUpdateSchema,
    admin: dict = Depends(get_current_admin)
):
    if not ObjectId.is_valid(room_id):
        raise HTTPException(status_code=400, detail="Invalid room ID format.")

    db = get_database()
    update_fields = {k: v for k, v in room_data.model_dump().items() if v is not None}
    if not update_fields:
        room = await db.rooms.find_one({"_id": ObjectId(room_id)})
        return room_helper(room)

    update_fields["updated_at"] = datetime.utcnow()
    
    result = await db.rooms.update_one(
        {"_id": ObjectId(room_id)},
        {"$set": update_fields}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Room not found.")

    updated = await db.rooms.find_one({"_id": ObjectId(room_id)})
    return room_helper(updated)

@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_room(
    room_id: str,
    admin: dict = Depends(get_current_admin)
):
    if not ObjectId.is_valid(room_id):
        raise HTTPException(status_code=400, detail="Invalid room ID format.")

    db = get_database()
    result = await db.rooms.delete_one({"_id": ObjectId(room_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Room not found.")

    return None
