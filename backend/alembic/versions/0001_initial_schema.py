"""initial_schema

Revision ID: 0001
Revises:
Create Date: 2026-02-22 12:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Users Table
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("username", sa.String(length=50), nullable=False),
        sa.Column("email", sa.String(length=100), nullable=False),
        sa.Column("password", sa.String(length=100), nullable=False),
        sa.Column("role", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    # 2. Categories Table
    op.create_table(
        "categories",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    # 3. Products Table
    op.create_table(
        "products",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("description", sa.String(length=2000), nullable=False),
        sa.Column("image1", sa.String(length=300), nullable=False),
        sa.Column("image2", sa.String(length=300), nullable=True),
        sa.Column("image3", sa.String(length=300), nullable=True),
        sa.Column("price", sa.Float(), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column("stock", sa.Integer(), nullable=False),
        sa.Column("size", sa.String(length=20), nullable=False),
        sa.Column("new", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    # 4. Orders Table
    op.create_table(
        "orders",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("products", sa.String(length=300), nullable=False),
        sa.Column("paid", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=100), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("email", sa.String(length=100), nullable=True),
        sa.Column("phone", sa.String(length=20), nullable=False),
        sa.Column("address", sa.String(length=300), nullable=False),
        sa.Column("order_description", sa.String(length=300), nullable=True),
        sa.Column("method", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    # 5. Recipe Items Table (Has Foreign Key to Products)
    op.create_table(
        "recipe_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("ingredient_name", sa.String(length=100), nullable=False),
        sa.Column("quantity", sa.Float(), nullable=False),
        sa.Column("unit_price", sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    # 6. Notification Banner Table
    op.create_table(
        "notification_banner",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("text_en", sa.String(length=500), nullable=False),
        sa.Column("text_bn", sa.String(length=500), nullable=False),
        sa.Column("is_active", sa.Integer(), server_default="1", nullable=False),
        sa.Column("is_highlighted", sa.Integer(), server_default="0", nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    # Must drop in reverse order due to foreign keys
    op.drop_table("notification_banner")
    op.drop_table("recipe_items")
    op.drop_table("orders")
    op.drop_table("products")
    op.drop_table("categories")
    op.drop_table("users")
