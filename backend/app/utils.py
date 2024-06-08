from passlib.context import CryptContext
import random
import string

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password) :
    return pwd_context.verify(plain_password, hashed_password)

def random_string() :
    return ''.join(random.choices(string.ascii_letters + string.digits, k=32))