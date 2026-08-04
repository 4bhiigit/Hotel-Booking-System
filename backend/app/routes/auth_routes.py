from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from datetime import datetime
from app.database.connection import get_database
from app.schemas.auth_schema import (
    UserRegisterSchema, UserLoginSchema, UserResponseSchema, 
    TokenResponseSchema, UserUpdateSchema, ChangePasswordSchema
)
from app.utils.security import get_password_hash, verify_password, create_access_token
from app.services.auth_service import get_current_user
from app.models.user import user_helper

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponseSchema, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserRegisterSchema):
    db = get_database()
    
    # Check if user already exists
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
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_dict
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
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_dict
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
