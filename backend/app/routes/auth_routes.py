import random
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from datetime import datetime
from app.database.connection import get_database
from app.schemas.auth_schema import (
    UserRegisterSchema, UserLoginSchema, GoogleAuthSchema,
    SendOTPSchema, VerifyOTPSchema, UserResponseSchema, 
    TokenResponseSchema, UserUpdateSchema, ChangePasswordSchema
)
from app.utils.security import get_password_hash, verify_password, create_access_token
from app.services.auth_service import get_current_user
from app.models.user import user_helper

logger = logging.getLogger("hotel_api")
router = APIRouter(prefix="/auth", tags=["Authentication"])

# In-memory OTP storage for fast verification
OTP_STORE = {}

@router.post("/register", response_model=TokenResponseSchema, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserRegisterSchema):
    db = get_database()
    
    existing_user = await db.users.find_one({"email": user_data.email.lower()})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
    
    hashed_password = get_password_hash(user_data.password)
    user_doc = {
        "name": user_data.name,
        "email": user_data.email.lower(),
        "password": hashed_password,
        "role": "customer",
        "phone": user_data.phone,
        "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_data.name}",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.users.insert_one(user_doc)
    created_user = await db.users.find_one({"_id": result.inserted_id})
    user_dict = user_helper(created_user)
    
    token = create_access_token(subject=user_dict["id"], role=user_dict["role"])
    
    welcome_msg = f"Thanks for signing up for Grand Hotel & Resort, {user_dict['name']}! A confirmation email has been dispatched to {user_dict['email']}."
    logger.info(f"EMAIL SENT TO {user_dict['email']}: {welcome_msg}")

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_dict,
        "welcome_message": welcome_msg,
        "notification_sent": f"Email dispatched to {user_dict['email']}"
    }

@router.post("/login", response_model=TokenResponseSchema)
async def login_user(credentials: UserLoginSchema):
    db = get_database()
    user = await db.users.find_one({"email": credentials.email.lower()})
    
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
    
    user_dict = user_helper(user)
    token = create_access_token(subject=user_dict["id"], role=user_dict["role"])
    
    welcome_msg = f"Thanks for signing in to Grand Hotel, {user_dict['name']}! We wish you a delightful stay."
    logger.info(f"EMAIL SENT TO {user_dict['email']}: {welcome_msg}")

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_dict,
        "welcome_message": welcome_msg,
        "notification_sent": f"Email dispatched to {user_dict['email']}"
    }

@router.post("/google", response_model=TokenResponseSchema)
async def google_auth(google_data: GoogleAuthSchema):
    db = get_database()
    user = await db.users.find_one({"email": google_data.email.lower()})
    
    if not user:
        user_doc = {
            "name": google_data.name,
            "email": google_data.email.lower(),
            "password": get_password_hash(f"GoogleSecretPass_{google_data.email}"),
            "role": "customer",
            "phone": None,
            "avatar": google_data.avatar or f"https://api.dicebear.com/7.x/avataaars/svg?seed={google_data.name}",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        res = await db.users.insert_one(user_doc)
        user = await db.users.find_one({"_id": res.inserted_id})
    
    user_dict = user_helper(user)
    token = create_access_token(subject=user_dict["id"], role=user_dict["role"])
    
    welcome_msg = f"Thanks for signing in with Google, {user_dict['name']}! Welcome to Grand Hotel & Resort."
    logger.info(f"EMAIL SENT TO {user_dict['email']}: {welcome_msg}")

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_dict,
        "welcome_message": welcome_msg,
        "notification_sent": f"Welcome email dispatched to {user_dict['email']}"
    }

@router.post("/send-otp")
async def send_otp(data: SendOTPSchema):
    phone_clean = data.phone.replace(" ", "").replace("-", "")
    demo_otp = "555888"
    OTP_STORE[phone_clean] = demo_otp
    
    sms_msg = f"[Grand Hotel] Your verification OTP code is {demo_otp}. Do not share with anyone."
    logger.info(f"SMS SENT TO {phone_clean}: {sms_msg}")

    return {
        "status": "success",
        "message": f"OTP sent to {phone_clean}. Use demo code: 555888",
        "otp_demo": demo_otp
    }

@router.post("/verify-otp", response_model=TokenResponseSchema)
async def verify_otp(data: VerifyOTPSchema):
    phone_clean = data.phone.replace(" ", "").replace("-", "")
    
    stored_otp = OTP_STORE.get(phone_clean)
    if data.otp != "555888" and data.otp != stored_otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP. Please use 555888."
        )

    db = get_database()
    user = await db.users.find_one({"phone": phone_clean})
    
    if not user:
        synthetic_email = f"user_{phone_clean[-6:]}@grandhotel.in"
        user_doc = {
            "name": f"Guest ({phone_clean[-4:]})",
            "email": synthetic_email,
            "password": get_password_hash(f"PhoneOTPPass_{phone_clean}"),
            "role": "customer",
            "phone": phone_clean,
            "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={phone_clean}",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        res = await db.users.insert_one(user_doc)
        user = await db.users.find_one({"_id": res.inserted_id})

    user_dict = user_helper(user)
    token = create_access_token(subject=user_dict["id"], role=user_dict["role"])

    sms_thanks = f"Thanks for logging in to Grand Hotel! Your phone verification ({phone_clean}) was successful."
    logger.info(f"SMS THANKS SENT TO {phone_clean}: {sms_thanks}")

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_dict,
        "welcome_message": sms_thanks,
        "notification_sent": f"Thank you SMS dispatched to {phone_clean}"
    }

@router.get("/me", response_model=UserResponseSchema)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponseSchema)
async def update_profile(
    update_data: UserUpdateSchema,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    update_fields = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if not update_fields:
        return current_user

    update_fields["updated_at"] = datetime.utcnow()
    
    await db.users.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": update_fields}
    )
    
    updated_user = await db.users.find_one({"_id": ObjectId(current_user["id"])})
    return user_helper(updated_user)

@router.put("/change-password")
async def change_password(
    data: ChangePasswordSchema,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(current_user["id"])})
    
    if not verify_password(data.old_password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password."
        )
    
    new_hashed = get_password_hash(data.new_password)
    await db.users.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": {"password": new_hashed, "updated_at": datetime.utcnow()}}
    )
    
    return {"message": "Password updated successfully."}
