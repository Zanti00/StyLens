from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from typing import Optional, List
from app.dependencies.auth import get_current_user
from app.services.storage_service import storage_service
from app.services.weather_service import weather_service
from app.repositories.analysis_repo import analysis_repo
from app.services.ai_service import ai_service
from app.schemas.analysis import ApiResponse

STYLE_CATEGORIES = [
    "Casual", "Smart Casual", "Athleisure", "Minimalist", "Formal / Black Tie",
    "Business Professional", "Business Casual", "Semi-Formal", "Streetwear", "Urban",
    "Skater", "Hip-Hop", "Vintage", "Retro", "Y2K", "Classic / Old Money",
    "Traditional / Cultural", "Ethnic Fusion", "Festival Wear", "Goth", "Punk",
    "Grunge", "Emo", "Soft Girl / Soft Boy", "Dark Academia", "Light Academia",
    "Cottagecore", "Clean Girl / Clean Boy", "E-Girl / E-Boy", "Summer Wear",
    "Winter Wear", "Rainy / Waterproof", "Outdoor / Utility", "Luxury / Designer",
    "Avant-Garde", "Preppy", "Bohemian (Boho)", "Sporty", "Techwear", "Androgynous",
    "K-Fashion", "Harajuku", "Scandinavian", "Normcore"
]

router = APIRouter()

@router.post("/", response_model=ApiResponse)
async def create_analysis(
    files: List[UploadFile] = File(...),
    weather_location: Optional[str] = Form(None),
    user_weather_input: Optional[str] = Form(None),
    user_additional_info: Optional[str] = Form(None),
    user: dict = Depends(get_current_user)
):
    import random
    
    # 1. Upload Images
    upload_results = []
    for file in files:
        res = await storage_service.upload_image(file, user["id"])
        upload_results.append(res)
    
    if not upload_results:
        raise HTTPException(status_code=400, detail="At least one image is required")
        
    primary_image = upload_results[0]
    auxiliary_paths = [res["path"] for res in upload_results[1:]]
    all_paths = [primary_image["path"]] + auxiliary_paths
    
    # 2. Get Weather Context (Optional)
    weather_context = None
    if user_weather_input:
        weather_context = {"condition": user_weather_input, "source": "user"}
    else:
        # Default to Philippines if geolocation was denied or missing
        loc = weather_location if weather_location else "Philippines"
        weather_context = await weather_service.get_weather(loc)
        if weather_context:
            weather_context["source"] = "api"

    # 3. Call AI Service
    daily_count = await analysis_repo.get_daily_usage_count(user["id"])
    LIMIT = 20
    should_mock = daily_count >= LIMIT

    ai_result = await ai_service.analyze_outfit(
        image_paths=all_paths, 
        weather_context=weather_context,
        user_additional_info=user_additional_info,
        mock=should_mock
    )
    
    analysis_data = {
        "user_id": user["id"],
        "title": ai_result.get("title", "Outfit Analysis"),
        "image_url": primary_image["url"],
        "image_path": primary_image["path"],
        "auxiliary_image_paths": auxiliary_paths,
        "weather_context": weather_context,
        "rating": ai_result.get("rating", 0.0),
        "overall_summary": ai_result.get("overall_summary", ""),
        "color_analysis": ai_result.get("color_analysis", {}),
        "fit_proportion_analysis": ai_result.get("fit_proportion_analysis", ""),
        "style_notes_tips": ai_result.get("style_notes_tips", []),
        "style_preference": ai_result.get("style_preference", []),
        "user_additional_info": user_additional_info,
        "status": "completed"
    }

    is_generic = ai_result.get("is_generic", False)

    # 4. Save to DB
    saved_record = await analysis_repo.create_analysis(analysis_data)
    saved_record["is_generic"] = is_generic
    
    # Include all signed URLs in the response
    all_paths = [saved_record["image_path"]] + (saved_record.get("auxiliary_image_paths") or [])
    signed_urls = storage_service.get_signed_urls(all_paths)
    saved_record["image_urls"] = [res["signedURL"] for res in signed_urls if "signedURL" in res]
    
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
    
    # 1. Collect all unique image paths
    all_image_paths = set()
    for item in history:
        if path := item.get("image_path"):
            all_image_paths.add(path)
        if aux_paths := item.get("auxiliary_image_paths"):
            for p in aux_paths:
                if p: all_image_paths.add(p)
            
    # 2. Batch refresh signed URLs
    if all_image_paths:
        signed_urls = storage_service.get_signed_urls(list(all_image_paths))
        # Handle different potential key names from Supabase (signedURL vs signedUrl, path vs name)
        url_map = {}
        for res in signed_urls:
            s_url = res.get("signedURL") or res.get("signedUrl")
            p_path = res.get("path") or res.get("name")
            if s_url and p_path:
                url_map[p_path] = s_url
        
        # 3. Map refreshed URLs back to items
        for item in history:
            # Primary image
            path = item.get("image_path")
            if path in url_map:
                item["image_url"] = url_map[path]
            
            # Auxiliary images
            aux_paths = item.get("auxiliary_image_paths") or []
            item_urls = []
            # Start with primary if updated
            if path in url_map:
                item_urls.append(url_map[path])
            
            for aux_path in aux_paths:
                if aux_path in url_map:
                    item_urls.append(url_map[aux_path])
            
            if item_urls:
                item["image_urls"] = item_urls

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
        
    # Refresh signed URLs
    all_paths = []
    if record.get("image_path"):
        all_paths.append(record["image_path"])
    if record.get("auxiliary_image_paths"):
        all_paths.extend(record["auxiliary_image_paths"])
        
    if all_paths:
        signed_urls = storage_service.get_signed_urls(all_paths)
        urls = [res["signedURL"] for res in signed_urls if "signedURL" in res]
        record["image_urls"] = urls
        if urls:
            record["image_url"] = urls[0]

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
    daily_count = await analysis_repo.get_daily_usage_count(user["id"])
    return {
        "success": True,
        "data": {
            "used": daily_count,
            "limit": 20,
            "reset_in_hours": 24 # Just hardcoding a static reset time for now
        },
        "error": None
    }
