from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class StylePreference(str, Enum):
    CASUAL = "CASUAL"
    FORMAL = "FORMAL"
    STREETWEAR = "STREETWEAR"
    BUSINESS_CASUAL = "BUSINESS_CASUAL"
    ATHLEISURE = "ATHLEISURE"

class AnalysisBase(BaseModel):
    style_preference: StylePreference
    weather_location: Optional[str] = None
    user_weather_input: Optional[str] = None # User specified weather

class AnalysisCreate(AnalysisBase):
    pass

class AnalysisResult(BaseModel):
    id: str
    rating: Optional[int] = None
    color_feedback: Optional[str] = None
    styling_tips: List[str] = []
    overall_summary: Optional[str] = None
    image_url: str
    weather_context: Optional[dict] = None
    created_at: datetime

class ApiResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[dict] = None
