from .database import Base
from sqlalchemy import Integer, String, Column, ForeignKey
from sqlalchemy.orm import relationship

class User(Base) :
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, nullable=False)
    username = Column(String(50), nullable=False)
    email = Column(String(100), nullable=False)
    password = Column(String(100), nullable=False)
    role = Column(Integer, nullable=False)
    
class Product(Base) :
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(String(300), nullable=False)
    price = Column(Integer, nullable=False)
    image = Column(String(100), nullable=False)
    category = Column(String(100), nullable=False)
    stock = Column(Integer, nullable=False)
    size = Column(String(20), nullable=False)
    new = Column(Integer, nullable=False)