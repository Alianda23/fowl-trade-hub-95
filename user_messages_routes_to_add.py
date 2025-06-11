
"""
Add these routes to your app.py file to handle user messages:

# User Messages Routes
@app.route('/api/user/messages', methods=['GET'])
def get_user_messages():
    try:
        user_email = request.args.get('email')
        
        if not user_email:
            return jsonify({'success': False, 'message': 'Email is required'}), 400
        
        # Get all messages for this user (both sent and received)
        messages = db.session.query(Message).filter(
            db.or_(
                Message.senderEmail == user_email,
                db.and_(
                    Message.seller_id != None,
                    Message.senderEmail == user_email
                )
            )
        ).order_by(Message.created_at.desc()).all()
        
        message_list = []
        for message in messages:
            # Determine if this is from seller (a reply)
            is_from_seller = hasattr(message, 'parent_message_id') and message.parent_message_id is not None
            
            message_data = {
                'id': str(message.message_id),
                'content': message.content,
                'productName': message.productName or 'General',
                'sellerName': message.seller.business_name if message.seller else 'Seller',
                'isFromSeller': is_from_seller,
                'isRead': message.is_read,
                'createdAt': message.created_at.isoformat(),
                'parentMessageId': str(message.parent_message_id) if message.parent_message_id else None
            }
            message_list.append(message_data)
        
        return jsonify({
            'success': True,
            'messages': message_list
        })
        
    except Exception as e:
        print(f"Error fetching user messages: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch messages'}), 500

@app.route('/api/user/messages/mark-read/<message_id>', methods=['PUT'])
def mark_user_message_read(message_id):
    try:
        data = request.get_json()
        user_email = data.get('userEmail')
        
        if not user_email:
            return jsonify({'success': False, 'message': 'User email is required'}), 400
        
        # Find the message
        message = Message.query.filter_by(message_id=message_id).first()
        
        if not message:
            return jsonify({'success': False, 'message': 'Message not found'}), 404
        
        # Verify this message belongs to the user
        if message.senderEmail != user_email:
            return jsonify({'success': False, 'message': 'Unauthorized'}), 403
        
        # Mark as read
        message.is_read = True
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Message marked as read'})
        
    except Exception as e:
        print(f"Error marking message as read: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to mark message as read'}), 500
"""

print("Add the above routes to your app.py file to handle user messages")
