
from flask import Flask
from models import db, Order, OrderItem
from app import app

def setup_orders_tables():
    with app.app_context():
        try:
            # Create the orders and order_items tables if they don't exist
            print("Setting up orders tables...")
            
            # Check if tables exist, create if not
            inspector = db.inspect(db.engine)
            existing_tables = inspector.get_table_names()
            
            if 'orders' not in existing_tables:
                print("Creating orders table...")
                db.engine.execute("""
                    CREATE TABLE orders (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        order_id VARCHAR(255) UNIQUE NOT NULL,
                        user_id INT NOT NULL,
                        total DECIMAL(10,2) NOT NULL,
                        status VARCHAR(50) DEFAULT 'Pending',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(id)
                    )
                """)
            
            if 'order_items' not in existing_tables:
                print("Creating order_items table...")
                db.engine.execute("""
                    CREATE TABLE order_items (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        order_id INT NOT NULL,
                        product_id VARCHAR(255) NOT NULL,
                        quantity INT NOT NULL,
                        price DECIMAL(10,2) NOT NULL,
                        name VARCHAR(255) NOT NULL,
                        image_url TEXT,
                        seller_id VARCHAR(255),
                        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
                    )
                """)
            
            print("Orders tables setup completed successfully!")
            return True
            
        except Exception as e:
            print(f"Error setting up orders tables: {str(e)}")
            return False

if __name__ == "__main__":
    setup_orders_tables()
