from flask import Flask, request, jsonify, session
from flask_cors import CORS
from models import db, User, SellerProfile
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/kukuhub'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = 'your_secret_key'  # Change this to a secure key in production

CORS(app, supports_credentials=True)
db.init_app(app)

@app.route('/api/seller/register', methods=['POST'])
def seller_register():
    data = request.json
    
    # Check if user already exists
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({'success': False, 'message': 'Email already registered'})
    
    try:
        # Create new user with user_type='seller'
        hashed_password = generate_password_hash(data['password'])
        new_user = User(
            username=data['username'],
            email=data['email'],
            password_hash=hashed_password,
            user_type='seller',
            phone_number=data.get('phone_number')
        )
        
        # Add and commit user to get the user_id
        db.session.add(new_user)
        db.session.flush()  # This gets the user_id without committing
        
        # Create seller profile linked to the new user
        new_seller_profile = SellerProfile(
            user_id=new_user.user_id,
            business_name=data['business_name'],
            business_description=None,  # Initially null
            approval_status='pending'  # Default status
        )
        
        # Add seller profile and commit both transactions
        db.session.add(new_seller_profile)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Seller registered successfully'})
    
    except Exception as e:
        db.session.rollback()
        print(f"Error during seller registration: {str(e)}")
        return jsonify({'success': False, 'message': f'Registration failed: {str(e)}'})

@app.route('/api/seller/login', methods=['POST'])
def seller_login():
    data = request.json
    
    # First check if user exists and is a seller
    user = User.query.filter_by(email=data['email'], user_type='seller').first()
    
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'success': False, 'message': 'Invalid credentials'})
    
    # Get seller profile to check approval status
    seller_profile = SellerProfile.query.filter_by(user_id=user.user_id).first()
    
    if not seller_profile:
        return jsonify({'success': False, 'message': 'Seller profile not found'})
    
    # Optional: Check if seller is approved
    # if seller_profile.approval_status != 'approved':
    #     return jsonify({'success': False, 'message': 'Your seller account is pending approval'})
    
    # Set session data
    session['user_id'] = user.user_id
    session['user_type'] = 'seller'
    session['seller_id'] = seller_profile.seller_id
    
    return jsonify({
        'success': True, 
        'message': 'Login successful',
        'seller_id': seller_profile.seller_id
    })

@app.route('/api/seller/check-auth', methods=['GET'])
def check_seller_auth():
    if 'user_id' in session and 'user_type' in session and session['user_type'] == 'seller':
        user_id = session['user_id']
        
        # Get seller profile
        seller_profile = SellerProfile.query.filter_by(user_id=user_id).first()
        
        if seller_profile:
            return jsonify({
                'isAuthenticated': True,
                'seller_id': seller_profile.seller_id,
                'business_name': seller_profile.business_name
            })
    
    return jsonify({'isAuthenticated': False})

@app.route('/api/logout', methods=['POST'])
def logout():
    # Clear the session
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully'})

if __name__ == '__main__':
    app.run(debug=True)
