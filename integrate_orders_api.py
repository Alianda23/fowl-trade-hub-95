
"""
This script adds the orders API endpoints to the main Flask application.
Run this to integrate the orders functionality into app.py
"""

def integrate_orders_api():
    # Read the current app.py content
    with open('app.py', 'r') as f:
        app_content = f.read()
    
    # Check if orders API is already integrated
    if '/api/orders' in app_content:
        print("Orders API already integrated in app.py")
        return
    
    # Add the orders API import and endpoints
    orders_api_code = '''
# Orders API endpoints
@app.route('/api/orders', methods=['POST'])
def create_order():
    try:
        data = request.get_json()
        print(f"Received order data: {data}")
        
        # Validate required fields
        if not data or 'order_id' not in data or 'user_id' not in data:
            return jsonify({
                'success': False, 
                'message': 'Missing required fields: order_id, user_id'
            }), 400
        
        # Check if user exists
        user = User.query.get(data['user_id'])
        if not user:
            return jsonify({
                'success': False, 
                'message': 'User not found'
            }), 404
        
        # Create new order
        new_order = Order(
            order_id=data['order_id'],
            user_id=data['user_id'],
            total=data.get('total', 0),
            status=data.get('status', 'Pending')
        )
        
        db.session.add(new_order)
        
        # Add order items
        if 'items' in data:
            for item_data in data['items']:
                # Validate product exists
                product = Product.query.get(item_data['product_id'])
                if not product:
                    return jsonify({
                        'success': False, 
                        'message': f'Product with ID {item_data["product_id"]} not found'
                    }), 404
                
                order_item = OrderItem(
                    order_id=data['order_id'],
                    product_id=item_data['product_id'],
                    quantity=item_data['quantity'],
                    price=item_data['price']
                )
                db.session.add(order_item)
        
        db.session.commit()
        
        print(f"Order created successfully: {new_order.order_id}")
        
        return jsonify({
            'success': True,
            'message': 'Order created successfully',
            'order_id': new_order.order_id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating order: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error creating order: {str(e)}'
        }), 500

@app.route('/api/orders', methods=['GET'])
def get_orders():
    try:
        # Get all orders with their items
        orders = db.session.query(Order).all()
        
        orders_data = []
        for order in orders:
            order_data = {
                'order_id': order.order_id,
                'user_id': order.user_id,
                'total': order.total,
                'status': order.status,
                'created_at': order.created_at.isoformat() if order.created_at else None,
                'items': []
            }
            
            # Get order items
            items = OrderItem.query.filter_by(order_id=order.order_id).all()
            for item in items:
                product = Product.query.get(item.product_id)
                item_data = {
                    'product_id': item.product_id,
                    'product_name': product.name if product else 'Unknown Product',
                    'quantity': item.quantity,
                    'price': item.price,
                    'seller_id': product.seller_id if product else None
                }
                order_data['items'].append(item_data)
            
            orders_data.append(order_data)
        
        return jsonify({
            'success': True,
            'orders': orders_data
        }), 200
        
    except Exception as e:
        print(f"Error fetching orders: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error fetching orders: {str(e)}'
        }), 500
'''
    
    # Find the position to insert the orders API (before the main execution block)
    insert_position = app_content.find('if __name__ == "__main__":')
    
    if insert_position == -1:
        # If no main block found, append to the end
        updated_content = app_content + orders_api_code
    else:
        # Insert before the main block
        updated_content = app_content[:insert_position] + orders_api_code + '\\n\\n' + app_content[insert_position:]
    
    # Write the updated content back to app.py
    with open('app.py', 'w') as f:
        f.write(updated_content)
    
    print("Orders API endpoints integrated into app.py successfully!")
    print("Please restart your Flask server to apply the changes.")

if __name__ == "__main__":
    integrate_orders_api()
