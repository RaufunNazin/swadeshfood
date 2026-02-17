from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from . import models
from .database import engine
from .routers import user, auth, product, order, categories, admin
from dotenv import load_dotenv

load_dotenv()

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

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

# Change where you include your routers
app.include_router(user.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(product.router, prefix="/api")
app.include_router(order.router, prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
