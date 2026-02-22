from pydantic import BaseModel, EmailStr, Json
from typing import Optional, List, Dict, Any
from enum import Enum


# --- ENUMS ---
class OrderStatus(str, Enum):
    NEW = "new"
    PROCESSING = "processing"
    TRANSIT = "transit"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


# --- USER SCHEMAS ---
class UserBase(BaseModel):
    username: str
    email: EmailStr


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    role: int
    # We do NOT include password here to prevent leaks

    class Config:
        from_attributes = True


class ProductSearchSuggestion(BaseModel):
    id: int
    name: str
    image1: str  # Added
    price: float  # Added
    stock: int  # Added

    class Config:
        from_attributes = True


class ResponseUser(User):
    pass


class UserLogin(BaseModel):
    username: EmailStr
    password: str


# --- PRODUCT SCHEMAS ---
class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    category: str
    stock: int
    size: str
    new: int
    image1: str
    image2: Optional[str] = None
    image3: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    stock: Optional[int] = None
    size: Optional[str] = None
    new: Optional[int] = None


class Product(ProductBase):
    id: int

    class Config:
        from_attributes = True


# --- ORDER SCHEMAS ---


# Helper for items inside an order
class OrderItem(BaseModel):
    product: int
    quantity: int
    # Optional fields that might be passed but sanitized by backend
    product_name: Optional[str] = None
    price: Optional[float] = None


class OrderBase(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: str
    address: str
    order_description: Optional[str] = None
    method: int


# Used when CREATING an order (Frontend -> Backend)
class OrderCreate(OrderBase):
    user_id: int
    # FIX: Pydantic validates this is a list, preventing bad JSON injection
    products: List[OrderItem]


# Used for Admin UPDATES
class OrderUpdate(BaseModel):
    status: OrderStatus
    paid: Optional[int] = None


# Used when READING an order (Backend -> Frontend)
class Order(OrderBase):
    id: int
    user_id: int
    # FIX: "Json" tells Pydantic to parse the DB string into a Python list
    products: Json[List[Dict[str, Any]]]
    paid: int
    status: OrderStatus
    created_at: int

    class Config:
        from_attributes = True


# --- CATEGORY SCHEMAS ---
class Category(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


# --- AUTH TOKENS ---
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    id: Optional[int] = None
    email: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: ResponseUser


# --- RECIPE SCHEMAS ---
class RecipeItemBase(BaseModel):
    ingredient_name: str
    quantity: float
    unit_price: float


class RecipeItemCreate(RecipeItemBase):
    pass


class RecipeItem(RecipeItemBase):
    id: int
    product_id: int
    total_cost: float

    class Config:
        from_attributes = True


# --- DASHBOARD/STATS ---
class SalesReport(BaseModel):
    date: str
    total_orders: int
    total_revenue: float


class DashboardStats(BaseModel):
    total_revenue: float
    total_orders: int
    sold_products_count: int
    sales_graph: List[SalesReport]


class NotificationUpdate(BaseModel):
    text_en: str
    text_bn: str
    is_active: int
    is_highlighted: int  # Add this
    notif_type: str


class NotificationOut(NotificationUpdate):
    id: int

    class Config:
        from_attributes = True


class StoreSettingUpdate(BaseModel):
    delivery_charge: float
    free_delivery_threshold: float


class StoreSettingOut(StoreSettingUpdate):
    id: int

    class Config:
        from_attributes = True
