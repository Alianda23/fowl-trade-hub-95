
"""
Update the seller reply route in your app.py file:

@app.route('/api/seller/messages/reply', methods=['POST'])
def seller_reply_to_message():
    try:
        data = request.get_json()
        original_message_id = data.get('originalMessageId')
        reply_content = data.get('replyContent')
        recipient_email = data.get('recipientEmail')
        product_name = data.get('productName')
        
        # Get seller info from session
        seller_id = session.get('seller_id')
        if not seller_id:
            return jsonify({'success': False, 'message': 'Not authenticated'}), 401
        
        # Get seller info
        seller = SellerProfile.query.get(seller_id)
        if not seller:
            return jsonify({'success': False, 'message': 'Seller not found'}), 404
        
        # Create reply message
        reply_message = Message(
            content=reply_content,
            senderName=seller.business_name,
            senderEmail=seller.email,
            productName=product_name,
            seller_id=seller_id,
            parent_message_id=original_message_id,
            is_read=False
        )
        
        db.session.add(reply_message)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Reply sent successfully'
        })
        
    except Exception as e:
        print(f"Error sending reply: {str(e)}")
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Failed to send reply'}), 500
"""

print("Update the seller reply route in your app.py file with the above code")
