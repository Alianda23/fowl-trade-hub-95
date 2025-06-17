
from flask import Flask, request, jsonify
from models import db, Order, OrderItem, Product, User
from datetime import datetime
import uuid

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/kukuhub'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

def add_orders_api_to_app(app):
    """Add orders API endpoints to the Flask app"""
    
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

if __name__ == "__main__":
    with app.app_context():
        # Test the endpoints
        print("Orders API endpoints created successfully!")
