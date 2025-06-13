
from flask import Flask
from models import db, Message
from sqlalchemy import text

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/kukuhub'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

def add_reply_fields():
    """Add reply and replied_at fields to the messages table"""
    with app.app_context():
        try:
            # Add reply column
            with db.engine.connect() as conn:
                conn.execute(text("ALTER TABLE messages ADD COLUMN reply TEXT NULL"))
                conn.commit()
            print("Added 'reply' column to messages table")
        except Exception as e:
            print(f"Error adding reply column (might already exist): {e}")
        
        try:
            # Add replied_at column
            with db.engine.connect() as conn:
                conn.execute(text("ALTER TABLE messages ADD COLUMN replied_at DATETIME NULL"))
                conn.commit()
            print("Added 'replied_at' column to messages table")
        except Exception as e:
            print(f"Error adding replied_at column (might already exist): {e}")
        
        print("Database migration completed!")

if __name__ == '__main__':
    add_reply_fields()
