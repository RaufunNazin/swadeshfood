from fastapi import Depends, APIRouter, HTTPException
from fastapi.exceptions import HTTPException
from ..database import get_db
from sqlalchemy.orm import Session
from ..schemas import OrderDetails
from .. import models, oauth2
from ..oauth2 import check_authorization
from typing import List

router = APIRouter()

# get all orders with filter by user, paid and status
@router.get("/orders", response_model=List[OrderDetails], status_code=200, tags=['order'])
def get_orders(user_id: int = None, paid: int = None, status: str = None, db: Session = Depends(get_db)):
    orders = db.query(models.Order).all()
    if not orders:
        raise HTTPException(status_code=404, detail="No orders found")
    order_details = []
    for order in orders:
        product = db.query(models.Product).filter(models.Product.id == order.product_id).first()
        if product:
            order_detail = OrderDetails(
                order_id=order.id,
                product_id=product.id,
                product_name=product.name,
                description=product.description,
                price=product.price,
                quantity=order.quantity,
                category=product.category,
                size=product.size,
                new=product.new,
                image1=product.image1,
                image2=product.image2,
                image3=product.image3,
                paid=order.paid,
                status=order.status,
                phone=order.phone,
                address=order.address,
                description=order.description
            )
            if user_id is not None and user_id != order.user_id:
                continue
            if paid is not None and paid != order.paid:
                continue
            if status is not None and status != order.status:
                continue
            order_details.append(order_detail)

    return order_details

@router.get("/orders/{user_id}", response_model=List[OrderDetails], status_code=200, tags=['order'])
def get_orders_by_user(user_id: int, db: Session = Depends(get_db)):
    orders = db.query(models.Order).filter(models.Order.user_id == user_id).all()
    if not orders:
        raise HTTPException(status_code=404, detail="No orders found for this user")
    order_details = []
    for order in orders:
        product = db.query(models.Product).filter(models.Product.id == order.product_id).first()
        if product:
            order_detail = OrderDetails(
                order_id=order.id,
                product_id=product.id,
                product_name=product.name,
                description=product.description,
                price=product.price,
                quantity=order.quantity,
                category=product.category,
                size=product.size,
                new=product.new,
                image1=product.image1,
                image2=product.image2,
                image3=product.image3,
                paid=order.paid,
                status=order.status,
                phone=order.phone,
                address=order.address,
                description=order.description
            )
            order_details.append(order_detail)

    return order_details

# update order status of user
@router.put("/orders/{order_id}", status_code=200, tags=['order'])
def update_order_status(order_id: int, status: str, user = Depends(oauth2.get_current_user), db: Session = Depends(get_db)):
    check_authorization(user)
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = status
    db.commit()
    db.refresh(order)
    return order

