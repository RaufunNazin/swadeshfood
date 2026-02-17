from fastapi import Depends, APIRouter, HTTPException
from fastapi.exceptions import HTTPException

from ..database import get_db
from sqlalchemy.orm import Session
from ..schemas import Order
from .. import models, oauth2
from ..oauth2 import check_authorization
from typing import List, Optional
import json
import time

router = APIRouter()


@router.get("/order", response_model=List[Order])
def read_order_with_products(
    start_date: Optional[int] = None,
    end_date: Optional[int] = None,
    user=Depends(oauth2.get_current_user),
    db: Session = Depends(get_db),
):
    check_authorization(user)
    query = db.query(models.Order)

    if start_date:
        query = query.filter(models.Order.created_at >= start_date)
    if end_date:
        query = query.filter(models.Order.created_at <= end_date)

    orders = query.all()

    for order in orders:
        products = json.loads(order.products)
        order_total = 0
        for product in products:
            product_obj = (
                db.query(models.Product)
                .filter(models.Product.id == product["product"])
                .first()
            )
            if product_obj:
                product["product_name"] = product_obj.name
                product["unit_price"] = product_obj.price
                # Calculate trusted subtotal for the response
                order_total += product_obj.price * product["quantity"]

        order.products = json.dumps(products)
        # order.calculated_total = order_total # If using a virtual schema field
    return orders


@router.get("/order/{order_id}", response_model=Order)
def read_order_by_id(
    order_id: int, user=Depends(oauth2.get_current_user), db: Session = Depends(get_db)
):
    check_authorization(user)
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("/order", status_code=200, response_model=Order)
def create_order(order: Order, db: Session = Depends(get_db)):
    # 1. Parse the incoming products JSON
    try:
        incoming_products = json.loads(order.products)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid products format")

    validated_products = []
    total_price = 0

    # 2. Look up each product in the database to get the real price
    for item in incoming_products:
        product_id = item.get("product")
        quantity = item.get("quantity", 0)

        db_product = (
            db.query(models.Product).filter(models.Product.id == product_id).first()
        )
        if not db_product:
            raise HTTPException(
                status_code=404, detail=f"Product {product_id} not found"
            )

        # Calculate subtotal using DB price
        item_total = db_product.price * quantity
        total_price += item_total

        # Store the DB price in the order record for historical reference
        validated_products.append(
            {
                "product": product_id,
                "quantity": quantity,
                "price_at_purchase": db_product.price,
                "product_name": db_product.name,
            }
        )

    # 3. Create the order record with server-calculated data
    db_order = models.Order(
        **order.dict(exclude={"products"})
    )  # Exclude original untrusted products
    db_order.products = json.dumps(validated_products)
    db_order.created_at = int(time.time())

    # Optional: If your Order model has a 'total' column, set it here
    # db_order.total = total_price

    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order


@router.put("/order/{order_id}", response_model=Order)
def update_order(
    order_id: int,
    order: Order,
    user=Depends(oauth2.get_current_user),
    db: Session = Depends(get_db),
):
    check_authorization(user)
    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    db_order.user_id = order.user_id
    db_order.products = order.products
    db_order.paid = order.paid
    db_order.status = order.status
    db_order.name = order.name
    db_order.email = order.email
    db_order.phone = order.phone
    db_order.address = order.address
    db_order.order_description = order.order_description
    db_order.method = order.method
    db_order.created_at = order.created_at
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
    check_authorization(user)
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
