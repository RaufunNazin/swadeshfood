from pydantic import BaseModel, EmailStr
from typing import Optional, List
import json

class User(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: int

class Product(BaseModel):
    name: str
    description: str
    image1: str
    image2: Optional[str]
    image3: Optional[str]
    price: float
    category: str
    stock: int
    size: str
    new: int
    
class ProductUpdate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    stock: int
    size: str
    new: int
    
class ProductsOrdered(BaseModel):
    product: int
    quantity: int
    product_name: Optional[str] = None

class Order(BaseModel):
    id: Optional[int] = None
    user_id: int
    products: str
    paid: int
    status: str
    name: str
    email: Optional[str]
    phone: str
    address: str
    order_description: Optional[str]
    method: int
    created_at: Optional[int] = None

class Category(BaseModel):
    name: str

class ResponseUser(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: int 

    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    username: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: int
    email: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: ResponseUser

    class Config:
        orm_mode = True
