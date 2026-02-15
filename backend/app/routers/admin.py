from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from ..database import get_db
from .. import models, oauth2
from ..oauth2 import check_authorization

# IMPORT Order from schemas here
from ..schemas import DashboardStats, SalesReport, Order
from typing import List, Dict, Any
from datetime import datetime, timezone
import json
import collections

router = APIRouter(prefix="/admin", tags=["admin"])


# --- Existing Dashboard Stats ---
@router.get("/dashboard-stats", response_model=DashboardStats)
def get_dashboard_stats(
    start_date: int,
    end_date: int,
    user=Depends(oauth2.get_current_user),
    db: Session = Depends(get_db),
):
    check_authorization(user)

    # Pre-fetch products for price lookup
    all_products = db.query(models.Product).all()
    product_price_map = {p.id: p.price for p in all_products}

    orders = (
        db.query(models.Order)
        .filter(
            models.Order.created_at >= start_date,
            models.Order.created_at <= end_date,
            models.Order.paid == 1,
        )
        .all()
    )

    total_revenue = 0.0
    total_orders = len(orders)
    sold_products_count = 0
    sales_by_date = {}

    for order in orders:
        order_revenue = 0.0
        try:
            cart_items = json.loads(order.products)
            for item in cart_items:
                pid = item.get("product")
                qty = item.get("quantity", 0)
                price = product_price_map.get(pid, 0)
                line_total = price * qty
                order_revenue += line_total
                sold_products_count += qty
        except:
            continue

        total_revenue += order_revenue

        dt_object = datetime.fromtimestamp(order.created_at)
        date_str = dt_object.strftime("%Y-%m-%d")

        if date_str not in sales_by_date:
            sales_by_date[date_str] = {"count": 0, "revenue": 0.0}
        sales_by_date[date_str]["count"] += 1
        sales_by_date[date_str]["revenue"] += order_revenue

    graph_data = [
        SalesReport(date=k, total_orders=v["count"], total_revenue=v["revenue"])
        for k, v in sales_by_date.items()
    ]
    graph_data.sort(key=lambda x: x.date)

    return DashboardStats(
        total_revenue=total_revenue,
        total_orders=total_orders,
        sold_products_count=sold_products_count,
        sales_graph=graph_data,
    )


# --- New Feature Endpoints ---


# 1. Top Selling Products
@router.get("/top-selling", response_model=List[Dict[str, Any]])
def get_top_selling(
    limit: int = 5, user=Depends(oauth2.get_current_user), db: Session = Depends(get_db)
):
    check_authorization(user)

    # Logic: Parse all PAID orders, aggregate quantity by product ID
    orders = db.query(models.Order).filter(models.Order.paid == 1).all()
    product_counts = collections.defaultdict(int)

    for order in orders:
        try:
            items = json.loads(order.products)
            for item in items:
                product_counts[item["product"]] += item["quantity"]
        except:
            continue

    # Sort by quantity desc
    sorted_products = sorted(product_counts.items(), key=lambda x: x[1], reverse=True)[
        :limit
    ]

    result = []
    for pid, qty in sorted_products:
        p = db.query(models.Product).filter(models.Product.id == pid).first()
        if p:
            result.append({"name": p.name, "value": qty, "category": p.category})

    return result


# 2. Category Distribution
@router.get("/category-sales", response_model=List[Dict[str, Any]])
def get_category_sales(
    user=Depends(oauth2.get_current_user), db: Session = Depends(get_db)
):
    check_authorization(user)

    orders = db.query(models.Order).filter(models.Order.paid == 1).all()
    category_sales = collections.defaultdict(float)

    # Pre-fetch product details to get categories and prices
    products = db.query(models.Product).all()
    product_map = {p.id: {"cat": p.category, "price": p.price} for p in products}

    for order in orders:
        try:
            items = json.loads(order.products)
            for item in items:
                pid = item["product"]
                qty = item["quantity"]
                if pid in product_map:
                    revenue = product_map[pid]["price"] * qty
                    category_sales[product_map[pid]["cat"]] += revenue
        except:
            continue

    return [{"name": cat, "value": val} for cat, val in category_sales.items()]


# 5. Pending Action Center (Orders needing attention)
# FIXED: Changed response_model to use the Pydantic Order schema, not models.Order
@router.get("/pending-actions", response_model=List[Order])
def get_pending_actions(
    user=Depends(oauth2.get_current_user), db: Session = Depends(get_db)
):
    check_authorization(user)
    # Fetch orders that are NOT delivered yet
    return (
        db.query(models.Order)
        .filter(models.Order.status.in_(["new", "processing"]))
        .order_by(models.Order.created_at.asc())
        .limit(10)
        .all()
    )


# 7. Order Heatmap (By hour of day)
@router.get("/order-heatmap", response_model=List[Dict[str, Any]])
def get_order_heatmap(
    user=Depends(oauth2.get_current_user), db: Session = Depends(get_db)
):
    check_authorization(user)

    orders = db.query(models.Order).all()
    hours = collections.defaultdict(int)

    for order in orders:
        dt = datetime.fromtimestamp(order.created_at)
        hour_key = dt.strftime("%H:00")  # "14:00"
        hours[hour_key] += 1

    # Ensure all hours are represented or just return active ones
    return [{"time": h, "orders": c} for h, c in sorted(hours.items())]


# 8. Profit Margin (Total Revenue - Total Recipe Cost)
@router.get("/profit-stats", response_model=Dict[str, float])
def get_profit_stats(
    start_date: int,
    end_date: int,
    user=Depends(oauth2.get_current_user),
    db: Session = Depends(get_db),
):
    check_authorization(user)

    orders = (
        db.query(models.Order)
        .filter(
            models.Order.created_at >= start_date,
            models.Order.created_at <= end_date,
            models.Order.paid == 1,
        )
        .all()
    )

    total_revenue = 0.0
    total_cost = 0.0

    # Build cost map: Product ID -> Total Recipe Cost
    product_costs = {}
    products = db.query(models.Product).all()
    for p in products:
        recipe_items = (
            db.query(models.RecipeItem)
            .filter(models.RecipeItem.product_id == p.id)
            .all()
        )
        # If no recipe, assume 70% of price is cost (fallback)
        if not recipe_items:
            product_costs[p.id] = p.price * 0.7
        else:
            product_costs[p.id] = sum(
                item.quantity * item.unit_price for item in recipe_items
            )

    product_prices = {p.id: p.price for p in products}

    for order in orders:
        try:
            items = json.loads(order.products)
            for item in items:
                pid = item["product"]
                qty = item["quantity"]

                rev = product_prices.get(pid, 0) * qty
                cost = product_costs.get(pid, 0) * qty

                total_revenue += rev
                total_cost += cost
        except:
            continue

    return {
        "revenue": total_revenue,
        "cost": total_cost,
        "profit": total_revenue - total_cost,
    }


# 9. Geographic Map (Orders by Address/City)
@router.get("/geo-distribution", response_model=List[Dict[str, Any]])
def get_geo_distribution(
    user=Depends(oauth2.get_current_user), db: Session = Depends(get_db)
):
    check_authorization(user)

    orders = db.query(models.Order).all()
    locations = collections.defaultdict(int)

    for order in orders:
        if order.address:
            # Simple heuristic: Split address by comma and take the last part
            area = order.address.split(",")[-1].strip()
            locations[area] += 1

    return [{"name": loc, "value": val} for loc, val in locations.items()]
