import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "Smart Alumni Connect"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    # IMPORTANT: Change this in production!
    SECRET_KEY: str = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7") 
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    SQLALCHEMY_DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://admin:hackathon@localhost:5432/alumni_db")

settings = Settings()
