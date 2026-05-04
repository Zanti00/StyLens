import sys
import os
from jose import jwt

# Anon key from frontend .env.local
anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxY2V2anRkdmt3emtjZm9rb3F1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MTk5MzksImV4cCI6MjA5MzE5NTkzOX0.v7D34W3ClbnyAIebFUSgZ3nmMzbN_2VzKoe-0buSuZQ"
secret = "b88031c5-ebc3-429f-a21c-4ca3a3b961a2"

print(f"Token: {anon_key[:20]}...")
print(f"Secret: {secret}")

try:
    payload = jwt.decode(
        anon_key,
        secret,
        algorithms=["HS256"],
        options={"verify_aud": False}
    )
    print("Verification Successful!")
    print(f"Payload: {payload}")
except Exception as e:
    print(f"Verification Failed: {str(e)}")
