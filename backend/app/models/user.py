from datetime import datetime
from typing import Optional

def user_helper(user: dict) -> dict:
    return {
        "id": str(user.get("_id")),
        "name": user.get("name"),
        "email": user.get("email"),
        "role": user.get("role", "customer"),
        "phone": user.get("phone"),
        "avatar": user.get("avatar"),
        "created_at": user.get("created_at", datetime.utcnow())
    }
