
from flask import jsonify, session
from models import User, SellerProfile, AdminProfile

def check_admin_auth():
    if 'user_id' in session and 'user_type' in session and session['user_type'] == 'admin':
        user_id = session['user_id']
        
        # Get admin user details
        admin_user = User.query.filter_by(user_id=user_id, user_type='admin').first()
        admin_profile = AdminProfile.query.filter_by(user_id=user_id).first()
        
        if admin_user and admin_profile:
            return jsonify({
                'isAuthenticated': True,
                'user_id': admin_user.user_id,
                'username': admin_user.username,
                'admin_id': admin_profile.admin_id,
                'role': admin_profile.role,
                'department': admin_profile.department,
                'user_type': 'admin'
            })
    
    return jsonify({'isAuthenticated': False})

def check_seller_auth():
    if 'user_id' in session and 'user_type' in session and session['user_type'] == 'seller':
        user_id = session['user_id']
        
        # Get seller profile
        seller_profile = SellerProfile.query.filter_by(user_id=user_id).first()
        user = User.query.filter_by(user_id=user_id).first()
        
        if seller_profile and user:
            return jsonify({
                'isAuthenticated': True,
                'seller_id': seller_profile.seller_id,
                'business_name': seller_profile.business_name,
                'business_description': seller_profile.business_description,
                'approval_status': seller_profile.approval_status,
                'user_id': user.user_id,
                'username': user.username,
                'email': user.email,
                'phone_number': user.phone_number,
                'user_type': 'seller'
            })
    
    return jsonify({'isAuthenticated': False})
