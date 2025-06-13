
from flask import Flask
from models import db, User, SellerProfile, AdminProfile, Product, Message, CartItem, Order, OrderItem
from sqlalchemy import text
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/kukuhub'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

def setup_database():
    with app.app_context():
        try:
            # Check if database exists, if not create it
            with db.engine.connect() as conn:
                conn.execute(text("CREATE DATABASE IF NOT EXISTS kukuhub"))
                conn.commit()
            
            # Create all tables
            db.create_all()
            
            print("Database setup completed successfully!")
            print("Created tables:")
            for table in db.metadata.tables.keys():
                print(f"- {table}")
                
            # Create upload directory if it doesn't exist
            upload_folder = 'static/uploads'
            if not os.path.exists(upload_folder):
                os.makedirs(upload_folder)
                print(f"Created upload directory: {upload_folder}")
                
            return True
        except Exception as e:
            print(f"Error setting up database: {str(e)}")
            return False

if __name__ == "__main__":
    setup_database()
