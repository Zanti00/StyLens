import asyncio
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load env from backend
load_dotenv(dotenv_path="../.env")

async def verify_connection():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not key or "your-" in url or "your-" in key:
        print("❌ Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set correctly in apps/backend/.env")
        return

    print(f"Connecting to: {url}...")
    try:
        supabase: Client = create_client(url, key)
        
        # Check profiles table
        try:
            res = supabase.table("profiles").select("count", count="exact").limit(1).execute()
            print("✅ 'profiles' table exists and is accessible.")
        except Exception as e:
            print(f"❌ Error accessing 'profiles' table: {e}")
            print("   (This usually means you haven't run the SQL migrations in the Supabase Dashboard yet)")

        # Check analyses table
        try:
            res = supabase.table("analyses").select("count", count="exact").limit(1).execute()
            print("✅ 'analyses' table exists and is accessible.")
        except Exception as e:
            print(f"❌ Error accessing 'analyses' table: {e}")

    except Exception as e:
        print(f"❌ Failed to connect to Supabase: {e}")

if __name__ == "__main__":
    asyncio.run(verify_connection())
