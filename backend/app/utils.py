from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password) :
    return pwd_context.verify(plain_password, hashed_password)

# get the photo uploaded by the user and download it to the server
def save_photo(photo) :
    with open(f"photos/{photo.filename}", "wb") as buffer:
        shutil.copyfileobj(photo.file, buffer)
    return f"photos/{photo.filename}"