
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
