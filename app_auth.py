
from flask import jsonify, session
from models import User, SellerProfile, AdminProfile

def check_auth():
    if 'user_id' in session:
        user_id = session['user_id']
        
        # Get user details from User model
        user = User.query.filter_by(user_id=user_id).first()
        
        if user:
            return jsonify({
                'isAuthenticated': True,
                'user_id': user.user_id,
                'username': user.username,
                'email': user.email,
                'phone_number': user.phone_number
            })
    
    return jsonify({'isAuthenticated': False})

def check_admin_auth():
    if 'admin_id' in session:
        admin_id = session['admin_id']
        
        # Get admin user details directly from AdminProfile
        admin = AdminProfile.query.filter_by(admin_id=admin_id).first()
        
        if admin:
            return jsonify({
                'isAuthenticated': True,
                'admin_id': admin.admin_id,
                'username': admin.username,
                'email': admin.email,
                'role': admin.role,
                'department': admin.department,
                'phone_number': admin.phone_number
            })
    
    return jsonify({'isAuthenticated': False})

def check_seller_auth():
    if 'seller_id' in session:
        seller_id = session['seller_id']
        
        # Get seller profile directly from SellerProfile
        seller = SellerProfile.query.filter_by(seller_id=seller_id).first()
        
        if seller:
            return jsonify({
                'isAuthenticated': True,
                'seller_id': seller.seller_id,
                'username': seller.username,
                'email': seller.email,
                'business_name': seller.business_name,
                'business_description': seller.business_description,
                'approval_status': seller.approval_status,
                'phone_number': seller.phone_number
            })
    
    return jsonify({'isAuthenticated': False})
