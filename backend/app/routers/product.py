from fastapi import Depends, APIRouter, HTTPException, Form, File, UploadFile, Request
from fastapi.exceptions import HTTPException
from ..database import get_db, SessionLocal
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..schemas import Product, ProductUpdate, RecipeItemCreate, RecipeItem
from .. import models, oauth2
from ..oauth2 import check_authorization
import os
from typing import Optional, List
from ..utils import random_string

router = APIRouter()

# =========================================================
# 1. SPECIFIC ROUTES (Must be defined FIRST)
# =========================================================


# --- Recipe Routes ---
@router.post(
    "/products/{product_id}/recipe", response_model=RecipeItem, tags=["recipe"]
)
def add_recipe_item(
    product_id: int,
    item: RecipeItemCreate,
    user=Depends(oauth2.get_current_user),
    db: Session = Depends(get_db),
):
    check_authorization(user)

    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    new_item = models.RecipeItem(
        product_id=product_id,
        ingredient_name=item.ingredient_name,
        quantity=item.quantity,
        unit_price=item.unit_price,
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    new_item.total_cost = new_item.quantity * new_item.unit_price
    return new_item


@router.get(
    "/products/{product_id}/recipe", response_model=List[RecipeItem], tags=["recipe"]
)
def get_product_recipe(
    product_id: int,
    user=Depends(oauth2.get_current_user),
    db: Session = Depends(get_db),
):
    check_authorization(user)

    items = (
        db.query(models.RecipeItem)
        .filter(models.RecipeItem.product_id == product_id)
        .all()
    )

    for item in items:
        item.total_cost = item.quantity * item.unit_price

    return items


@router.delete("/products/recipe/{item_id}", status_code=204, tags=["recipe"])
def delete_recipe_item(
    item_id: int, user=Depends(oauth2.get_current_user), db: Session = Depends(get_db)
):
    check_authorization(user)

    item = db.query(models.RecipeItem).filter(models.RecipeItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Recipe item not found")

    db.delete(item)
    db.commit()
    return None


# --- Image Upload Route ---
@router.post("/products/{product_id}/images", status_code=200, tags=["product"])
def add_images(
    request: Request,
    product_id: int,
    image2: Optional[UploadFile] = File(None),
    image3: Optional[UploadFile] = File(None),
    user=Depends(oauth2.get_current_user),
    db: Session = Depends(get_db),
):
    check_authorization(user)
    base_url = str(request.base_url)
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    current_directory = os.path.dirname(os.path.realpath(__file__))
    folder_path = os.path.join(current_directory, "..", "..", "static")
    os.makedirs(folder_path, exist_ok=True)

    if image2 is not None:
        photo_name = random_string()
        file_location2 = os.path.join(
            folder_path, f"{photo_name}.{image2.filename.split('.')[-1]}"
        )
        with open(file_location2, "wb") as file_object:
            file_object.write(image2.file.read())
        product.image2 = (
            f"{base_url}static/{photo_name}.{image2.filename.split('.')[-1]}"
        )

    if image3 is not None:
        photo_name = random_string()
        file_location3 = os.path.join(
            folder_path, f"{photo_name}.{image3.filename.split('.')[-1]}"
        )
        with open(file_location3, "wb") as file_object:
            file_object.write(image3.file.read())
        product.image3 = (
            f"{base_url}static/{photo_name}.{image3.filename.split('.')[-1]}"
        )

    db.commit()
    db.refresh(product)
    return product


# =========================================================
# 2. GENERIC ROUTES (Must be defined LAST)
# =========================================================


@router.get("/products/all", status_code=200, tags=["product"])
def get_all_products(db: Session = Depends(get_db)):
    products = db.query(models.Product).all()
    return products


@router.get("/products/{offset}/{limit}", status_code=200, tags=["product"])
def get_products(offset: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    products = db.query(models.Product).offset(offset).limit(limit).all()
    return products


@router.get("/products/new/{offset}/{limit}", status_code=200, tags=["product"])
def get_new_products(offset: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    products = (
        db.query(models.Product)
        .filter(models.Product.new == 1)
        .offset(offset)
        .limit(limit)
        .all()
    )
    return products


@router.get("/name/products/{name}", status_code=200, tags=["product"])
def get_product_by_name(name: str, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.name == name).all()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/products", status_code=201, response_model=Product, tags=["product"])
def create_product(
    request: Request,
    image: UploadFile = File(...),
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    category: str = Form(...),
    stock: int = Form(...),
    size: str = Form(...),
    new: int = Form(...),
    user=Depends(oauth2.get_current_user),
    db: Session = Depends(get_db),
):
    check_authorization(user)
    base_url = str(request.base_url)

    photo_name = random_string()
    current_directory = os.path.dirname(os.path.realpath(__file__))
    folder_path = os.path.join(current_directory, "..", "..", "static")
    os.makedirs(folder_path, exist_ok=True)

    file_extension = image.filename.split(".")[-1]
    file_name = f"{photo_name}.{file_extension}"
    file_location = os.path.join(folder_path, file_name)

    with open(file_location, "wb") as file_object:
        file_object.write(image.file.read())

    image_url = f"{base_url}static/{file_name}"

    db_product = models.Product(
        image1=image_url,
        name=name,
        description=description,
        price=price,
        category=category,
        stock=stock,
        size=size,
        new=new,
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


@router.get("/products/{product_id}", status_code=200, tags=["product"])
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put("/products/{product_id}", status_code=200, tags=["product"])
def update_product(
    product_id: int,
    product: ProductUpdate,
    user=Depends(oauth2.get_current_user),
    db: Session = Depends(get_db),
):
    check_authorization(user)
    db_product = (
        db.query(models.Product).filter(models.Product.id == product_id).first()
    )
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    for key, value in product.dict().items():
        setattr(db_product, key, value)
    db.commit()
    db.refresh(db_product)
    return db_product


@router.get(
    "/filter/category/{category}/{offset}/{limit}", status_code=200, tags=["product"]
)
def filter_by_category(
    category: str, offset: int = 0, limit: int = 10, db: Session = Depends(get_db)
):
    products = (
        db.query(models.Product)
        .filter(models.Product.category == category)
        .offset(offset)
        .limit(limit)
    )
    return products.all()


@router.get("/sizes", status_code=200, tags=["product"])
def get_sizes(db: Session = Depends(get_db)):
    sizes = db.query(models.Product.size).distinct().all()
    sizes_list = [size[0] for size in sizes]
    return sizes_list


@router.get("/filter/size/{size}/{offset}/{limit}", status_code=200, tags=["product"])
def filter_by_size(
    size: str, offset: int = 0, limit: int = 10, db: Session = Depends(get_db)
):
    products = (
        db.query(models.Product)
        .filter(models.Product.size == size)
        .offset(offset)
        .limit(limit)
    )
    return products.all()


@router.get("/filter/new/{new}/{offset}/{limit}", status_code=200, tags=["product"])
def filter_by_new(
    new: int, offset: int = 0, limit: int = 10, db: Session = Depends(get_db)
):
    products = (
        db.query(models.Product)
        .filter(models.Product.new == new)
        .offset(offset)
        .limit(limit)
    )
    return products.all()


@router.get("/sort/{sort_by}/{offset}/{limit}", status_code=200, tags=["product"])
def sort_products(
    sort_by: str, offset: int = 0, limit: int = 10, db: Session = Depends(get_db)
):
    if sort_by == "asc":
        products = (
            db.query(models.Product)
            .order_by(models.Product.price.asc())
            .offset(offset)
            .limit(limit)
        )
    else:
        products = (
            db.query(models.Product)
            .order_by(models.Product.price.desc())
            .offset(offset)
            .limit(limit)
        )
    return products.all()


@router.delete("/products/{product_id}", status_code=204, tags=["product"])
def delete_product(
    product_id: int,
    user=Depends(oauth2.get_current_user),
    db: Session = Depends(get_db),
):
    check_authorization(user)
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return None


@router.get("/products/price-range/{offset}/{limit}", status_code=200, tags=["product"])
def get_products_price_range(
    offset: int = 0, limit: int = 10, db: Session = Depends(get_db)
):
    subquery = (
        db.query(
            models.Product.name,
            func.min(models.Product.price).label("min_price"),
            func.max(models.Product.price).label("max_price"),
            func.count(models.Product.id).label("count"),
        )
        .group_by(models.Product.name)
        .subquery()
    )

    query = (
        db.query(
            models.Product, subquery.c.min_price, subquery.c.max_price, subquery.c.count
        )
        .join(subquery, models.Product.name == subquery.c.name)
        .filter(models.Product.price == subquery.c.max_price)
        .offset(offset)
        .limit(limit)
    )

    results = query.all()

    products = []
    for product, min_price, max_price, count in results:
        product_dict = product.__dict__.copy()
        product_dict["price_range"] = (
            None if count == 1 else f"{min_price} - {max_price}"
        )
        products.append(product_dict)

    return products


@router.get(
    "/products/new/price-range/{offset}/{limit}", status_code=200, tags=["product"]
)
def get_new_products_price_range(
    offset: int = 0, limit: int = 10, db: Session = Depends(get_db)
):
    subquery = (
        db.query(
            models.Product.name,
            func.min(models.Product.price).label("min_price"),
            func.max(models.Product.price).label("max_price"),
            func.count(models.Product.id).label("count"),
        )
        .group_by(models.Product.name)
        .subquery()
    )

    query = (
        db.query(
            models.Product, subquery.c.min_price, subquery.c.max_price, subquery.c.count
        )
        .join(subquery, models.Product.name == subquery.c.name)
        .filter(models.Product.price == subquery.c.max_price)
        .filter(models.Product.new == 1)
        .offset(offset)
        .limit(limit)
    )

    results = query.all()

    products = []
    for product, min_price, max_price, count in results:
        product_dict = product.__dict__.copy()
        product_dict["price_range"] = (
            None if count == 1 else f"{min_price} - {max_price}"
        )
        products.append(product_dict)

    return products


@router.get("/search/{name}/{offset}/{limit}", status_code=200, tags=["product"])
def search_product(
    name: str, offset: int = 0, limit: int = 10, db: Session = Depends(get_db)
):
    products = (
        db.query(models.Product)
        .filter(models.Product.name.ilike(f"%{name}%"))
        .offset(offset)
        .limit(limit)
    )
    return products.all()
