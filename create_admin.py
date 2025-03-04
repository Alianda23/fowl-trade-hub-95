
from flask import Flask
from werkzeug.security import generate_password_hash
from models import db, User
import sys

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/kukuhub'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

def create_admin_user(username, email, password, phone_number=None):
    with app.app_context():
        # Check if admin already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            print(f"Error: User with email {email} already exists.")
            return False
        
        try:
            # Create new admin user
            hashed_password = generate_password_hash(password)
            new_admin = User(
                username=username,
                email=email,
                password_hash=hashed_password,
                user_type='admin',  # Set user_type as admin
                phone_number=phone_number
            )
            
            db.session.add(new_admin)
            db.session.commit()
            
            print(f"Admin user {username} created successfully!")
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"Error creating admin: {str(e)}")
            return False

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python create_admin.py <username> <email> <password> [phone_number]")
        sys.exit(1)
    
    username = sys.argv[1]
    email = sys.argv[2]
    password = sys.argv[3]
    phone_number = sys.argv[4] if len(sys.argv) > 4 else None
    
    success = create_admin_user(username, email, password, phone_number)
    if not success:
        sys.exit(1)
