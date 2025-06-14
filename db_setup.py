
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
            
            # Add missing columns to existing tables if they don't exist
            try:
                with db.engine.connect() as conn:
                    # Check and add video-related columns to products table
                    result = conn.execute(text("SHOW COLUMNS FROM products LIKE 'video_url'"))
                    if not result.fetchone():
                        conn.execute(text("ALTER TABLE products ADD COLUMN video_url VARCHAR(255) NULL"))
                        print("Added video_url column to products table")
                    
                    result = conn.execute(text("SHOW COLUMNS FROM products LIKE 'media_type'"))
                    if not result.fetchone():
                        conn.execute(text("ALTER TABLE products ADD COLUMN media_type VARCHAR(20) DEFAULT 'image' NOT NULL"))
                        print("Added media_type column to products table")
                    
                    # Check and add missing columns to orders table
                    result = conn.execute(text("SHOW COLUMNS FROM orders LIKE 'total'"))
                    if not result.fetchone():
                        conn.execute(text("ALTER TABLE orders ADD COLUMN total FLOAT NOT NULL DEFAULT 0.0"))
                        print("Added total column to orders table")
                    
                    result = conn.execute(text("SHOW COLUMNS FROM orders LIKE 'status'"))
                    if not result.fetchone():
                        conn.execute(text("ALTER TABLE orders ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'Pending'"))
                        print("Added status column to orders table")
                    
                    result = conn.execute(text("SHOW COLUMNS FROM orders LIKE 'updated_at'"))
                    if not result.fetchone():
                        conn.execute(text("ALTER TABLE orders ADD COLUMN updated_at DATETIME NULL"))
                        print("Added updated_at column to orders table")
                    
                    # Check and add missing columns to messages table for replies
                    result = conn.execute(text("SHOW COLUMNS FROM messages LIKE 'reply'"))
                    if not result.fetchone():
                        conn.execute(text("ALTER TABLE messages ADD COLUMN reply TEXT NULL"))
                        print("Added reply column to messages table")
                    
                    result = conn.execute(text("SHOW COLUMNS FROM messages LIKE 'replied_at'"))
                    if not result.fetchone():
                        conn.execute(text("ALTER TABLE messages ADD COLUMN replied_at DATETIME NULL"))
                        print("Added replied_at column to messages table")
                    
                    conn.commit()
                    print("Database schema updated successfully!")
                    
            except Exception as e:
                print(f"Note: Could not add missing columns (they may already exist): {str(e)}")
            
            print("Database setup completed successfully!")
            print("Created/verified tables:")
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
