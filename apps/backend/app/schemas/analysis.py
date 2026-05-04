from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class AnalysisBase(BaseModel):
    weather_location: Optional[str] = None
    user_weather_input: Optional[str] = None # User specified weather

class AnalysisCreate(AnalysisBase):
    pass

class ColorAnalysis(BaseModel):
    hex_codes: List[str]
    verdict: str

class AnalysisResult(BaseModel):
    id: str
    rating: Optional[float] = None
    color_analysis: Optional[ColorAnalysis] = None
    fit_proportion_analysis: Optional[str] = None
    style_notes_tips: List[str] = []
    overall_summary: Optional[str] = None
    image_url: str
    weather_context: Optional[dict] = None
    created_at: datetime

class ApiResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[dict] = None
