from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    supabase_url: str = "your-supabase-url"
    supabase_service_role_key: str = "your-service-role-key"
    supabase_jwt_secret: str = "your-jwt-secret"
    llm_api_key: str = "your-llm-api-key"
    weather_api_key: str = "your-weather-api-key"
    environment: str = "development"

    class Config:
        env_file = ".env"

settings = Settings()
