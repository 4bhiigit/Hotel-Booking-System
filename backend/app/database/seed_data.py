import logging
from datetime import datetime, timedelta
from app.database.connection import get_database
from app.config.config import settings
from app.utils.security import get_password_hash

logger = logging.getLogger("hotel_api")

SAMPLE_ROOMS = [
    {
        "title": "Maharajah Royal Palace Suite (Udaipur Lake View)",
        "room_number": "101",
        "type": "Presidential",
        "price_per_night": 85000.0,
        "capacity": 4,
        "description": "Exclusive royal suite overlooking Lake Pichola with private Jacuzzi, royal dining room, vintage decor, and 24/7 personal butler service.",
        "amenities": ["WiFi", "Air Conditioning", "Lake Pichola View", "Private Jacuzzi", "Royal Dining", "Butler Service", "King Featherbed", "Ayurvedic Spa"],
        "images": [
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80"
        ],
        "is_available": True,
        "rating": 4.95
    },
    {
        "title": "Rajputana Heritage Executive Suite (Jaipur)",
        "room_number": "202",
        "type": "Suite",
        "price_per_night": 45000.0,
        "capacity": 3,
        "description": "Elegant Marwari heritage suite with hand-carved Jharokha balcony, marble bathroom with rain shower, and complimentary royal high tea.",
        "amenities": ["WiFi", "Air Conditioning", "Heritage Balcony", "Workstation", "Mini Bar", "Espresso Machine", "King Bed"],
        "images": [
            "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80"
        ],
        "is_available": True,
        "rating": 4.88
    },
    {
        "title": "Goa Oceanfront Infinity Luxury Villa",
        "room_number": "305",
        "type": "Deluxe",
        "price_per_night": 28000.0,
        "capacity": 2,
        "description": "Modern Arabian sea oceanfront villa with private plunge pool, sunset deck, plush king bedding, and organic bath essentials.",
        "amenities": ["WiFi", "Air Conditioning", "Private Plunge Pool", "Ocean View", "Smart TV", "Safe Deposit"],
        "images": [
            "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80"
        ],
        "is_available": True,
        "rating": 4.82
    },
    {
        "title": "Kerala Backwater Serene Haveli",
        "room_number": "108",
        "type": "Double",
        "price_per_night": 18500.0,
        "capacity": 2,
        "description": "Serene double bungalow overlooking quiet coconut groves and private backwaters, featuring teakwood furnishings and verandah.",
        "amenities": ["WiFi", "Air Conditioning", "Backwater View", "Twin Queen Beds", "Ayurvedic Tea Station"],
        "images": [
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80"
        ],
        "is_available": True,
        "rating": 4.75
    },
    {
        "title": "Classic Royal Heritage Single Room",
        "room_number": "104",
        "type": "Single",
        "price_per_night": 8500.0,
        "capacity": 1,
        "description": "Perfect for solo travelers or business trips. Modern amenities, ergonomic desk, high-speed fiber internet, and complimentary breakfast.",
        "amenities": ["WiFi", "Air Conditioning", "Workstation", "Single Bed", "Royal Indian Breakfast"],
        "images": [
            "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
        ],
        "is_available": True,
        "rating": 4.65
    },
    {
        "title": "Penthouse Imperial Sky Villa (Himalayan View)",
        "room_number": "501",
        "type": "Presidential",
        "price_per_night": 120000.0,
        "capacity": 6,
        "description": "Ultra-luxurious 3-bedroom penthouse with private rooftop heated pool, 360° Himalayan mountain view, fireplace, and private elevator.",
        "amenities": ["WiFi", "Private Heated Pool", "Terrace", "Mountain View", "Fireplace", "Full Gourmet Kitchen", "Butler Service"],
        "images": [
            "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80"
        ],
        "is_available": True,
        "rating": 4.98
    }
]

async def seed_initial_data():
    db = get_database()
    logger.info("Checking initial database seed requirements...")

    # 1. Seed Admin User
    admin_user = await db.users.find_one({"email": settings.ADMIN_EMAIL.lower()})
    if not admin_user:
        logger.info("Creating default admin account...")
        admin_doc = {
            "name": settings.ADMIN_NAME,
            "email": settings.ADMIN_EMAIL.lower(),
            "password": get_password_hash(settings.ADMIN_PASSWORD),
            "role": "admin",
            "phone": "+91 98765 43210",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await db.users.insert_one(admin_doc)
        logger.info(f"Default admin account created ({settings.ADMIN_EMAIL} / {settings.ADMIN_PASSWORD})")

    # 2. Seed Customer User
    customer = await db.users.find_one({"email": "user@example.com"})
    customer_id = None
    if not customer:
        logger.info("Creating default customer account...")
        cust_doc = {
            "name": "Rahul Sharma",
            "email": "user@example.com",
            "password": get_password_hash("User@123"),
            "role": "customer",
            "phone": "+91 98123 45678",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        res = await db.users.insert_one(cust_doc)
        customer_id = res.inserted_id
    else:
        customer_id = customer["_id"]

    # Drop and re-seed rooms if needed or insert missing ones
    existing_rooms = await db.rooms.count_documents({})
    if existing_rooms > 0:
        logger.info("Replacing existing sample rooms with Indian Heritage Resort rooms...")
        await db.rooms.delete_many({})

    logger.info("Seeding sample Indian luxury hotel rooms...")
    now = datetime.utcnow()
    for r in SAMPLE_ROOMS:
        r["created_at"] = now
        r["updated_at"] = now
    await db.rooms.insert_many(SAMPLE_ROOMS)
    logger.info(f"Successfully seeded {len(SAMPLE_ROOMS)} Indian luxury hotel rooms.")

    # 4. Seed Initial Sample Bookings if empty
    bookings_count = await db.bookings.count_documents({})
    if bookings_count == 0 and customer_id:
        room = await db.rooms.find_one({"room_number": "101"})
        if room:
            logger.info("Seeding sample booking...")
            sample_booking = {
                "booking_reference": "HTL-IND-1001",
                "user_id": customer_id,
                "room_id": room["_id"],
                "check_in": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"),
                "check_out": (datetime.now() + timedelta(days=8)).strftime("%Y-%m-%d"),
                "nights_count": 3,
                "guests_count": 2,
                "total_price": 255000.0,
                "status": "confirmed",
                "payment_status": "paid",
                "special_requests": "Royal Thali dinner setup, quiet room with Lake Pichola view.",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            await db.bookings.insert_one(sample_booking)
            logger.info("Sample booking seeded.")
