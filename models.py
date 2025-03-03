
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    user_type = db.Column(db.String(20), nullable=False)  # 'buyer' or 'seller'
    phone_number = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship with seller profile
    seller_profile = db.relationship('SellerProfile', backref='user', uselist=False)

class SellerProfile(db.Model):
    __tablename__ = 'seller_profile'
    
    seller_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    business_name = db.Column(db.String(255), nullable=False)
    business_description = db.Column(db.Text, nullable=True)
    approval_status = db.Column(db.String(20), default='pending', nullable=False)  # pending, approved, rejected
    approved_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
