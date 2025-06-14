
from flask import Flask
from models import db
from sqlalchemy import text

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/kukuhub'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

def fix_cart_items_table():
    with app.app_context():
        try:
            print("Checking cart_items table structure...")
            
            with db.engine.connect() as conn:
                # Check if the table exists and its current structure
                result = conn.execute(text("DESCRIBE cart_items"))
                columns = result.fetchall()
                
                print("Current cart_items table structure:")
                for column in columns:
                    print(f"  - {column}")
                
                # Check primary key structure
                result = conn.execute(text("SHOW KEYS FROM cart_items WHERE Key_name = 'PRIMARY'"))
                primary_keys = result.fetchall()
                
                print("Primary key structure:")
                for key in primary_keys:
                    print(f"  - Column: {key[4]}")
                
                # Check if we have cart_item_id or id column
                has_cart_item_id = any(col[0] == 'cart_item_id' for col in columns)
                has_id = any(col[0] == 'id' for col in columns)
                
                print(f"Has 'cart_item_id' column: {has_cart_item_id}")
                print(f"Has 'id' column: {has_id}")
                
                if has_cart_item_id and not has_id:
                    print("Table uses 'cart_item_id' - updating model to match.")
                elif has_id and not has_cart_item_id:
                    print("Table uses 'id' - model is now updated to match this.")
                else:
                    print("Unexpected table structure - manual intervention may be required.")
                
                conn.commit()
                
            print("Database structure check completed!")
            return True
            
        except Exception as e:
            print(f"Error checking database structure: {str(e)}")
            return False

if __name__ == "__main__":
    fix_cart_items_table()
