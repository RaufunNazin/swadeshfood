from pydantic import BaseModel, EmailStr
from typing import Optional

class User(BaseModel) :
    username : str
    email : EmailStr
    password : str
    role : int
    
class Product(BaseModel) :
    name : str
    description : str
    price : float
    image : str
    category : str
    stock : int
    size : str
    new : int
    
     
class ResponseUser(BaseModel) :
    id : int
    username : str
    email : EmailStr
    role : int 

    class Config :
        from_attributes = True
        
class UserLogin(BaseModel) :
    username : EmailStr
    password : str

class Token(BaseModel) :
    access_token : str
    token_type : str

class TokenData(BaseModel) :
    id : int 
    email : str

class TokenResponse(BaseModel) :
    access_token : str
    token_type : str
    user : ResponseUser
    
    class Config :
        from_attributes = True