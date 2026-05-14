import uuid
import magic
from typing import Any
from fastapi import UploadFile, HTTPException
from app.config import settings
from supabase import create_client, Client

class StorageService:
    def __init__(self):
        self.supabase: Client = create_client(settings.supabase_url, settings.supabase_service_role_key)
        self.bucket_name = "closet"

    async def upload_image(self, file: UploadFile, user_id: str) -> dict:
        """
        Validates and uploads an image to Supabase Storage.
        """
        # 1. Validate File Size (Max 10MB)
        file_content = await file.read()
        if len(file_content) > 2 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large (max 2MB)")

        # 2. Validate MIME Type via Magic Bytes
        mime_type = magic.from_buffer(file_content, mime=True)
        allowed_types = ["image/jpeg", "image/png", "image/webp"]
        if mime_type not in allowed_types:
            raise HTTPException(status_code=400, detail=f"Invalid file type: {mime_type}. Allowed: JPEG, PNG, WEBP")

        # 3. Generate Unique Path
        extension = mime_type.split("/")[-1]
        file_name = f"{uuid.uuid4()}.{extension}"
        file_path = f"{user_id}/{file_name}"

        # 4. Upload to Supabase
        try:
            # Note: storage().from_().upload() expects bytes
            self.supabase.storage.from_(self.bucket_name).upload(
                path=file_path,
                file=file_content,
                file_options={"content-type": mime_type}
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")

        # 5. Return Path and Public URL
        return {
            "path": file_path,
            "url": self.get_signed_url(file_path)
        }

    def get_signed_url(self, file_path: str, expires_in: int = 3600) -> str:
        """
        Generates a short-lived signed URL for a private file.
        """
        try:
            res = self.supabase.storage.from_(self.bucket_name).create_signed_url(file_path, expires_in)
            return res["signedURL"]
        except Exception as e:
            # Fallback or error handling
            return ""

    def get_signed_urls(self, file_paths: list[str], expires_in: int = 3600) -> list[dict[str, Any]]:
        """
        Generates multiple short-lived signed URLs at once.
        Chunks the requests to avoid Supabase storage limits.
        """
        if not file_paths:
            return []
            
        all_results = []
        # Chunk into batches of 50
        batch_size = 50
        for i in range(0, len(file_paths), batch_size):
            batch = file_paths[i : i + batch_size]
            try:
                res = self.supabase.storage.from_(self.bucket_name).create_signed_urls(batch, expires_in)
                if res:
                    # Convert response objects to dicts to ensure consistency with fallback
                    all_results.extend([
                        r if isinstance(r, dict) else {
                            "path": getattr(r, "path", None),
                            "signedURL": getattr(r, "signedURL", getattr(r, "signedUrl", None))
                        } for r in res
                    ])
            except Exception as e:
                # If batch fails (e.g. validation error due to a missing file), fallback to individual calls
                print(f"Batch failed, falling back to individual calls for {len(batch)} items: {e}")
                for path in batch:
                    try:
                        s_url = self.get_signed_url(path, expires_in)
                        if s_url:
                            all_results.append({"path": path, "signedURL": s_url})
                    except Exception:
                        continue
                
        return all_results

    async def delete_image(self, file_path: str):
        """
        Deletes an image from storage.
        """
        try:
            self.supabase.storage.from_(self.bucket_name).remove([file_path])
        except Exception as e:
            pass # Log error but don't fail

storage_service = StorageService()
