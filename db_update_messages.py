
from flask import Flask
from models import db, Message
from app import app

def update_database():
    with app.app_context():
        try:
            # Add the parent_message_id column to the messages table if it doesn't exist
            db.engine.execute("""
                ALTER TABLE messages 
                ADD COLUMN IF NOT EXISTS parent_message_id INTEGER NULL
            """)
            print("Messages table updated successfully with parent_message_id column")
            
            return True
        except Exception as e:
            print(f"Error updating database: {str(e)}")
            return False

if __name__ == "__main__":
    update_database()
