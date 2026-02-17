from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("DB_URL")
engine = create_engine(
    url,
    pool_recycle=3600,  # Refresh connections every hour
    pool_pre_ping=True  # Check if connection is alive before using it
)
SessionLocal = sessionmaker(autocommit = False, autoflush = False, bind = engine)
Base = declarative_base()

def get_db() :
    db = SessionLocal()
    try :
        yield db
    finally :
        db.close()