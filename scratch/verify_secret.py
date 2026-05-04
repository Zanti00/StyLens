import sys
import os

# Find the project root
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
backend_dir = os.path.join(project_root, 'apps', 'backend')

sys.path.append(backend_dir)
os.chdir(backend_dir)

from app.config import settings
from jose import jwt

token = settings.supabase_service_role_key
secret = settings.supabase_jwt_secret

print(f"Token: {token[:20]}...")
print(f"Secret: {secret}")

try:
    # Decode without verification first to see what's inside
    payload_unverified = jwt.get_unverified_claims(token)
    print(f"Unverified Payload: {payload_unverified}")

    payload = jwt.decode(
        token,
        secret,
        algorithms=["HS256"],
        options={"verify_aud": False}
    )
    print("Verification Successful!")
    print(f"Payload: {payload}")
except Exception as e:
    print(f"Verification Failed: {str(e)}")
