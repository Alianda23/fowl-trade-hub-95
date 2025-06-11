
@app.route('/api/seller/messages/reply', methods=['POST'])
def seller_reply_to_message():
    """Handle seller replies to messages"""
    # Check if seller is authenticated
    auth_check = check_seller_auth()
    auth_data = auth_check.get_json()
    
    if not auth_data.get('isAuthenticated'):
        return jsonify({'success': False, 'message': 'Seller not authenticated'})
    
    try:
        data = request.json
        original_message_id = data.get('messageId')
        reply_content = data.get('replyContent')
        
        # Validate inputs
        if not original_message_id or not reply_content:
            return jsonify({'success': False, 'message': 'Invalid message data'})
        
        # Find the original message
        original_message = Message.query.get(original_message_id)
        if not original_message:
            return jsonify({'success': False, 'message': 'Original message not found'})
        
        # Create a new reply message
        reply_message = Message(
            content=reply_content,
            seller_id=int(auth_data.get('seller_id')),
            parent_message_id=original_message_id,
            user_id=original_message.user_id,  # Maintain user reference
            senderName=auth_data.get('username'),  # Seller's name
            senderEmail=auth_data.get('email'),  # Seller's email
            productName=original_message.productName,
            product_id=original_message.product_id
        )
        
        db.session.add(reply_message)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Reply sent successfully',
            'replyId': reply_message.message_id
        })
    
    except Exception as e:
        db.session.rollback()
        print(f"Error sending seller reply: {str(e)}")
        return jsonify({'success': False, 'message': f'Error sending reply: {str(e)}'})

