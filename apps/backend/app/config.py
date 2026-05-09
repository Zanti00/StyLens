from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    supabase_url: str = "your-supabase-url"
    supabase_service_role_key: str = "your-service-role-key"
    supabase_jwt_secret: str = "your-jwt-secret"
    supabase_public_key: str = "" # Optional, for RS256
    llm_api_key: str = "your-llm-api-key"
    gemini_api_key: str | None = None
    weather_api_key: str = "your-weather-api-key"
    environment: str = "development"

    class Config:
        env_file = ".env"

settings = Settings()
