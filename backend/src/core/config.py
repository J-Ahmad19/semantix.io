from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    REDIS_URL: str = "redis://localhost:6379"
    DATABASE_URL: str = "postgresql+asyncpg://semantix:password@localhost:5432/semantix_db"
    
    # NLP Model config
    MODEL_NAME: str = "all-MiniLM-L6-v2"
    
    # Game mechanics
    ROUND_DURATION_SECONDS: int = 60

settings = Settings()
