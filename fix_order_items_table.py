
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
                
                # Check if 'id' column exists
                has_id_column = any(col[0] == 'id' for col in columns)
                
                if not has_id_column:
                    print("The 'id' column is missing. The table structure is correct for our new model.")
                    print("No changes needed - the model has been updated to match the database.")
                else:
                    print("The 'id' column exists but our model doesn't need it.")
                    print("Consider updating the database to remove the 'id' column if not needed elsewhere.")
                
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
