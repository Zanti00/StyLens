import json
import random
import logging
from typing import List, Dict, Any, Optional
from google import genai
from google.genai import types
from google.genai.errors import APIError
from pydantic import BaseModel
from app.config import settings

logger = logging.getLogger(__name__)

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

class AIService:
    def __init__(self):
        self.api_key = settings.gemini_api_key
        self.client = genai.Client(api_key=self.api_key) if self.api_key else None
        
    async def analyze_outfit(
        self, 
        image_paths: List[str], 
        weather_context: Optional[Dict[str, Any]] = None, 
        user_additional_info: Optional[str] = None,
        mock: bool = True
    ) -> Dict[str, Any]:
        """
        Analyzes an outfit based on images and weather context using Gemini AI.
        If mock=True, it returns a hardcoded structure to save API limits.
        """
        if mock:
            return self._get_mock_analysis(weather_context, user_additional_info)

        if not self.client:
            logger.warning("Gemini API key is not set. Falling back to mock data.")
            return self._get_mock_analysis(weather_context, user_additional_info)

        # Build prompt
        prompt = self._build_prompt(weather_context, user_additional_info)
        
        # Fetch image bytes and prepare contents
        from app.services.storage_service import storage_service
        import mimetypes
        
        contents_to_send: List[Any] = [prompt]
        
        try:
            for path in image_paths:
                image_bytes = storage_service.supabase.storage.from_(storage_service.bucket_name).download(path)
                mime_type, _ = mimetypes.guess_type(path)
                mime_type = mime_type or "image/jpeg"
                contents_to_send.append(
                    types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
                )
        except Exception as e:
            logger.error(f"Failed to fetch images for AI analysis: {e}")
            # If we strictly need images for analysis, we might mock or raise
            # We'll continue with just prompt or fallback to mock
            return self._get_mock_analysis(weather_context, user_additional_info)
        
        try:
            # Setup generation config to ensure JSON output
            # You can also use pydantic schema for structured output in google-genai
            # e.g., response_schema = YourPydanticModel
            response = self.client.models.generate_content(
                model='gemini-2.5-flash',
                contents=contents_to_send,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.7,
                )
            )
            
            result_json = response.text
            if not result_json:
                raise ValueError("Received empty response from Gemini API.")
            parsed_result = json.loads(result_json)
            
            # Post-process to ensure style_preference is valid
            valid_styles = []
            for style in parsed_result.get("style_preference", []):
                if style in STYLE_CATEGORIES:
                    valid_styles.append(style)
            parsed_result["style_preference"] = valid_styles if valid_styles else random.sample(STYLE_CATEGORIES, 2)
            
            return parsed_result

        except APIError as e:
            if e.code == 429:
                logger.warning(f"Gemini API Quota Exceeded (429). Falling back to mock. Details: {e}")
            else:
                logger.error(f"Gemini API Error: {e}")
            return self._get_mock_analysis(weather_context, user_additional_info)
        except Exception as e:
            logger.error(f"Error during AI analysis: {e}")
            # Fallback to mock on error
            return self._get_mock_analysis(weather_context, user_additional_info)

    def _build_prompt(self, weather_context: Optional[Dict[str, Any]], user_additional_info: Optional[str] = None) -> str:
        weather_info = "No specific weather context provided."
        if weather_context:
            condition = weather_context.get("condition", "unknown")
            temp = weather_context.get("temp", "unknown")
            location = weather_context.get("location", "unknown")
            weather_info = f"Condition: {condition}, Temperature: {temp}°C, Location: {location}"
        
        user_info = f"User's Additional Context: {user_additional_info}" if user_additional_info else "No additional context provided by the user."

        categories_str = ", ".join([f'"{c}"' for c in STYLE_CATEGORIES])

        prompt = f"""You are an objective, honest, and constructive fashion stylist. You provide realistic feedback without sugarcoating, but you remain encouraging. If an outfit works well, praise it. If it has flaws, is ill-fitting, or is inappropriate for the context, point it out constructively and offer actionable solutions.

**EVALUATION RUBRIC:**
1. **Color Harmony**: Evaluate the color palettes used. Do the colors work well together? Are there clashing tones or washed-out areas? Extract the dominant hex codes.
2. **Fit & Proportions**: Judge the silhouette, tailoring, and layering. Is the fit flattering? Are the proportions balanced? Note any areas that could use better tailoring.
3. **Contextual Appropriateness (Crucial)**: Evaluate if the outfit makes sense for the weather and location. If they are dressed too warm for the heat or too light for the cold, point it out clearly.
   - Current Context: {weather_info}
   - User Input: {user_info}
4. **Originality & Styling**: Assess accessories and details. Is the outfit well-styled, or does it feel generic? Suggest what could elevate the look.

**INSTRUCTIONS:**
You must provide your analysis strictly in JSON format matching the following structure exactly. Do NOT wrap the JSON in markdown blocks like ```json ... ```, output only the raw JSON.

**JSON SCHEMA:**
{{
  "title": "A catchy, short title for the outfit (e.g., 'Casual Comfort', 'Solid but Needs Contrast')",
  "rating": <float between 0.0 and 10.0 representing the overall style score. Be objective and fair>,
  "overall_summary": "A 1-2 sentence honest but constructive overall impression of the outfit. Highlight what works and what doesn't.",
  "color_analysis": {{
    "hex_codes": ["<hex_code_1>", "<hex_code_2>"], // 2 to 4 dominant hex colors (e.g., '#FFFFFF')
    "verdict": "A brief analysis of the color harmony based on the rubric."
  }},
  "fit_proportion_analysis": "An objective analysis of the fit and proportions. Highlight both positives and areas for improvement.",
  "style_notes_tips": [
    "Tip 1...",
    "Tip 2..."
  ], // 2 to 4 actionable and helpful styling tips
  "style_preference": ["<category_1>", "<category_2>"] 
}}

**CRITICAL CONSTRAINT for `style_preference`:**
The `style_preference` array MUST ONLY contain values from the following list. Do not invent new categories. Select 1 to 4 categories that best match the outfit:
[{categories_str}]
"""
        return prompt

    def _get_mock_analysis(self, weather_context: Optional[Dict[str, Any]], user_additional_info: Optional[str] = None) -> Dict[str, Any]:
        """Returns a mocked AI response."""
        weather_summary = "Looks great!"
        if weather_context:
            temp = weather_context.get("temp")
            condition = weather_context.get("condition")
            if temp and isinstance(temp, (int, float)):
                if temp < 15:
                    weather_summary = "Great layering for the cooler weather."
                elif temp > 25:
                    weather_summary = "Perfectly breathable for the heat."
            if condition:
                weather_summary += f" Suits the {condition} conditions well."

        return {
            "title": "Mocked AI Style Analysis",
            "rating": round(random.uniform(7.0, 9.5), 1),
            "overall_summary": f"A very well-put-together outfit. {weather_summary}",
            "color_analysis": {
                "hex_codes": ["#2C3E50", "#E74C3C", "#ECF0F1"],
                "verdict": "Strong color harmony with an excellent pop of contrast."
            },
            "fit_proportion_analysis": "The silhouette is balanced nicely, though the jacket could be slightly more tailored.",
            "style_notes_tips": [
                "Consider adding a subtle silver accessory to bridge the tones.",
                "Rolling the cuffs slightly would improve the proportion."
            ],
            "style_preference": random.sample(STYLE_CATEGORIES, k=random.randint(2, 3)),
            "is_generic": True
        }

ai_service = AIService()
