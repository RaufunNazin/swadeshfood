from sqlalchemy import text
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from . import models
from .database import engine, get_db
from .routers import user, auth, product, order, categories, admin
from dotenv import load_dotenv
from sqlalchemy.orm import Session
import os

load_dotenv()

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# --- UPDATE THIS BLOCK ---
current_directory = os.path.dirname(os.path.realpath(__file__))
# Use '..' to go up from 'app' to 'backend'
static_folder_path = os.path.abspath(os.path.join(current_directory, "..", "static"))

# Safety Check: Log the path so you can see it in journalctl
print(f"DEBUG: Static files being served from: {static_folder_path}")

app.mount("/static", StaticFiles(directory=static_folder_path), name="static")

# In your main FastAPI file
origins = [
    "http://localhost:5173",
    "https://swadeshfood.app",
    "https://www.swadeshfood.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    try:
        # Perform a tiny query to verify the DB connection
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected", "version": "1.0.0"}
    except Exception as e:
        # If DB is down, return a 503 Service Unavailable
        raise HTTPException(
            status_code=503, detail=f"Database connection failed: {str(e)}"
        )


# Change where you include your routers
app.include_router(user.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(product.router, prefix="/api")
app.include_router(order.router, prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
