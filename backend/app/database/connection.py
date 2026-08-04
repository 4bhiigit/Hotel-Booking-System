import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.config.config import settings

logger = logging.getLogger("hotel_api")

class Database:
    client: AsyncIOMotorClient = None
    db = None

db = Database()

async def connect_to_mongo():
    logger.info("Connecting to MongoDB...")
    db.client = AsyncIOMotorClient(settings.MONGODB_URL)
    db.db = db.client[settings.DATABASE_NAME]
    logger.info(f"Connected to MongoDB database: {settings.DATABASE_NAME}")

async def close_mongo_connection():
    if db.client:
        logger.info("Closing MongoDB Connection...")
        db.client.close()
        logger.info("MongoDB Connection Closed.")

def get_database():
    return db.db
