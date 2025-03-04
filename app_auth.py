
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
