from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from typing import Optional, List
from app.dependencies.auth import get_current_user
from app.services.storage_service import storage_service
from app.services.weather_service import weather_service
from app.repositories.analysis_repo import analysis_repo
from app.schemas.analysis import ApiResponse, StylePreference

router = APIRouter()

@router.post("/", response_model=ApiResponse)
async def create_analysis(
    file: UploadFile = File(...),
    style_preference: StylePreference = Form(...),
    weather_location: Optional[str] = Form(None),
    user_weather_input: Optional[str] = Form(None),
    user: dict = Depends(get_current_user)
):
    # 1. Upload Image
    upload_result = await storage_service.upload_image(file, user["id"])
    
    # 2. Get Weather Context (Optional)
    weather_context = None
    if user_weather_input:
        weather_context = {"condition": user_weather_input, "source": "user"}
    elif weather_location:
        weather_context = await weather_service.get_weather(weather_location)
        if weather_context:
            weather_context["source"] = "api"

    # 3. Placeholder for AI Analysis (Skipped per user request)
    # result = await llm_service.analyze_outfit(...)
    
    # Dummy result for now
    analysis_data = {
        "user_id": user["id"],
        "image_url": upload_result["url"],
        "image_path": upload_result["path"],
        "style_preference": style_preference,
        "weather_context": weather_context,
        "rating": None,  # Will be filled by AI later
        "overall_summary": "AI analysis skipped for now."
    }

    # 4. Save to DB
    saved_record = await analysis_repo.create_analysis(analysis_data)
    
    return {
        "success": True,
        "data": saved_record,
        "error": None
    }

@router.get("/", response_model=ApiResponse)
async def get_history(
    limit: int = 10,
    offset: int = 0,
    user: dict = Depends(get_current_user)
):
    history = await analysis_repo.get_user_analyses(user["id"], limit, offset)
    return {
        "success": True,
        "data": {"items": history},
        "error": None
    }

@router.get("/{analysis_id}", response_model=ApiResponse)
async def get_analysis(
    analysis_id: str,
    user: dict = Depends(get_current_user)
):
    record = await analysis_repo.get_analysis_by_id(analysis_id, user["id"])
    if not record:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    return {
        "success": True,
        "data": record,
        "error": None
    }

@router.get("/stats/usage", response_model=ApiResponse)
async def get_usage_stats(user: dict = Depends(get_current_user)):
    """
    Returns the user's daily analysis usage and limit.
    """
    # For now, return static data or fetch from daily_usage table if implemented
    return {
        "success": True,
        "data": {
            "used": 3,
            "limit": 5,
            "reset_in_hours": 12
        },
        "error": None
    }
