import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Security
    APP_API_KEY: str = os.getenv("APP_API_KEY", "default-secret-key")
    
    # Roboflow
    ROBOFLOW_API_KEY: str = os.getenv("ROBOFLOW_API_KEY", "")
    ROBOFLOW_ENDPOINT: str = os.getenv("ROBOFLOW_ENDPOINT", "")
    
    # Detection
    CONFIDENCE_THRESHOLD: float = float(os.getenv("CONFIDENCE_THRESHOLD", "0.4"))
    
    # Application
    HOST_URL: str = os.getenv("HOST_URL", "http://localhost:8000")
    AUDIO_TTL_MINUTES: int = int(os.getenv("AUDIO_TTL_MINUTES", "60"))
    
    # CORS
    ALLOWED_ORIGINS: list = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:8080").split(",")

settings = Settings()