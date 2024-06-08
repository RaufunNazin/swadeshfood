from fastapi import Depends, APIRouter, HTTPException, Form, File, UploadFile
from fastapi.exceptions import HTTPException
from ..database import get_db, SessionLocal
from sqlalchemy.orm import Session
from ..schemas import Category
from .. import models, oauth2
from ..oauth2 import check_authorization
import os

router = APIRouter()

# get all categories
@router.get("/categories", status_code=200, tags=['category'])
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(models.Category).all()
    return categories

# get category by id
@router.get("/categories/{category_id}", status_code=200, tags=['category'])
def get_category_by_id(category_id: int, db: Session = Depends(get_db)):
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

# create category
@router.post("/categories", status_code=201, response_model=Category, tags=['category'])
def create_category(name: str = Form(...), user = Depends(oauth2.get_current_user), db: Session = Depends(get_db)):
    check_authorization(user)
    db_category = models.Category(name=name)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

# update category by id
@router.put("/categories/{category_id}", status_code=200, response_model=Category, tags=['category'])
def update_category(category_id: int, name: str = Form(...), user = Depends(oauth2.get_current_user), db: Session = Depends(get_db)):
    check_authorization(user)
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    category.name = name
    db.commit()
    db.refresh(category)
    return category

# delete category by id
@router.delete("/categories/{category_id}", status_code=204, tags=['category'])
def delete_category(category_id: int, user = Depends(oauth2.get_current_user), db: Session = Depends(get_db)):
    check_authorization(user)
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(category)
    db.commit()
    return {"detail": "Category deleted successfully"}