
from flask import Flask
from models import db, Message
from app import app

def update_database_for_replies():
    with app.app_context():
        try:
            # The parent_message_id column should already exist from previous updates
            # Let's make sure the Message model can handle replies properly
            
            # Check if we need to add any indexes for better performance
            db.engine.execute("""
                CREATE INDEX IF NOT EXISTS idx_parent_message_id ON messages(parent_message_id);
                CREATE INDEX IF NOT EXISTS idx_sender_email ON messages(senderEmail);
                CREATE INDEX IF NOT EXISTS idx_seller_messages ON messages(seller_id);
            """)
            
            print("Database updated successfully for reply functionality")
            print("Added indexes for better message query performance")
            
            return True
        except Exception as e:
            print(f"Error updating database: {str(e)}")
            return False

if __name__ == "__main__":
    update_database_for_replies()
