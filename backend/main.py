import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.config.config import settings
from app.database.connection import connect_to_mongo, close_mongo_connection
from app.database.seed_data import seed_initial_data
from app.routes.auth_routes import router as auth_router
from app.routes.room_routes import router as room_router
from app.routes.booking_routes import router as booking_router
from app.routes.wishlist_routes import router as wishlist_router
from app.routes.analytics_routes import router as analytics_router

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("hotel_api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup lifecycle
    await connect_to_mongo()
    try:
        await seed_initial_data()
    except Exception as e:
        logger.warning(f"Seed data execution skipped or failed: {str(e)}")
    yield
    # Shutdown lifecycle
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Industry-Level Hotel Booking System REST API built with FastAPI and MongoDB.",
    lifespan=lifespan
)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*"  # Allows all origins for development and deployment
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": f"An internal server error occurred: {str(exc)}"}
    )

# Include Routers under API V1
api_v1 = settings.API_V1_STR
app.include_router(auth_router, prefix=api_v1)
app.include_router(room_router, prefix=api_v1)
app.include_router(booking_router, prefix=api_v1)
app.include_router(wishlist_router, prefix=api_v1)
app.include_router(analytics_router, prefix=api_v1)

@app.get("/")
async def root():
    return {
        "message": "Welcome to Grand Hotel Booking System API",
        "docs": "/docs",
        "version": settings.VERSION
    }
