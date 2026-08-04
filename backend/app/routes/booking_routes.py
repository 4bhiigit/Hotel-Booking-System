from fastapi import APIRouter, Depends, HTTPException, Query, status, Response
from bson import ObjectId
from datetime import datetime, date
import random
import string
from typing import Optional
from app.database.connection import get_database
from app.schemas.booking_schema import (
    BookingCreateSchema, BookingStatusUpdateSchema, BookingResponseSchema, BookingListResponseSchema
)
from app.services.auth_service import get_current_user, get_current_admin
from app.models.booking import booking_helper
from app.models.room import room_helper
from app.models.user import user_helper
from app.utils.pdf_generator import generate_booking_pdf_invoice
from app.utils.qr_generator import generate_qr_code_base64

router = APIRouter(prefix="/bookings", tags=["Bookings"])

def generate_booking_ref() -> str:
    letters = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"HTL-{letters}"

@router.post("", response_model=BookingResponseSchema, status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking_data: BookingCreateSchema,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(booking_data.room_id):
        raise HTTPException(status_code=400, detail="Invalid Room ID.")

    db = get_database()
    room = await db.rooms.find_one({"_id": ObjectId(booking_data.room_id)})
    if not room or not room.get("is_available", True):
        raise HTTPException(status_code=400, detail="Selected room is not available for booking.")

    # Date parsing & validation
    try:
        check_in_date = datetime.strptime(booking_data.check_in, "%Y-%m-%d").date()
        check_out_date = datetime.strptime(booking_data.check_out, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    if check_in_date >= check_out_date:
        raise HTTPException(status_code=400, detail="Check-out date must be after check-in date.")

    if check_in_date < date.today():
        raise HTTPException(status_code=400, detail="Check-in date cannot be in the past.")

    # Overlapping bookings check
    overlapping = await db.bookings.find_one({
        "room_id": ObjectId(booking_data.room_id),
        "status": {"$in": ["confirmed", "checked_in", "pending"]},
        "$or": [
            {"check_in": {"$lt": booking_data.check_out}, "check_out": {"$gt": booking_data.check_in}}
        ]
    })
    if overlapping:
        raise HTTPException(status_code=400, detail="Room is already reserved for the selected dates.")

    nights_count = (check_out_date - check_in_date).days
    total_price = nights_count * float(room.get("price_per_night", 0))

    booking_doc = {
        "booking_reference": generate_booking_ref(),
        "user_id": ObjectId(current_user["id"]),
        "room_id": ObjectId(booking_data.room_id),
        "check_in": booking_data.check_in,
        "check_out": booking_data.check_out,
        "nights_count": nights_count,
        "guests_count": booking_data.guests_count,
        "total_price": total_price,
        "status": "confirmed",
        "payment_status": "paid",
        "special_requests": booking_data.special_requests,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    result = await db.bookings.insert_one(booking_doc)
    created_booking = await db.bookings.find_one({"_id": result.inserted_id})

    res = booking_helper(created_booking)
    res["room_details"] = room_helper(room)
    res["user_details"] = current_user
    return res

@router.get("/my-bookings", response_model=BookingListResponseSchema)
async def get_my_bookings(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    query = {"user_id": ObjectId(current_user["id"])}
    
    if status_filter and status_filter != "All":
        query["status"] = status_filter

    total = await db.bookings.count_documents(query)
    skip = (page - 1) * limit

    cursor = db.bookings.find(query).sort("created_at", -1).skip(skip).limit(limit)
    bookings_list = []

    async for doc in cursor:
        b_dict = booking_helper(doc)
        room = await db.rooms.find_one({"_id": ObjectId(b_dict["room_id"])})
        if room:
            b_dict["room_details"] = room_helper(room)
        b_dict["user_details"] = current_user
        bookings_list.append(b_dict)

    total_pages = (total + limit - 1) // limit if total > 0 else 1

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "bookings": bookings_list
    }

@router.get("/all", response_model=BookingListResponseSchema)
async def get_all_bookings_admin(
    page: int = Query(1, ge=1),
    limit: int = Query(15, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = None,
    admin: dict = Depends(get_current_admin)
):
    db = get_database()
    query = {}

    if status_filter and status_filter != "All":
        query["status"] = status_filter

    if search:
        query["$or"] = [
            {"booking_reference": {"$regex": search, "$options": "i"}},
            {"special_requests": {"$regex": search, "$options": "i"}}
        ]

    total = await db.bookings.count_documents(query)
    skip = (page - 1) * limit

    cursor = db.bookings.find(query).sort("created_at", -1).skip(skip).limit(limit)
    bookings_list = []

    async for doc in cursor:
        b_dict = booking_helper(doc)
        room = await db.rooms.find_one({"_id": ObjectId(b_dict["room_id"])})
        user = await db.users.find_one({"_id": ObjectId(b_dict["user_id"])})
        if room:
            b_dict["room_details"] = room_helper(room)
        if user:
            b_dict["user_details"] = user_helper(user)
        bookings_list.append(b_dict)

    total_pages = (total + limit - 1) // limit if total > 0 else 1

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "bookings": bookings_list
    }

@router.put("/{booking_id}/status", response_model=BookingResponseSchema)
async def update_booking_status(
    booking_id: str,
    status_data: BookingStatusUpdateSchema,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking ID format.")

    db = get_database()
    booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")

    # Check permission (User can cancel their own booking, Admin can update any status)
    is_owner = str(booking.get("user_id")) == current_user["id"]
    is_admin = current_user.get("role") == "admin"

    if not is_owner and not is_admin:
        raise HTTPException(status_code=403, detail="Forbidden action.")

    update_fields = {"status": status_data.status, "updated_at": datetime.utcnow()}
    if status_data.payment_status:
        update_fields["payment_status"] = status_data.payment_status

    await db.bookings.update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": update_fields}
    )

    updated_doc = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    b_dict = booking_helper(updated_doc)
    
    room = await db.rooms.find_one({"_id": ObjectId(b_dict["room_id"])})
    user = await db.users.find_one({"_id": ObjectId(b_dict["user_id"])})
    if room:
        b_dict["room_details"] = room_helper(room)
    if user:
        b_dict["user_details"] = user_helper(user)

    return b_dict

@router.get("/{booking_id}/invoice")
async def get_booking_pdf_invoice_endpoint(
    booking_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking ID format.")

    db = get_database()
    booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")

    is_owner = str(booking.get("user_id")) == current_user["id"]
    is_admin = current_user.get("role") == "admin"

    if not is_owner and not is_admin:
        raise HTTPException(status_code=403, detail="Access denied.")

    room = await db.rooms.find_one({"_id": ObjectId(booking.get("room_id"))})
    user = await db.users.find_one({"_id": ObjectId(booking.get("user_id"))})

    pdf_bytes = generate_booking_pdf_invoice(
        booking_data=booking_helper(booking),
        room_data=room_helper(room) if room else {},
        user_data=user_helper(user) if user else {}
    )

    headers = {
        "Content-Disposition": f"attachment; filename=Invoice_{booking.get('booking_reference')}.pdf"
    }
    return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)

@router.get("/{booking_id}/qr")
async def get_booking_qr_code_endpoint(
    booking_id: str,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="Invalid booking ID.")

    db = get_database()
    booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")

    b_dict = booking_helper(booking)
    qr_data = f"GRAND-HOTEL|REF:{b_dict['booking_reference']}|ROOM:{b_dict['room_id']}|GUEST:{current_user['email']}"
    base64_qr = generate_qr_code_base64(qr_data)

    return {"booking_reference": b_dict["booking_reference"], "qr_code": base64_qr}
