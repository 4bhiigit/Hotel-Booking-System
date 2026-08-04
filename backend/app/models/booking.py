from datetime import datetime

def booking_helper(booking: dict) -> dict:
    return {
        "id": str(booking.get("_id")),
        "booking_reference": booking.get("booking_reference"),
        "user_id": str(booking.get("user_id")),
        "room_id": str(booking.get("room_id")),
        "check_in": str(booking.get("check_in")),
        "check_out": str(booking.get("check_out")),
        "nights_count": int(booking.get("nights_count", 1)),
        "guests_count": int(booking.get("guests_count", 1)),
        "total_price": float(booking.get("total_price", 0.0)),
        "status": booking.get("status", "confirmed"),
        "payment_status": booking.get("payment_status", "paid"),
        "special_requests": booking.get("special_requests"),
        "created_at": booking.get("created_at", datetime.utcnow()),
        "updated_at": booking.get("updated_at", datetime.utcnow())
    }
