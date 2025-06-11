
from flask import jsonify, request, session
from models import db, Order, OrderItem, Product
from datetime import datetime
import uuid

def create_order():
    try:
        # Check if user is authenticated
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'User not authenticated'}), 401
        
        user_id = session['user_id']
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400
        
        # Extract order data
        order_id = data.get('order_id') or str(uuid.uuid4())
        total = data.get('total', 0)
        status = data.get('status', 'Pending')
        items = data.get('items', [])
        
        if not items:
            return jsonify({'success': False, 'message': 'No items in order'}), 400
        
        print(f"Creating order for user {user_id}: {order_id}")
        
        # Create the order
        new_order = Order(
            order_id=order_id,
            user_id=user_id,
            total=total,
            status=status,
            created_at=datetime.utcnow()
        )
        
        db.session.add(new_order)
        db.session.flush()  # Get the order ID
        
        # Create order items
        for item_data in items:
            order_item = OrderItem(
                order_id=new_order.id,
                product_id=item_data.get('product_id'),
                quantity=item_data.get('quantity', 1),
                price=item_data.get('price', 0),
                name=item_data.get('name', ''),
                image_url=item_data.get('image_url', ''),
                seller_id=item_data.get('seller_id')
            )
            db.session.add(order_item)
        
        db.session.commit()
        
        print(f"Order {order_id} created successfully")
        return jsonify({
            'success': True, 
            'message': 'Order created successfully',
            'orderId': order_id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating order: {str(e)}")
        return jsonify({'success': False, 'message': f'Error creating order: {str(e)}'}), 500

def get_orders():
    try:
        # Check if user is authenticated
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'User not authenticated'}), 401
        
        user_id = session['user_id']
        print(f"Fetching orders for user: {user_id}")
        
        # Get user's orders with items
        orders = db.session.query(Order).filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()
        
        orders_data = []
        for order in orders:
            # Get order items
            order_items = db.session.query(OrderItem).filter_by(order_id=order.id).all()
            
            items_data = []
            for item in order_items:
                items_data.append({
                    'product_id': item.product_id,
                    'name': item.name,
                    'price': float(item.price),
                    'quantity': item.quantity,
                    'image_url': item.image_url,
                    'seller_id': item.seller_id
                })
            
            orders_data.append({
                'order_id': order.order_id,
                'user_id': order.user_id,
                'total': float(order.total),
                'status': order.status,
                'created_at': order.created_at.isoformat(),
                'items': items_data
            })
        
        print(f"Found {len(orders_data)} orders for user {user_id}")
        return jsonify({'success': True, 'orders': orders_data}), 200
        
    except Exception as e:
        print(f"Error fetching orders: {str(e)}")
        return jsonify({'success': False, 'message': f'Error fetching orders: {str(e)}'}), 500

def get_all_orders():
    """Get all orders for admin/seller views"""
    try:
        print("Fetching all orders")
        
        # Get all orders with items
        orders = db.session.query(Order).order_by(Order.created_at.desc()).all()
        
        orders_data = []
        for order in orders:
            # Get order items
            order_items = db.session.query(OrderItem).filter_by(order_id=order.id).all()
            
            items_data = []
            for item in order_items:
                items_data.append({
                    'product_id': item.product_id,
                    'name': item.name,
                    'price': float(item.price),
                    'quantity': item.quantity,
                    'image_url': item.image_url,
                    'seller_id': item.seller_id
                })
            
            orders_data.append({
                'order_id': order.order_id,
                'user_id': order.user_id,
                'total': float(order.total),
                'status': order.status,
                'created_at': order.created_at.isoformat(),
                'items': items_data
            })
        
        print(f"Found {len(orders_data)} total orders")
        return jsonify({'success': True, 'orders': orders_data}), 200
        
    except Exception as e:
        print(f"Error fetching all orders: {str(e)}")
        return jsonify({'success': False, 'message': f'Error fetching orders: {str(e)}'}), 500

def update_order_status(order_id):
    try:
        data = request.get_json()
        if not data or 'status' not in data:
            return jsonify({'success': False, 'message': 'Status not provided'}), 400
        
        new_status = data['status']
        print(f"Updating order {order_id} status to {new_status}")
        
        # Find the order
        order = db.session.query(Order).filter_by(order_id=order_id).first()
        if not order:
            return jsonify({'success': False, 'message': 'Order not found'}), 404
        
        # Update status
        order.status = new_status
        db.session.commit()
        
        print(f"Order {order_id} status updated successfully")
        return jsonify({'success': True, 'message': 'Order status updated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error updating order status: {str(e)}")
        return jsonify({'success': False, 'message': f'Error updating order status: {str(e)}'}), 500
