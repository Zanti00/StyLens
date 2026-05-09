from app.config import settings
from supabase import create_client, Client
from datetime import datetime, timezone

class AnalysisRepository:
    def __init__(self):
        self.supabase: Client = create_client(settings.supabase_url, settings.supabase_service_role_key)
        self.table = "analyses"

    async def create_analysis(self, data: dict) -> dict:
        """
        Inserts a new analysis record into the database.
        """
        response = self.supabase.table(self.table).insert(data).execute()
        if len(response.data) > 0 and isinstance(response.data[0], dict):
            return response.data[0]
        return {}

    async def get_user_analyses(self, user_id: str, limit: int = 10, offset: int = 0) -> list:
        """
        Retrieves paginated analysis history for a user.
        """
        response = self.supabase.table(self.table)\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .range(offset, offset + limit - 1)\
            .execute()
        return response.data

    async def get_analysis_by_id(self, analysis_id: str, user_id: str) -> dict:
        """
        Retrieves a single analysis by ID, ensuring it belongs to the user.
        """
        response = self.supabase.table(self.table)\
            .select("*")\
            .eq("id", analysis_id)\
            .eq("user_id", user_id)\
            .execute()
        if len(response.data) > 0 and isinstance(response.data[0], dict):
            return response.data[0]
        return {}

    async def delete_analysis(self, analysis_id: str, user_id: str) -> bool:
        """
        Deletes an analysis record.
        """
        response = self.supabase.table(self.table)\
            .delete()\
            .eq("id", analysis_id)\
            .eq("user_id", user_id)\
            .execute()
        return len(response.data) > 0

    async def get_daily_usage_count(self, user_id: str) -> int:
        """
        Gets the total number of analyses created by the user today.
        """
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
        response = (
            self.supabase.table(self.table)
            .select("id", count="exact")  # type: ignore
            .eq("user_id", user_id)
            .gte("created_at", today_start)
            .execute()
        )
        return response.count if response.count is not None else len(response.data)

analysis_repo = AnalysisRepository()
