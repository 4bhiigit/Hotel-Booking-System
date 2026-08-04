import asyncio
import logging
from app.database.connection import connect_to_mongo, close_mongo_connection
from app.database.seed_data import seed_initial_data

logging.basicConfig(level=logging.INFO)

async def main():
    print("Connecting to MongoDB...")
    await connect_to_mongo()
    print("Seeding fresh initial data...")
    await seed_initial_data()
    print("Closing connection...")
    await close_mongo_connection()
    print("Done re-seeding!")

if __name__ == "__main__":
    asyncio.run(main())
