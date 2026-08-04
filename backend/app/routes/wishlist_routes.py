from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from app.database.connection import get_database
from app.services.auth_service import get_current_user
from app.models.room import room_helper

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])

@router.get("")
async def get_user_wishlist(current_user: dict = Depends(get_current_user)):
    db = get_database()
    wishlist = await db.wishlists.find_one({"user_id": ObjectId(current_user["id"])})
    if not wishlist or not wishlist.get("room_ids"):
        return {"room_ids": [], "rooms": []}

    room_ids = [ObjectId(rid) for rid in wishlist["room_ids"] if ObjectId.is_valid(rid)]
    cursor = db.rooms.find({"_id": {"$in": room_ids}})
    
    rooms_list = []
    async for doc in cursor:
        rooms_list.append(room_helper(doc))

    return {
        "room_ids": [str(rid) for rid in wishlist["room_ids"]],
        "rooms": rooms_list
    }

@router.post("/toggle/{room_id}")
async def toggle_wishlist_item(
    room_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(room_id):
        raise HTTPException(status_code=400, detail="Invalid room ID format.")

    db = get_database()
    room = await db.rooms.find_one({"_id": ObjectId(room_id)})
    if not room:
        raise HTTPException(status_code=404, detail="Room not found.")

    wishlist = await db.wishlists.find_one({"user_id": ObjectId(current_user["id"])})
    
    if not wishlist:
        # Create wishlist with this room
        await db.wishlists.insert_one({
            "user_id": ObjectId(current_user["id"]),
            "room_ids": [ObjectId(room_id)]
        })
        return {"added": True, "message": "Added to wishlist."}

    current_ids = wishlist.get("room_ids", [])
    room_obj_id = ObjectId(room_id)

    if room_obj_id in current_ids:
        # Remove from wishlist
        await db.wishlists.update_one(
            {"user_id": ObjectId(current_user["id"])},
            {"$pull": {"room_ids": room_obj_id}}
        )
        return {"added": False, "message": "Removed from wishlist."}
    else:
        # Add to wishlist
        await db.wishlists.update_one(
            {"user_id": ObjectId(current_user["id"])},
            {"$addToSet": {"room_ids": room_obj_id}}
        )
        return {"added": True, "message": "Added to wishlist."}
