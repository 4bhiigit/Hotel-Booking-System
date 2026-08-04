import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Hotel Booking System API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # MongoDB connection string (defaults to local or environment variable)
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "hotel_booking_db")
    
    # JWT Authentication settings
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "super_secret_hotel_jwt_key_987654321_secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days expiration
    
    # Initial Admin Credentials for Seeding
    ADMIN_NAME: str = "System Admin"
    ADMIN_EMAIL: str = "admin@grandhotel.com"
    ADMIN_PASSWORD: str = "Admin@123"

    # Optional Real API Credentials & Providers
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_PLACES_API_KEY: str = os.getenv("GOOGLE_PLACES_API_KEY", "")
    SMS_API_KEY: str = os.getenv("SMS_API_KEY", "")

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
