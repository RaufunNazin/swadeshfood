from fastapi import Depends, APIRouter, HTTPException
from fastapi.exceptions import HTTPException
from ..database import get_db
from sqlalchemy.orm import Session
from ..schemas import Order
from .. import models, oauth2
from ..oauth2 import check_authorization
from typing import List
import json

router = APIRouter()

# get request for orders with product name added to it by json parsing the products field
@router.get("/order", response_model = List[Order])
def read_order_with_products(user=Depends(oauth2.get_current_user), db: Session=Depends(get_db)):
    check_authorization(user)
    orders = db.query(models.Order).all()
    for order in orders:
        # Parse the JSON string
        products = json.loads(order.products)
        for product in products:
            # Get the product name from the database
            product_name = db.query(models.Product).filter(models.Product.id == product["product"]).first().name
            # Add the product name to the product dictionary
            product["product_name"] = product_name
        # Convert back to JSON string
        order.products = json.dumps(products)
    return orders

@router.get("/order/{order_id}", response_model = Order)
def read_order_by_id(order_id : int, user = Depends(oauth2.get_current_user), db : Session = Depends(get_db)) :
    check_authorization(user)
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if order is None :
        raise HTTPException(status_code = 404, detail = "Order not found")
    return order

@router.post("/order", status_code=200, response_model=Order)
def create_order(order: Order, db: Session = Depends(get_db)):
    db_order = models.Order(**order.dict())
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

@router.put("/order/{order_id}", response_model = Order)
def update_order(order_id : int, order : Order, user = Depends(oauth2.get_current_user), db : Session = Depends(get_db)) :
    check_authorization(user)
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if db_order is None :
        raise HTTPException(status_code = 404, detail = "Order not found")
    db_order.user_id = order.user_id
    db_order.products = order.products
    db_order.paid = order.paid
    db_order.status = order.status
    db_order.phone = order.phone
    db_order.address = order.address
    db_order.order_description = order.order_description
    db.commit()
    db.refresh(db_order)
    return db_order

@router.delete("/order/{order_id}")
def delete_order(order_id : int, user = Depends(oauth2.get_current_user), db : Session = Depends(get_db)) :
    check_authorization(user)
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if db_order is None :
        raise HTTPException(status_code = 404, detail = "Order not found")
    db.delete(db_order)
    db.commit()
    return {"detail" : "Order deleted successfully"}

# get order by user_id
@router.get("/order/user/{user_id}", response_model = List[Order])
def read_order_by_user_id(user_id : int, user = Depends(oauth2.get_current_user), db : Session = Depends(get_db)) :
    check_authorization(user)
    orders = db.query(models.Order).filter(models.Order.user_id == user_id).all()
    return orders

# get order by paid
@router.get("/order/paid/{paid}", response_model = List[Order])
def read_order_by_paid(paid : int, user = Depends(oauth2.get_current_user), db : Session = Depends(get_db)) :
    check_authorization(user)
    orders = db.query(models.Order).filter(models.Order.paid == paid).all()
    return orders

# get order by status
@router.get("/order/status/{status}", response_model = List[Order])
def read_order_by_status(status : str, user = Depends(oauth2.get_current_user), db : Session = Depends(get_db)) :
    check_authorization(user)
    orders = db.query(models.Order).filter(models.Order.status == status).all()
    return orders

# get order by user_id and paid
@router.get("/order/user/{user_id}/paid/{paid}", response_model = List[Order])
def read_order_by_user_id_and_paid(user_id : int, paid : int, user = Depends(oauth2.get_current_user), db : Session = Depends(get_db)) :
    check_authorization(user)
    orders = db.query(models.Order).filter(models.Order.user_id == user_id, models.Order.paid == paid).all()
    return orders

# get order by user_id and status
@router.get("/order/user/{user_id}/status/{status}", response_model = List[Order])
def read_order_by_user_id_and_status(user_id : int, status : str, user = Depends(oauth2.get_current_user), db : Session = Depends(get_db)) :
    check_authorization(user)
    orders = db.query(models.Order).filter(models.Order.user_id == user_id, models.Order.status == status).all()
    return orders

# get order by paid and status
@router.get("/order/paid/{paid}/status/{status}", response_model = List[Order])
def read_order_by_paid_and_status(paid : int, status : str, user = Depends(oauth2.get_current_user), db : Session = Depends(get_db)) :
    check_authorization(user)
    orders = db.query(models.Order).filter(models.Order.paid == paid, models.Order.status == status).all()
    return orders

# get order by user_id, paid, and status
@router.get("/order/user/{user_id}/paid/{paid}/status/{status}", response_model = List[Order])
def read_order_by_user_id_paid_and_status(user_id : int, paid : int, status : str, user = Depends(oauth2.get_current_user), db : Session = Depends(get_db)) :
    check_authorization(user)
    orders = db.query(models.Order).filter(models.Order.user_id == user_id, models.Order.paid == paid, models.Order.status == status).all()
    return orders

# patch to update paid status
@router.patch("/order/{order_id}/paid/{paid}", response_model = Order)
def update_order_paid_status(order_id : int, paid : int, user = Depends(oauth2.get_current_user), db : Session = Depends(get_db)) :
    check_authorization(user)
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if db_order is None :
        raise HTTPException(status_code = 404, detail = "Order not found")
    db_order.paid = paid
    db.commit()
    db.refresh(db_order)
    return db_order

# patch to update status
@router.patch("/order/{order_id}/status/{status}", response_model = Order)
def update_order_status(order_id : int, status : str, user = Depends(oauth2.get_current_user), db : Session = Depends(get_db)) :
    check_authorization(user)
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if db_order is None :
        raise HTTPException(status_code = 404, detail = "Order not found")
    db_order.status = status
    db.commit()
    db.refresh(db_order)
    return db_order