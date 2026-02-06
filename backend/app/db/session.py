from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# This matches the user/password in your docker-compose.yml
# Docker runs on localhost for your PC, port 5432
SQLALCHEMY_DATABASE_URL = "postgresql://admin:hackathon@localhost:5432/alumni_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to use in your API endpoints
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()