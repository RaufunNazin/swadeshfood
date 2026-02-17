from fastapi import Depends, APIRouter, HTTPException, status, Request
from ..database import get_db
from sqlalchemy.orm import Session
from .. import models, oauth2, schemas
from ..oauth2 import check_authorization
import time
from typing import List, Optional
from ..schemas import Order
import json

router = APIRouter()

# --- 1. Read All Orders (Fixed) ---
@router.get("/order", response_model=List[schemas.Order])
def read_order_with_products(
    start_date: Optional[int] = None,
    end_date: Optional[int] = None,
    user=Depends(oauth2.get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(models.Order)

    if user.role != 1:
        query = query.filter(models.Order.user_id == user.id)

    if start_date:
        query = query.filter(models.Order.created_at >= start_date)
    if end_date:
        query = query.filter(models.Order.created_at <= end_date)

    orders = query.all()
    
    # NOTE: No need to manual json.loads here. 
    # Pydantic's 'response_model' will automatically convert the DB string to a JSON list.
    
    return orders

# --- 2. Read Single Order (Fixed) ---
@router.get("/order/{order_id}", response_model=schemas.Order)
def read_order_by_id(
    order_id: int, 
    user=Depends(oauth2.get_current_user), 
    db: Session = Depends(get_db)
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    if user.role != 1 and order.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return order

# --- 3. Create Order (Fixed) ---
@router.post("/order", status_code=201, response_model=schemas.Order)
def create_order(
    order: schemas.OrderCreate, 
    db: Session = Depends(get_db)
):
    # 'order.products' is already a Python List (Pydantic parsed it)
    validated_products = []
    
    for item in order.products:
        # Access properties directly (item.product, not item['product'])
        db_prod = db.query(models.Product).filter(models.Product.id == item.product).first()
        if not db_prod: continue

        validated_products.append({
            "product": item.product, 
            "quantity": item.quantity, 
            "price": db_prod.price, 
            "name": db_prod.name 
        })

    new_order = models.Order(
        user_id=order.user_id,
        name=order.name,
        email=order.email,
        phone=order.phone,
        address=order.address,
        order_description=order.order_description,
        method=order.method,
        # Convert List -> JSON String for DB Storage
        products=schemas.Json(validated_products), 
        paid=0,
        status="new",
        created_at=int(time.time())
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order

# --- 4. Update Order (Fixed) ---
@router.put("/order/{order_id}", response_model=schemas.Order)
def update_order(
    order_id: int,
    order_update: schemas.OrderUpdate, # Use the strict schema
    user=Depends(oauth2.get_current_user),
    db: Session = Depends(get_db),
):
    check_authorization(user)
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Only update allowed fields
    if order_update.status:
        db_order.status = order_update.status
    if order_update.paid is not None:
        db_order.paid = order_update.paid

    db.commit()
    db.refresh(db_order)
    return db_order


@router.delete("/order/{order_id}")
def delete_order(
    order_id: int, user=Depends(oauth2.get_current_user), db: Session = Depends(get_db)
):
    check_authorization(user)
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    db.delete(db_order)
    db.commit()
    return {"detail": "Order deleted successfully"}


# get order by user_id
@router.get("/order/user/{user_id}", response_model=List[Order])
def read_order_by_user_id(
    user_id: int, user=Depends(oauth2.get_current_user), db: Session = Depends(get_db)
):
    # REMOVED: check_authorization(user)

    # ADDED: Security check to ensure user can only view THEIR OWN data
    # (Unless they are an admin, role 1)
    if user.id != user_id and user.role != 1:
        raise HTTPException(
            status_code=403, detail="Not authorized to view these orders"
        )

    orders = db.query(models.Order).filter(models.Order.user_id == user_id).all()
    for order in orders:
        products = json.loads(order.products)
        for product in products:
            product_obj = (
                db.query(models.Product)
                .filter(models.Product.id == product["product"])
                .first()
            )
            product["product_name"] = (
                product_obj.name if product_obj else "Unknown Product"
            )
        order.products = json.dumps(products)
    return orders


# get order by paid
@router.get("/order/paid/{paid}", response_model=List[Order])
def read_order_by_paid(
    paid: int, user=Depends(oauth2.get_current_user), db: Session = Depends(get_db)
):
    check_authorization(user)
    orders = db.query(models.Order).filter(models.Order.paid == paid).all()
    return orders


# get order by status
@router.get("/order/status/{status}", response_model=List[Order])
def read_order_by_status(
    status: str, user=Depends(oauth2.get_current_user), db: Session = Depends(get_db)
):
    check_authorization(user)
    orders = db.query(models.Order).filter(models.Order.status == status).all()
    return orders


# get order by user_id and paid
@router.get("/order/user/{user_id}/paid/{paid}", response_model=List[Order])
def read_order_by_user_id_and_paid(
    user_id: int,
    paid: int,
    user=Depends(oauth2.get_current_user),
    db: Session = Depends(get_db),
):
    check_authorization(user)
    orders = (
        db.query(models.Order)
        .filter(models.Order.user_id == user_id, models.Order.paid == paid)
        .all()
    )
    return orders


# get order by user_id and status
@router.get("/order/user/{user_id}/status/{status}", response_model=List[Order])
def read_order_by_user_id_and_status(
    user_id: int,
    status: str,
    user=Depends(oauth2.get_current_user),
    db: Session = Depends(get_db),
):
    check_authorization(user)
    orders = (
        db.query(models.Order)
        .filter(models.Order.user_id == user_id, models.Order.status == status)
        .all()
    )
    return orders


# get order by paid and status
@router.get("/order/paid/{paid}/status/{status}", response_model=List[Order])
def read_order_by_paid_and_status(
    paid: int,
    status: str,
    user=Depends(oauth2.get_current_user),
    db: Session = Depends(get_db),
):
    check_authorization(user)
    orders = (
        db.query(models.Order)
        .filter(models.Order.paid == paid, models.Order.status == status)
        .all()
    )
    return orders


# get order by user_id, paid, and status
@router.get(
    "/order/user/{user_id}/paid/{paid}/status/{status}", response_model=List[Order]
)
def read_order_by_user_id_paid_and_status(
    user_id: int,
    paid: int,
    status: str,
    user=Depends(oauth2.get_current_user),
    db: Session = Depends(get_db),
):
    check_authorization(user)
    orders = (
        db.query(models.Order)
        .filter(
            models.Order.user_id == user_id,
            models.Order.paid == paid,
            models.Order.status == status,
        )
        .all()
    )
    return orders


# patch to update paid status
@router.patch("/order/{order_id}/paid/{paid}", response_model=Order)
def update_order_paid_status(
    order_id: int,
    paid: int,
    user=Depends(oauth2.get_current_user),
    db: Session = Depends(get_db),
):
    check_authorization(user)
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    db_order.paid = paid
    db.commit()
    db.refresh(db_order)
    return db_order


# patch to update status
@router.patch("/order/{order_id}/status/{status}", response_model=Order)
def update_order_status(
    order_id: int,
    status: str,
    user=Depends(oauth2.get_current_user),
    db: Session = Depends(get_db),
):
    check_authorization(user)
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    if status == "delivered":
        products = json.loads(db_order.products)
        for product in products:
            db_product = (
                db.query(models.Product)
                .filter(models.Product.id == product["product"])
                .first()
            )
            db_product.stock -= product["quantity"]
        db.commit()

    db_order.status = status
    db.commit()
    db.refresh(db_order)
    return db_order
