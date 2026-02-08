import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
settings = Settings()

if settings.GEMINI_API_KEY:
    print("✅ Loaded GEMINI_API_KEY (Masked)")
else:
    print("❌ GEMINI_API_KEY not found in environment variables.")
