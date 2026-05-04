from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.config import settings

bearer_scheme = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """
    Verifies the Supabase-issued JWT.
    Does NOT issue tokens, manage sessions, or handle refresh.
    All of that is Supabase's responsibility.
    """
    token = credentials.credentials
    print(f"DEBUG: Received token starting with: {token[:10]}...")
    try:
        import json
        # Determine algorithm and key
        algorithm = "ES256" if settings.supabase_public_key else "HS256"
        secret_or_key = settings.supabase_public_key if settings.supabase_public_key else settings.supabase_jwt_secret
        
        # Clean PEM key if it's asymmetric and has escaped newlines
        if settings.supabase_public_key and "\\n" in secret_or_key:
            secret_or_key = secret_or_key.replace("\\n", "\n")
        
        # Handle JWK (JSON format)
        if settings.supabase_public_key and secret_or_key.strip().startswith("{"):
            try:
                secret_or_key = json.loads(secret_or_key)
            except Exception:
                pass # Fallback to string if JSON parsing fails

        payload = jwt.decode(
            token,
            secret_or_key,
            algorithms=["ES256", "RS256", "HS256"],
            options={"verify_aud": False},
        )
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing subject"
            )

        return {
            "id": user_id,
            "email": payload.get("email"),
            "aal": payload.get("aal"),   # aal1 = password only, aal2 = MFA verified
        }
    except JWTError as e:
        print(f"JWT Verification Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
