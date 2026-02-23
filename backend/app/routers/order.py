from fastapi import Depends, APIRouter, HTTPException
from ..database import get_db
from sqlalchemy.orm import Session
from sqlalchemy import update
from .. import models, oauth2, schemas
from ..oauth2 import check_authorization
import time
from typing import List, Optional
from ..schemas import Order
import json

router = APIRouter()


# --- 1. Read All Orders ---
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

    return query.all()


# --- 2. Read Single Order ---
@router.get("/order/{order_id}", response_model=schemas.Order)
def read_order_by_id(
    order_id: int,
    user=Depends(oauth2.get_current_user),
    db: Session = Depends(get_db),
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    if user.role != 1 and order.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return order


# --- 3. Create Order (Model A: reserve stock immediately) ---
@router.post("/order", status_code=201, response_model=schemas.Order)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    validated_products = []

    try:
        # Reserve stock atomically per item
        for item in order.products:
            db_prod = (
                db.query(models.Product)
                .filter(models.Product.id == item.product)
                .first()
            )
            if not db_prod:
                raise HTTPException(
                    status_code=404, detail=f"Product not found: {item.product}"
                )

            qty = int(item.quantity)
            if qty <= 0:
                raise HTTPException(status_code=400, detail="Quantity must be >= 1")

            stmt = (
                update(models.Product)
                .where(models.Product.id == item.product)
                .where(models.Product.stock >= qty)
                .values(stock=models.Product.stock - qty)
            )
            result = db.execute(stmt)
            if result.rowcount == 0:
                raise HTTPException(
                    status_code=409,
                    detail=f"Insufficient stock for product {item.product}",
                )

            # Trust server-side price/name
            validated_products.append(
                {
                    "product": item.product,
                    "quantity": qty,
                    "price": db_prod.price,
                    "name": db_prod.name,
                }
            )

        new_order = models.Order(
            user_id=order.user_id,
            name=order.name,
            email=order.email,
            phone=order.phone,
            address=order.address,
            order_description=order.order_description,
            method=order.method,
            products=json.dumps(validated_products),
            paid=0,
            status="new",
            created_at=int(time.time()),
            stock_released=0,
        )

        db.add(new_order)
        db.commit()
        db.refresh(new_order)
        return new_order

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# --- 4. Update Order (Model A + restock on cancel, idempotent) ---
@router.put("/order/{order_id}", response_model=schemas.Order)
def update_order(
    order_id: int,
    order_update: schemas.OrderUpdate,
    user=Depends(oauth2.get_current_user),
    db: Session = Depends(get_db),
):
    check_authorization(user)

    next_status = (order_update.status or "").lower().strip()

    allowed = {"new", "processing", "transit", "delivered", "cancelled"}
    if next_status not in allowed:
        raise HTTPException(status_code=400, detail="Invalid status")

    try:
        # 🔒 lock order row (prevents race on cancel)
        db_order = (
            db.query(models.Order)
            .filter(models.Order.id == order_id)
            .with_for_update()
            .first()
        )
        if not db_order:
            raise HTTPException(status_code=404, detail="Order not found")

        prev_status = (db_order.status or "").lower()

        if prev_status == "delivered" and next_status == "cancelled":
            raise HTTPException(
                status_code=400, detail="Delivered orders cannot be cancelled"
            )

        if prev_status == "cancelled" and next_status != "cancelled":
            raise HTTPException(
                status_code=400, detail="Cancelled orders cannot be re-opened"
            )

        if next_status == "cancelled" and db_order.stock_released == 0:
            items = json.loads(db_order.products or "[]")
            for item in items:
                pid = int(item.get("product"))
                qty = int(item.get("quantity", 0))
                if qty <= 0:
                    continue

                db.execute(
                    update(models.Product)
                    .where(models.Product.id == pid)
                    .values(stock=models.Product.stock + qty)
                )

            db_order.stock_released = 1

        # Apply status/paid
        db_order.status = next_status
        if order_update.paid is not None:
            db_order.paid = order_update.paid

        db.commit()
        db.refresh(db_order)
        return db_order

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# --- 5. Delete Order (optional policy) ---
@router.delete("/order/{order_id}")
def delete_order(
    order_id: int,
    user=Depends(oauth2.get_current_user),
    db: Session = Depends(get_db),
):
    check_authorization(user)

    db_order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if db_order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    # ⚠️ Policy: if you delete without cancelling first, stock would remain reserved.
    # Enforce: only allow delete if already cancelled or delivered, OR do restock here.
    if (db_order.status or "").lower() not in {"cancelled", "delivered"}:
        raise HTTPException(
            status_code=400,
            detail="Delete not allowed unless order is cancelled or delivered",
        )

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
