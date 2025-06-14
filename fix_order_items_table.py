
from flask import Flask
from models import db
from sqlalchemy import text

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/kukuhub'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

def fix_order_items_table():
    with app.app_context():
        try:
            print("Checking order_items table structure...")
            
            with db.engine.connect() as conn:
                # Check if the table exists and its current structure
                result = conn.execute(text("DESCRIBE order_items"))
                columns = result.fetchall()
                
                print("Current order_items table structure:")
                for column in columns:
                    print(f"  - {column}")
                
                # Check if 'price' column exists
                has_price_column = any(col[0] == 'price' for col in columns)
                
                if not has_price_column:
                    print("Missing 'price' column - adding it...")
                    conn.execute(text("ALTER TABLE order_items ADD COLUMN price FLOAT NOT NULL DEFAULT 0.0"))
                    print("Added price column to order_items table")
                else:
                    print("Price column already exists - table structure is correct.")
                
                # Check if 'id' column exists (it shouldn't for our composite key model)
                has_id_column = any(col[0] == 'id' for col in columns)
                
                if has_id_column:
                    print("WARNING: Table has 'id' column but our model uses composite primary key.")
                    print("Consider removing the 'id' column if not needed elsewhere.")
                else:
                    print("No 'id' column found - composite primary key structure is correct.")
                
                # Check primary key structure
                result = conn.execute(text("SHOW KEYS FROM order_items WHERE Key_name = 'PRIMARY'"))
                primary_keys = result.fetchall()
                
                print("Primary key structure:")
                for key in primary_keys:
                    print(f"  - {key}")
                
                conn.commit()
                
            print("Database structure check completed!")
            return True
            
        except Exception as e:
            print(f"Error checking database structure: {str(e)}")
            return False

if __name__ == "__main__":
    fix_order_items_table()
