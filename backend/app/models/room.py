from datetime import datetime

def room_helper(room: dict) -> dict:
    return {
        "id": str(room.get("_id")),
        "title": room.get("title"),
        "room_number": room.get("room_number"),
        "type": room.get("type"),
        "price_per_night": room.get("price_per_night"),
        "capacity": room.get("capacity"),
        "description": room.get("description"),
        "amenities": room.get("amenities", []),
        "images": room.get("images", []),
        "is_available": room.get("is_available", True),
        "rating": room.get("rating", 4.8),
        "created_at": room.get("created_at", datetime.utcnow()),
        "updated_at": room.get("updated_at", datetime.utcnow())
    }
