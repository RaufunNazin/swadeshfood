from fastapi import Depends, APIRouter, HTTPException, Form, File, UploadFile, Request
from fastapi.exceptions import HTTPException
from ..database import get_db, SessionLocal
from sqlalchemy.orm import Session
from ..schemas import User, ResponseUser, Token, Product
from passlib.context import CryptContext
from .. import models, oauth2
from ..oauth2 import check_authorization
import shutil
import os

router = APIRouter()

# function to download the file uploaded by the user, create new folder if not exist
def save_file(file, file_path):
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

# get request with pagination
@router.get("/products", status_code=200, tags=['product'])
def get_products(offset: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    products = db.query(models.Product).offset(offset).limit(limit).all()
    return products

# get products sizes
router.get("/sizes/{product_id}", status_code=200, tags=['product'])
def get_sizes(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).all()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product.size

# post request to upload photo and save photo information to the database
@router.post("/products", status_code=201, tags=['product'])
async def upload_photo(request: Request, image: UploadFile = File(...), name: str = Form(...), description: str = Form(...), category: str = Form(...), price: str = Form(...), stock: str = Form(...), size: str = Form(...), new: str = Form(...), user = Depends(oauth2.get_current_user)):
    check_authorization(user)
    
    # Get the server's base URL
    base_url = request.base_url

    # Get the directory path of the current module
    current_directory = os.path.dirname(os.path.realpath(__file__))

    # Create a new folder named 'photos' in the current directory if it doesn't exist
    folder_path = os.path.join(current_directory, "..", "..", "assets", "products")
    os.makedirs(folder_path, exist_ok=True)

    # Save the uploaded photo to the specified folder
    file_location = os.path.join(folder_path, f"{name}.png")
    with open(file_location, "wb") as file_object:
        file_object.write(image.file.read())

    # Construct the URL for the uploaded photo
    photo_url = f"{base_url}assets/products/{name}.png"

    # Save photo information to the database
    db = SessionLocal()
    db_photo = Product(photo=photo_url, name=name, description=description, category=category, price=price, stock=stock, size=size, new=new)
    db.add(db_photo)
    db.commit()
    db.refresh(db_photo)
    db.close()

    return {"filename": image.filename, "name": name, "description": description, "category": category, "photo_url": photo_url, "price": price, "stock": stock, "size": size, "new": new}

# get product by id
@router.get("/products/{product_id}", status_code=200, tags=['product'])
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# update product by id
@router.put("/products/{product_id}", status_code=200, response_model=Product, tags=['product'])
def update_product(product_id: int, product: Product, user = Depends(oauth2.get_current_user), db: Session = Depends(get_db)):
    check_authorization(user)
    product_to_update = db.query(models.Product).filter(models.Product.id == product_id).first()
    if product_to_update is None:
        raise HTTPException(status_code=404, detail="Product not found")
    for key, value in product.dict().items():
        setattr(product_to_update, key, value)
    db.commit()
    db.refresh(product_to_update)
    return product_to_update

# filter products by any of the category, size, stock and new
@router.get("/filter", status_code=200, tags=['product'])
def filter_products(category: str = None, size: str = None, new: int = None, stock: int = None, db: Session = Depends(get_db)):
    products = db.query(models.Product)
    if category:
        products = products.filter(models.Product.category == category)
    if size:
        products = products.filter(models.Product.size == size)
    if new:
        products = products.filter(models.Product.new == new)
    if stock:
        products = products.filter(models.Product.stock == stock)
    return products.all()

# sort by price ascending or descending
@router.get("/sort", status_code=200, tags=['product'])
def sort_products(order: str, db: Session = Depends(get_db)):
    if order == "asc":
        products = db.query(models.Product).order_by(models.Product.price)
    elif order == "desc":
        products = db.query(models.Product).order_by(models.Product.price.desc())
    else:
        raise HTTPException(status_code=400, detail="Invalid order")
    return products.all()

# delete product by id
@router.delete("/products/{product_id}", status_code=204, tags=['product'])
def delete_product(product_id: int, user = Depends(oauth2.get_current_user), db: Session = Depends(get_db)):
    check_authorization(user)
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return None

# filter by price range
@router.get("/price", status_code=200, tags=['product'])
def filter_by_price(min_price: float, max_price: float, db: Session = Depends(get_db)):
    products = db.query(models.Product).filter(models.Product.price >= min_price, models.Product.price <= max_price)
    return products.all()

