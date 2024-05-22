"""Initialize The DB again

Revision ID: 695c2606dfbe
Revises: 
Create Date: 2023-11-03 08:44:00.707908

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '695c2606dfbe'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('username', sa.String(100), nullable=False),
    sa.Column('email', sa.String(50), nullable=False),
    sa.Column('password', sa.String(200), nullable=False),
    sa.Column('role', sa.Integer(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    
    # product table
    op.create_table('products',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(100), nullable=False),
    sa.Column('description', sa.String(300), nullable=False),
    sa.Column('price', sa.Float(), nullable=False),
    sa.Column('image', sa.String(100), nullable=False),
    sa.Column('category', sa.String(100), nullable=False),
    sa.Column('stock', sa.Integer(), nullable=False),
    sa.Column('size', sa.String(20), nullable=False),
    sa.Column('new', sa.Integer(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('users')
    op.drop_table('products')
