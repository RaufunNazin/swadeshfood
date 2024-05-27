from fastapi import Depends, APIRouter, HTTPException, Form, File, UploadFile
from fastapi.exceptions import HTTPException
from ..database import get_db, SessionLocal
from sqlalchemy.orm import Session
from ..schemas import Product
from .. import models, oauth2
from ..oauth2 import check_authorization
import os

router = APIRouter()

# get request with pagination
@router.get("/products", status_code=200, tags=['product'])
def get_products(offset: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    products = db.query(models.Product).offset(offset).limit(limit).all()
    return products

# get products by name
@router.get("/products/name/{name}", status_code=200, tags=['product'])
def get_product_by_name(name: str, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.name == name).all()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/products", status_code=201, response_model=Product, tags=['product'])
def create_product(image: UploadFile = File(...), name: str = Form(...), description: str = Form(...), price: float = Form(...), category: str = Form(...), stock: int = Form(...), size: str = Form(...), new: int = Form(...), user = Depends(oauth2.get_current_user), db: Session = Depends(get_db)):
    check_authorization(user)
    current_directory = os.path.dirname(os.path.realpath(__file__))
    folder_path = os.path.join(current_directory, "..", "..", "..", "frontend", "public")
    os.makedirs(folder_path, exist_ok=True)
    file_location = os.path.join(folder_path, f"image{name}.{image.filename.split('.')[-1]}")
    with open(file_location, "wb") as file_object:
        file_object.write(image.file.read())
    image_url = f"/image{name}.{image.filename.split('.')[-1]}"
    db = SessionLocal()
    db_product = models.Product(image1=image_url, name=name, description=description, price=price, category=category, stock=stock, size=size, new=new)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

# add image2 and image3 to the product by id
@router.post("/products/{product_id}/images", status_code=200, tags=['product'])
def add_images(product_id: int, image2: UploadFile = File(...), image3: UploadFile = File(...), user = Depends(oauth2.get_current_user), db: Session = Depends(get_db)):
    check_authorization(user)
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    current_directory = os.path.dirname(os.path.realpath(__file__))
    folder_path = os.path.join(current_directory, "..", "..", "..", "frontend", "public")
    os.makedirs(folder_path, exist_ok=True)
    file_location2 = os.path.join(folder_path, f"image2{product_id}.{image2.filename.split('.')[-1]}")
    file_location3 = os.path.join(folder_path, f"image3{product_id}.{image3.filename.split('.')[-1]}")
    with open(file_location2, "wb") as file_object:
        file_object.write(image2.file.read())
    with open(file_location3, "wb") as file_object:
        file_object.write(image3.file.read())
    product.image2 = f"/image2{product_id}.{image2.filename.split('.')[-1]}"
    product.image3 = f"/image3{product_id}.{image3.filename.split('.')[-1]}"
    db.commit()
    db.refresh(product)
    return product

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

# filter products by any of the category, size, stock and new with pagination with offset and limit
@router.get("/filter", status_code=200, tags=['product'])
def filter_products(category: str, size: str, stock: int, new: int, offset: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    products = db.query(models.Product).offset(offset).limit(limit).filter(models.Product.category == category, models.Product.size == size, models.Product.stock == stock, models.Product.new == new)
    return products.all()

# sort by price ascending or descending with pagination with offset and limit
@router.get("/sort", status_code=200, tags=['product'])
def sort_products(sort_by: str, offset: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    if sort_by == "asc":
        products = db.query(models.Product).offset(offset).limit(limit).order_by(models.Product.price.asc())
    else:
        products = db.query(models.Product).offset(offset).limit(limit).order_by(models.Product.price.desc())
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

# filter by price range with pagination with offset and limit
@router.get("/filter/price", status_code=200, tags=['product'])
def filter_by_price(min_price: float, max_price: float, offset: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    products = db.query(models.Product).offset(offset).limit(limit).filter(models.Product.price >= min_price, models.Product.price <= max_price)
    return products.all()

