
from flask import Flask
from models import db, Message
from app import app

def update_database():
    with app.app_context():
        try:
            # Add the new columns to the messages table if they don't exist
            db.engine.execute("""
                ALTER TABLE messages 
                ADD COLUMN IF NOT EXISTS senderName VARCHAR(100) NULL,
                ADD COLUMN IF NOT EXISTS senderEmail VARCHAR(100) NULL,
                ADD COLUMN IF NOT EXISTS productName VARCHAR(255) NULL
            """)
            print("Messages table updated successfully")
            
            return True
        except Exception as e:
            print(f"Error updating database: {str(e)}")
            return False

if __name__ == "__main__":
    update_database()
