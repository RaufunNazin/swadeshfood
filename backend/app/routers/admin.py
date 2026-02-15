from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, oauth2
from ..oauth2 import check_authorization
from ..schemas import DashboardStats, SalesReport
from typing import Optional, List
from datetime import datetime, timezone
import json

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/dashboard-stats", response_model=DashboardStats)
def get_dashboard_stats(
    start_date: int,
    end_date: int,
    user=Depends(oauth2.get_current_user),
    db: Session = Depends(get_db),
):
    check_authorization(user)

    # 1. Fetch all products once to create a price lookup map (Performance optimization)
    # This prevents querying the DB inside the loop for every single item
    all_products = db.query(models.Product).all()
    product_price_map = {p.id: p.price for p in all_products}

    # 2. Query Orders in date range that are PAID (paid == 1)
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

    # Dictionary to aggregate sales by date for the graph
    sales_by_date = {}

    for order in orders:
        order_revenue = 0.0

        # 3. Parse the JSON string to get items
        try:
            cart_items = json.loads(order.products)

            for item in cart_items:
                pid = item.get("product")  # The Product ID
                qty = item.get("quantity", 0)

                # Look up price from our map
                price = product_price_map.get(pid, 0)

                # Calculate line total
                line_total = price * qty
                order_revenue += line_total
                sold_products_count += qty

        except Exception as e:
            print(f"Error parsing order {order.id}: {e}")
            continue

        # Add to global revenue
        total_revenue += order_revenue

        # 4. Group by Date for the Graph
        # Convert timestamp to YYYY-MM-DD
        dt_object = datetime.fromtimestamp(order.created_at)
        date_str = dt_object.strftime("%Y-%m-%d")

        if date_str not in sales_by_date:
            sales_by_date[date_str] = {"count": 0, "revenue": 0.0}

        sales_by_date[date_str]["count"] += 1
        sales_by_date[date_str]["revenue"] += order_revenue

    # 5. Format graph data for frontend
    graph_data = [
        SalesReport(date=k, total_orders=v["count"], total_revenue=v["revenue"])
        for k, v in sales_by_date.items()
    ]

    # Sort by date so the line chart flows correctly
    graph_data.sort(key=lambda x: x.date)

    return DashboardStats(
        total_revenue=total_revenue,
        total_orders=total_orders,
        sold_products_count=sold_products_count,
        sales_graph=graph_data,
    )
