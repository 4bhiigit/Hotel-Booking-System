def wishlist_helper(wishlist: dict) -> dict:
    return {
        "id": str(wishlist.get("_id")),
        "user_id": str(wishlist.get("user_id")),
        "room_ids": [str(rid) for rid in wishlist.get("room_ids", [])]
    }
