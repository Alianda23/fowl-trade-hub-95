
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    phone_number = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    # User type is now always 'buyer' - removed user_type field

class SellerProfile(db.Model):
    __tablename__ = 'seller_profile'
    
    seller_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    business_name = db.Column(db.String(255), nullable=False)
    business_description = db.Column(db.Text, nullable=True)
    approval_status = db.Column(db.String(20), default='pending', nullable=False)  # pending, approved, rejected
    phone_number = db.Column(db.String(20), nullable=True)
    approved_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class AdminProfile(db.Model):
    __tablename__ = 'admin_profile'
    
    admin_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default='general', nullable=False)  # general, super, etc.
    department = db.Column(db.String(100), nullable=True)
    phone_number = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# New Models for Products and Messages
class Product(db.Model):
    __tablename__ = 'products'
    
    product_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, nullable=False, default=0)
    category = db.Column(db.String(100), nullable=False)
    image_url = db.Column(db.String(255), nullable=True)
    
    seller_id = db.Column(db.Integer, db.ForeignKey('seller_profile.seller_id'), nullable=False)
    seller = db.relationship('SellerProfile', backref=db.backref('products', lazy=True))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Message(db.Model):
    __tablename__ = 'messages'
    
    message_id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    
    # For buyer (user) messages
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=True)
    user = db.relationship('User', backref=db.backref('sent_messages', lazy=True))
    
    # For recipient (seller)
    seller_id = db.Column(db.Integer, db.ForeignKey('seller_profile.seller_id'), nullable=False)
    seller = db.relationship('SellerProfile', backref=db.backref('received_messages', lazy=True))
    
    # Product reference (optional, if message is about a specific product)
    product_id = db.Column(db.Integer, db.ForeignKey('products.product_id'), nullable=True)
    product = db.relationship('Product', backref=db.backref('messages', lazy=True))
    
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
