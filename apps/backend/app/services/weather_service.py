import httpx
from typing import Optional, Dict
from app.config import settings

class WeatherService:
    def __init__(self):
        self.api_key = settings.weather_api_key
        self.base_url = "https://api.openweathermap.org/data/2.5/weather"

    async def get_weather(self, location: str) -> Optional[Dict]:
        """
        Fetches current weather for a location (city name or 'lat,lon').
        """
        if not self.api_key or self.api_key == "your-weather-api-key":
            return None

        params = {
            "q": location,
            "appid": self.api_key,
            "units": "metric"
        }
        
        # Check if location looks like lat,lon
        if "," in location:
            parts = location.split(",")
            if len(parts) == 2 and all(p.strip().replace(".", "").replace("-", "").isdigit() for p in parts):
                params = {
                    "lat": parts[0].strip(),
                    "lon": parts[1].strip(),
                    "appid": self.api_key,
                    "units": "metric"
                }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(self.base_url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "temp": data["main"]["temp"],
                        "condition": data["weather"][0]["description"],
                        "location": data["name"]
                    }
            except Exception:
                pass
        return None

weather_service = WeatherService()
