import logging
from datetime import datetime, timedelta
from app.database.connection import get_database
from app.config.config import settings
from app.utils.security import get_password_hash

logger = logging.getLogger("hotel_api")

SAMPLE_ROOMS = [
    {
        "title": "Taj Lake Palace - Maharajah Royal Suite (Udaipur)",
        "room_number": "101",
        "type": "Presidential",
        "price_per_night": 85000.0,
        "capacity": 4,
        "description": "Floating palace luxury suite in Lake Pichola with private Jacuzzi, royal dining room, antique artwork, and 24/7 personal Khadidmatgar (butler) service.",
        "amenities": ["WiFi", "Lake Pichola View", "Private Jacuzzi", "Royal Butler Service", "Spacious Verandah", "Ayurvedic Spa Access", "King Featherbed"],
        "images": [
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80"
        ],
        "is_available": True,
        "rating": 4.98
    },
    {
        "title": "The Oberoi Udaivilas - Kohinoor Pool Suite (Udaipur)",
        "room_number": "102",
        "type": "Presidential",
        "price_per_night": 135000.0,
        "capacity": 4,
        "description": "Opulent suite featuring a private temperature-controlled infinity pool overlooking Mewar palaces, gold-domed ceilings, and private dining courtyard.",
        "amenities": ["Private Infinity Pool", "Palace & Lake View", "Gold-Fitted Spa Bath", "Personal Butler", "WiFi", "Helipad Access", "King Bed"],
        "images": [
            "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80"
        ],
        "is_available": True,
        "rating": 4.99
    },
    {
        "title": "Rambagh Palace - Grand Royal Maharajah Suite (Jaipur)",
        "room_number": "201",
        "type": "Suite",
        "price_per_night": 95000.0,
        "capacity": 3,
        "description": "Former residence of the Maharajah of Jaipur. Features Marwari silk draperies, authentic hand-carved Jharokha balcony, and royal peacock garden views.",
        "amenities": ["Peacock Garden View", "Heritage Balcony", "Royal High Tea", "Marble Soaking Tub", "WiFi", "Vintage Car Transfer"],
        "images": [
            "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80"
        ],
        "is_available": True,
        "rating": 4.94
    },
    {
        "title": "The Leela Palace - Imperial Suite (New Delhi)",
        "room_number": "301",
        "type": "Presidential",
        "price_per_night": 110000.0,
        "capacity": 4,
        "description": "Architectural marvel in Lutyens' Delhi. Bullet-proof glass, private gym, gold-leaf motifs, Murano chandeliers, and Rolls-Royce chauffeur service.",
        "amenities": ["Private Gym", "Rooftop Heated Pool", "Rolls-Royce Transfer", "Butler Service", "High Speed Fiber WiFi", "Plush Spa Bath"],
        "images": [
            "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80"
        ],
        "is_available": True,
        "rating": 4.96
    },
    {
        "title": "Taj Mahal Palace - Tata Harbor Presidential Suite (Mumbai)",
        "room_number": "401",
        "type": "Presidential",
        "price_per_night": 125000.0,
        "capacity": 4,
        "description": "Iconic heritage suite overlooking Gateway of India and Arabian Sea, decorated with original museum-worthy Indian fine art and crystal chandeliers.",
        "amenities": ["Arabian Sea & Gateway View", "Private Wine Cellar", "Steam & Sauna", "24/7 Butler", "Executive Lounge Access"],
        "images": [
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80"
        ],
        "is_available": True,
        "rating": 4.97
    },
    {
        "title": "Taj Fort Aguada Resort - Seafront Heritage Pool Villa (Goa)",
        "room_number": "501",
        "type": "Deluxe",
        "price_per_night": 38000.0,
        "capacity": 3,
        "description": "Portuguese-Goan style beachfront luxury villa overlooking Sinquerim beach with private plunge pool, hammock deck, and fresh seafood barbecue.",
        "amenities": ["Private Plunge Pool", "Sinquerim Beach Access", "Ocean Sunset Deck", "WiFi", "Barbecue Grill", "King Bed"],
        "images": [
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80"
        ],
        "is_available": True,
        "rating": 4.89
    },
    {
        "title": "The Oberoi Amarvilas - Luxury Suite (Agra Taj Mahal View)",
        "room_number": "601",
        "type": "Suite",
        "price_per_night": 75000.0,
        "capacity": 2,
        "description": "Located just 600 meters from the Taj Mahal. Uninterrupted views of the monument from your bed, private balcony, and marble soaking tub.",
        "amenities": ["Direct Taj Mahal View", "Private Balcony", "Teakwood Bar", "Marble Bath", "24/7 Room Service", "High Speed WiFi"],
        "images": [
            "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80"
        ],
        "is_available": True,
        "rating": 4.93
    },
    {
        "title": "Wildflower Hall An Oberoi Resort - Himalayan Mountain Suite (Shimla)",
        "room_number": "701",
        "type": "Suite",
        "price_per_night": 42000.0,
        "capacity": 2,
        "description": "Nestled in pine and cedar forests 8,250 ft high in the Himalayas. Outdoor open-air heated whirlpool with snow-capped mountain views.",
        "amenities": ["Himalayan View", "Outdoor Heated Whirlpool", "Fireplace", "Pine Forest Trail", "Ayurvedic Spa", "King Bed"],
        "images": [
            "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80"
        ],
        "is_available": True,
        "rating": 4.91
    },
    {
        "title": "Kumarakom Lake Resort - Heritage Lake Villa with Pool (Kerala)",
        "room_number": "801",
        "type": "Double",
        "price_per_night": 32000.0,
        "capacity": 2,
        "description": "Reconstructed 16th-century ancestral Kerala home (Illam) set on Vembanad Lake. Private courtyard pool, open-air bath, and sunset cruise.",
        "amenities": ["Vembanad Lake View", "Private Courtyard Pool", "Open-Air Bath", "Sunset Shikara Cruise", "Ayurvedic Center"],
        "images": [
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80"
        ],
        "is_available": True,
        "rating": 4.88
    },
    {
        "title": "ITC Grand Bharat - Presidential Golf Villa (Gurugram/NCR)",
        "room_number": "901",
        "type": "Presidential",
        "price_per_night": 65000.0,
        "capacity": 4,
        "description": "India's premier retreat resort in Delhi NCR with 27-hole Jack Nicklaus signature golf course, private plunge pool, and Kaya Kalp spa.",
        "amenities": ["27-Hole Golf Access", "Private Plunge Pool", "Kaya Kalp Spa", "Gourmet Dining", "Helipad", "King Suite"],
        "images": [
            "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80"
        ],
        "is_available": True,
        "rating": 4.92
    },
    {
        "title": "Umaid Bhawan Palace - Maharajah Royal Palace Suite (Jodhpur)",
        "room_number": "1001",
        "type": "Presidential",
        "price_per_night": 140000.0,
        "capacity": 4,
        "description": "One of the world's largest private residences built with Chittar sandstone. Art Deco architecture, private spa, and royal Marwar feast.",
        "amenities": ["Art Deco Design", "Private Palace Museum Tour", "Vintage Car Rally", "Butler", "Heated Indoor Pool", "King Bed"],
        "images": [
            "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80"
        ],
        "is_available": True,
        "rating": 4.99
    },
    {
        "title": "Alila Diwa - Oceanfront Infinity Villa (South Goa)",
        "room_number": "1101",
        "type": "Single",
        "price_per_night": 24000.0,
        "capacity": 2,
        "description": "Contemporary tropical sanctuary amidst lush paddy fields and Majorda beach. Private lap pool, outdoor rain shower, and organic dining.",
        "amenities": ["Majorda Beach Shuttle", "Private Lap Pool", "Paddy Field Views", "Rain Shower", "Free WiFi", "Organic Breakfast"],
        "images": [
            "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80"
        ],
        "is_available": True,
        "rating": 4.85
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
