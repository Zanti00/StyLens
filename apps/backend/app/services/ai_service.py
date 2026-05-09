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
        mock: bool = True
    ) -> Dict[str, Any]:
        """
        Analyzes an outfit based on images and weather context using Gemini AI.
        If mock=True, it returns a hardcoded structure to save API limits.
        """
        if mock:
            return self._get_mock_analysis(weather_context)

        if not self.client:
            logger.warning("Gemini API key is not set. Falling back to mock data.")
            return self._get_mock_analysis(weather_context)

        # Build prompt
        prompt = self._build_prompt(weather_context)
        
        # NOTE: For a real implementation with images, we would fetch the image bytes or 
        # use the Gemini File API to pass the images to the model. 
        # Here we only structure the prompt and request logic.
        
        try:
            # Setup generation config to ensure JSON output
            # You can also use pydantic schema for structured output in google-genai
            # e.g., response_schema = YourPydanticModel
            response = self.client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
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
            return self._get_mock_analysis(weather_context)
        except Exception as e:
            logger.error(f"Error during AI analysis: {e}")
            # Fallback to mock on error
            return self._get_mock_analysis(weather_context)

    def _build_prompt(self, weather_context: Optional[Dict[str, Any]]) -> str:
        weather_info = "No specific weather context provided."
        if weather_context:
            condition = weather_context.get("condition", "unknown")
            temp = weather_context.get("temp", "unknown")
            location = weather_context.get("location", "unknown")
            weather_info = f"Condition: {condition}, Temperature: {temp}°C, Location: {location}"

        categories_str = ", ".join([f'"{c}"' for c in STYLE_CATEGORIES])

        prompt = f"""You are an expert fashion stylist with a keen eye for modern trends, aesthetics, and practical styling.
Your task is to analyze the provided outfit image(s) and deliver a comprehensive fashion critique.

**EVALUATION RUBRIC:**
1. **Color Harmony**: Evaluate the color palettes used. Do the colors complement each other? Are there clashing tones or harmonious contrasts? Extract the dominant hex codes.
2. **Fit & Proportions**: Judge the silhouette, tailoring, and layering. Does the clothing fit well? Are the proportions balanced?
3. **Contextual Appropriateness**: Determine if the outfit suits the current weather. 
   - Current Weather Context: {weather_info}
4. **Originality & Styling**: Assess the use of accessories, unique details, and the overall aesthetic vibe.

**INSTRUCTIONS:**
You must provide your analysis strictly in JSON format matching the following structure exactly. Do NOT wrap the JSON in markdown blocks like ```json ... ```, output only the raw JSON.

**JSON SCHEMA:**
{{
  "title": "A catchy, short title for the outfit (e.g., 'Urban Winter Layering', 'Casual Summer Chic')",
  "rating": <float between 0.0 and 10.0 representing the overall style score>,
  "overall_summary": "A 1-2 sentence overall impression of the outfit.",
  "color_analysis": {{
    "hex_codes": ["<hex_code_1>", "<hex_code_2>"], // 2 to 4 dominant hex colors (e.g., '#FFFFFF')
    "verdict": "A brief analysis of the color harmony based on the rubric."
  }},
  "fit_proportion_analysis": "A detailed analysis of the fit and proportions based on the rubric.",
  "style_notes_tips": [
    "Tip 1...",
    "Tip 2..."
  ], // 2 to 4 actionable styling tips or notes
  "style_preference": ["<category_1>", "<category_2>"] 
}}

**CRITICAL CONSTRAINT for `style_preference`:**
The `style_preference` array MUST ONLY contain values from the following list. Do not invent new categories. Select 1 to 4 categories that best match the outfit:
[{categories_str}]
"""
        return prompt

    def _get_mock_analysis(self, weather_context: Optional[Dict[str, Any]]) -> Dict[str, Any]:
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
