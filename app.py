
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

# Add this code to handle cart operations
@app.route('/api/cart', methods=['GET'])
def get_cart():
    """Get user's cart items from database"""
    # Check if user is authenticated
    auth_check = check_auth()
    auth_data = auth_check.get_json()
    
    if not auth_data.get('isAuthenticated'):
        return jsonify({'success': False, 'message': 'User not authenticated'})
    
    try:
        user_id = auth_data.get('user_id')
        cart_items = CartItem.query.filter_by(user_id=user_id).all()
        
        # Convert cart items to dictionary format
        cart = []
        for item in cart_items:
            product = Product.query.get(item.product_id)
            if product:
                cart.append({
                    'id': str(product.product_id),
                    'name': product.name,
                    'price': product.price,
                    'quantity': item.quantity,
                    'image': product.image_url,
                    'sellerId': str(product.seller_id),
                    'category': product.category
                })
        
        return jsonify({'success': True, 'cart': cart})
    
    except Exception as e:
        print(f"Error fetching cart: {str(e)}")
        return jsonify({'success': False, 'message': f'Error fetching cart: {str(e)}'})

@app.route('/api/cart/update', methods=['POST'])
def update_cart():
    """Update user's cart in database"""
    # Check if user is authenticated
    auth_check = check_auth()
    auth_data = auth_check.get_json()
    
    if not auth_data.get('isAuthenticated'):
        return jsonify({'success': False, 'message': 'User not authenticated'})
    
    try:
        user_id = auth_data.get('user_id')
        data = request.json
        items = data.get('items', [])
        
        # Clear existing cart items for this user
        CartItem.query.filter_by(user_id=user_id).delete()
        
        # Add new cart items
        for item in items:
            cart_item = CartItem(
                user_id=user_id,
                product_id=item['product_id'],
                quantity=item['quantity']
            )
            db.session.add(cart_item)
        
        db.session.commit()
        return jsonify({'success': True, 'message': 'Cart updated successfully'})
    
    except Exception as e:
        db.session.rollback()
        print(f"Error updating cart: {str(e)}")
        return jsonify({'success': False, 'message': f'Error updating cart: {str(e)}'})

@app.route('/api/cart/clear', methods=['DELETE'])
def clear_cart():
    """Clear user's cart from database"""
    # Check if user is authenticated
    auth_check = check_auth()
    auth_data = auth_check.get_json()
    
    if not auth_data.get('isAuthenticated'):
        return jsonify({'success': False, 'message': 'User not authenticated'})
    
    try:
        user_id = auth_data.get('user_id')
        
        # Delete all cart items for this user
        CartItem.query.filter_by(user_id=user_id).delete()
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Cart cleared successfully'})
    
    except Exception as e:
        db.session.rollback()
        print(f"Error clearing cart: {str(e)}")
        return jsonify({'success': False, 'message': f'Error clearing cart: {str(e)}'})

@app.route('/api/orders', methods=['GET'])
def get_orders():
    """Get user's orders from database"""
    # Check if user is authenticated
    auth_check = check_auth()
    auth_data = auth_check.get_json()
    
    if not auth_data.get('isAuthenticated'):
        return jsonify({'success': False, 'message': 'User not authenticated'})
    
    try:
        user_id = auth_data.get('user_id')
        orders_db = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()
        
        # Convert orders to dictionary format with items
        orders = []
        for order in orders_db:
            order_items = OrderItem.query.filter_by(order_id=order.order_id).all()
            
            items = []
            for item in order_items:
                product = Product.query.get(item.product_id)
                seller_id = str(product.seller_id) if product else None
                
                items.append({
                    'product_id': item.product_id,
                    'name': item.product.name if product else "Unknown Product",
                    'price': item.price,
                    'quantity': item.quantity,
                    'image_url': product.image_url if product else None,
                    'seller_id': seller_id
                })
            
            orders.append({
                'order_id': order.order_id,
                'user_id': order.user_id,
                'total': order.total,
                'status': order.status,
                'created_at': order.created_at.isoformat(),
                'items': items
            })
        
        return jsonify({'success': True, 'orders': orders})
    
    except Exception as e:
        print(f"Error fetching orders: {str(e)}")
        return jsonify({'success': False, 'message': f'Error fetching orders: {str(e)}'})

@app.route('/api/orders/create', methods=['POST'])
def create_order():
    """Create a new order in the database"""
    # Check if user is authenticated
    auth_check = check_auth()
    auth_data = auth_check.get_json()
    
    if not auth_data.get('isAuthenticated'):
        return jsonify({'success': False, 'message': 'User not authenticated'})
    
    try:
        data = request.json
        user_id = auth_data.get('user_id')
        
        # Create order
        new_order = Order(
            order_id=data['order_id'],
            user_id=user_id,
            total=data['total'],
            status=data['status']
        )
        
        # Add order items
        db.session.add(new_order)
        db.session.flush()  # Flush to get the order_id before committing
        
        for item in data['items']:
            order_item = OrderItem(
                order_id=new_order.order_id,
                product_id=item['product_id'],
                quantity=item['quantity'],
                price=item['price']
            )
            db.session.add(order_item)
        
        # Clear cart after creating order
        CartItem.query.filter_by(user_id=user_id).delete()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Order created successfully',
            'orderId': new_order.order_id
        })
    
    except Exception as e:
        db.session.rollback()
        print(f"Error creating order: {str(e)}")
        return jsonify({'success': False, 'message': f'Error creating order: {str(e)}'})

@app.route('/api/orders/update-status/<order_id>', methods=['PUT'])
def update_order_status(order_id):
    """Update the status of an order"""
    try:
        data = request.json
        new_status = data.get('status')
        
        if not new_status:
            return jsonify({'success': False, 'message': 'No status provided'})
        
        # Find the order
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'success': False, 'message': 'Order not found'})
        
        # Update status
        order.status = new_status
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Order status updated successfully'
        })
    
    except Exception as e:
        db.session.rollback()
        print(f"Error updating order status: {str(e)}")
        return jsonify({'success': False, 'message': f'Error updating order status: {str(e)}'})
