from flask import Flask, request, jsonify, session
from flask_cors import CORS
from models import db, User, SellerProfile, AdminProfile, Product, Message, CartItem, Order, OrderItem
from app_auth import check_auth, check_seller_auth, check_admin_auth
import os
from werkzeug.security import check_password_hash, generate_password_hash

# Initialize Flask app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/kukuhub'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key-here'  # Change this to a secure secret key
app.config['UPLOAD_FOLDER'] = 'static/uploads'

# Initialize extensions
db.init_app(app)
CORS(app, supports_credentials=True)

# Authentication routes
@app.route('/api/auth/check', methods=['GET'])
def check_auth_route():
    return check_auth()

@app.route('/api/auth/seller/check', methods=['GET'])
def check_seller_auth_route():
    return check_seller_auth()

@app.route('/api/auth/admin/check', methods=['GET'])
def check_admin_auth_route():
    return check_admin_auth()

# User authentication routes
@app.route('/api/login', methods=['POST'])
def login():
    """Handle user login"""
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'success': False, 'message': 'Email and password are required'})
        
        # Find user by email
        user = User.query.filter_by(email=email).first()
        
        if user and check_password_hash(user.password, password):
            session['user_id'] = user.user_id
            return jsonify({
                'success': True,
                'message': 'Login successful',
                'user_id': user.user_id,
                'username': user.username,
                'email': user.email
            })
        else:
            return jsonify({'success': False, 'message': 'Invalid email or password'})
    
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'success': False, 'message': f'Login error: {str(e)}'})

@app.route('/api/logout', methods=['POST'])
def logout():
    """Handle user logout"""
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully'})

# Seller authentication routes
@app.route('/api/seller/login', methods=['POST'])
def seller_login():
    """Handle seller login"""
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'success': False, 'message': 'Email and password are required'})
        
        # Find seller by email
        seller = SellerProfile.query.filter_by(email=email).first()
        
        if seller and check_password_hash(seller.password, password):
            session['seller_id'] = seller.seller_id
            return jsonify({
                'success': True,
                'message': 'Login successful',
                'seller_id': seller.seller_id,
                'username': seller.username,
                'email': seller.email,
                'business_name': seller.business_name
            })
        else:
            return jsonify({'success': False, 'message': 'Invalid email or password'})
    
    except Exception as e:
        print(f"Seller login error: {str(e)}")
        return jsonify({'success': False, 'message': f'Seller login error: {str(e)}'})

@app.route('/api/seller/check-auth', methods=['GET'])
def seller_check_auth():
    """Check if seller is authenticated"""
    return check_seller_auth()

@app.route('/api/seller/register', methods=['POST'])
def seller_register():
    """Handle seller registration"""
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        username = data.get('username')
        business_name = data.get('businessName')
        business_description = data.get('businessDescription')
        phone_number = data.get('phoneNumber')
        
        if not all([email, password, username, business_name]):
            return jsonify({'success': False, 'message': 'All required fields must be filled'})
        
        # Check if seller already exists
        existing_seller = SellerProfile.query.filter_by(email=email).first()
        if existing_seller:
            return jsonify({'success': False, 'message': 'Seller with this email already exists'})
        
        # Create new seller
        hashed_password = generate_password_hash(password)
        new_seller = SellerProfile(
            username=username,
            email=email,
            password=hashed_password,
            business_name=business_name,
            business_description=business_description,
            phone_number=phone_number,
            approval_status='pending'
        )
        
        db.session.add(new_seller)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Seller registration successful',
            'seller_id': new_seller.seller_id
        })
    
    except Exception as e:
        db.session.rollback()
        print(f"Seller registration error: {str(e)}")
        return jsonify({'success': False, 'message': f'Registration error: {str(e)}'})

# Admin authentication routes
@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    """Handle admin login"""
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'success': False, 'message': 'Email and password are required'})
        
        # Find admin by email
        admin = AdminProfile.query.filter_by(email=email).first()
        
        if admin and check_password_hash(admin.password, password):
            session['admin_id'] = admin.admin_id
            return jsonify({
                'success': True,
                'message': 'Login successful',
                'admin_id': admin.admin_id,
                'username': admin.username,
                'email': admin.email,
                'role': admin.role,
                'department': admin.department
            })
        else:
            return jsonify({'success': False, 'message': 'Invalid admin credentials'})
    
    except Exception as e:
        print(f"Admin login error: {str(e)}")
        return jsonify({'success': False, 'message': f'Admin login error: {str(e)}'})

@app.route('/api/admin/check-auth', methods=['GET'])
def admin_check_auth():
    """Check if admin is authenticated"""
    return check_admin_auth()

# Product routes
@app.route('/api/products', methods=['GET'])
def get_products():
    """Get all products"""
    try:
        products = Product.query.all()
        products_list = []
        
        for product in products:
            products_list.append({
                'product_id': product.product_id,
                'name': product.name,
                'description': product.description,
                'price': product.price,
                'image_url': product.image_url,
                'category': product.category,
                'seller_id': product.seller_id,
                'stock_quantity': product.stock_quantity
            })
        
        return jsonify({'success': True, 'products': products_list})
    
    except Exception as e:
        print(f"Error fetching products: {str(e)}")
        return jsonify({'success': False, 'message': f'Error fetching products: {str(e)}'})

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

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)
