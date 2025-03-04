
from flask import jsonify, session
from models import User, SellerProfile

@app.route('/api/admin/check-auth', methods=['GET'])
def check_admin_auth():
    if 'user_id' in session and 'user_type' in session and session['user_type'] == 'admin':
        user_id = session['user_id']
        
        # Get admin user details
        admin_user = User.query.filter_by(user_id=user_id, user_type='admin').first()
        
        if admin_user:
            return jsonify({
                'isAuthenticated': True,
                'user_id': admin_user.user_id,
                'username': admin_user.username
            })
    
    return jsonify({'isAuthenticated': False})

@app.route('/api/seller/check-auth', methods=['GET'])
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
                'user_id': user.user_id,
                'username': user.username,
                'user_type': 'seller'
            })
    
    return jsonify({'isAuthenticated': False})
