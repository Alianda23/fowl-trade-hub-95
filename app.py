from flask import Flask, request, jsonify, session, make_response
from flask_cors import CORS
from models import db, User, SellerProfile, AdminProfile, Product, Message, CartItem, Order, OrderItem
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os
from app_auth import check_admin_auth, check_seller_auth
from routes.mpesa import mpesa_routes
import uuid
import csv
import io

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@localhost/kukuhub'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = 'your_secret_key'  # Change this to a secure key in production

# Configure upload folder for product images
UPLOAD_FOLDER = 'static/uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

CORS(app, supports_credentials=True)
db.init_app(app)

# Register blueprints
app.register_blueprint(mpesa_routes, url_prefix='/api/mpesa')

# User registration and authentication routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    
    # Check if user already exists
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({'success': False, 'message': 'Email already registered'})
    
    try:
        # Create new buyer user
        hashed_password = generate_password_hash(data['password'])
        new_user = User(
            username=data['username'],
            email=data['email'],
            password_hash=hashed_password,
            phone_number=data.get('phone_number')
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'User registered successfully'})
    
    except Exception as e:
        db.session.rollback()
        print(f"Error during registration: {str(e)}")
        return jsonify({'success': False, 'message': f'Registration failed: {str(e)}'})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    
    # Find user (buyer) by email
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'success': False, 'message': 'Invalid credentials'})
    
    # Set session data for the user
    session['user_id'] = user.user_id
    
    return jsonify({
        'success': True, 
        'message': 'Login successful',
        'user_id': user.user_id,
        'username': user.username,
        'email': user.email
    })

@app.route('/api/check-auth', methods=['GET'])
def check_auth():
    if 'user_id' in session:
        user_id = session['user_id']
        user = db.session.get(User, user_id)  # Using modern SQLAlchemy method
        
        if user:
            return jsonify({
                'isAuthenticated': True,
                'user_id': user.user_id,
                'username': user.username,
                'email': user.email
            })
    
    return jsonify({'isAuthenticated': False})

@app.route('/api/logout', methods=['POST'])
def logout():
    # Clear the session
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully'})

# Seller routes
@app.route('/api/seller/register', methods=['POST'])
def seller_register():
    data = request.json
    
    # Check if seller already exists
    existing_seller = SellerProfile.query.filter_by(email=data['email']).first()
    if existing_seller:
        return jsonify({'success': False, 'message': 'Email already registered'})
    
    try:
        # Create new seller directly in SellerProfile
        hashed_password = generate_password_hash(data['password'])
        new_seller = SellerProfile(
            username=data['username'],
            email=data['email'],
            password_hash=hashed_password,
            business_name=data['business_name'],
            business_description=data.get('business_description'),
            phone_number=data.get('phone_number'),
            approval_status='pending'  # Default status
        )
        
        db.session.add(new_seller)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Seller registered successfully'})
    
    except Exception as e:
        db.session.rollback()
        print(f"Error during seller registration: {str(e)}")
        return jsonify({'success': False, 'message': f'Registration failed: {str(e)}'})

@app.route('/api/seller/login', methods=['POST'])
def seller_login():
    data = request.json
    
    # Find seller by email
    seller = SellerProfile.query.filter_by(email=data['email']).first()
    
    if not seller or not check_password_hash(seller.password_hash, data['password']):
        return jsonify({'success': False, 'message': 'Invalid credentials'})
    
    # Set session data for the seller
    session['seller_id'] = seller.seller_id
    session.permanent = True  # Make session permanent
    
    return jsonify({
        'success': True, 
        'message': 'Login successful',
        'seller_id': seller.seller_id,
        'username': seller.username,
        'email': seller.email,
        'business_name': seller.business_name,
        'approval_status': seller.approval_status
    })

@app.route('/api/seller/check-auth', methods=['GET'])
def seller_auth_check():
    if 'seller_id' in session:
        seller_id = session['seller_id']
        seller = db.session.get(SellerProfile, seller_id)  # Using modern SQLAlchemy method
        
        if seller:
            return jsonify({
                'isAuthenticated': True,
                'seller_id': seller.seller_id,
                'username': seller.username,
                'email': seller.email,
                'business_name': seller.business_name,
                'approval_status': seller.approval_status
            })
    
    return jsonify({'isAuthenticated': False})

# Admin routes
@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    
    # Find admin by email
    admin = AdminProfile.query.filter_by(email=data['email']).first()
    
    if not admin or not check_password_hash(admin.password_hash, data['password']):
        return jsonify({'success': False, 'message': 'Invalid admin credentials'})
    
    # Set session data for the admin
    session['admin_id'] = admin.admin_id
    
    return jsonify({
        'success': True, 
        'message': 'Admin login successful',
        'admin_id': admin.admin_id,
        'username': admin.username,
        'email': admin.email,
        'role': admin.role,
        'department': admin.department
    })

@app.route('/api/admin/check-auth', methods=['GET'])
def admin_auth_check():
    return check_admin_auth()

@app.route('/api/admin/dashboard-stats', methods=['GET'])
def admin_dashboard_stats():
    """Get dashboard statistics for admin"""
    # Check if admin is authenticated
    if 'admin_id' not in session:
        return jsonify({'success': False, 'message': 'Admin not authenticated'})
    
    try:
        # Get counts from database with detailed logging
        print("Fetching dashboard stats...")
        
        # Check database connection
        print("Checking database connection...")
        
        # Get counts with detailed logging
        total_products = Product.query.count()
        print(f"Products query result: {total_products}")
        
        total_users_buyers = User.query.count()
        print(f"Buyers count: {total_users_buyers}")
        
        total_users_sellers = SellerProfile.query.count()
        print(f"Sellers count: {total_users_sellers}")
        
        total_users = total_users_buyers + total_users_sellers
        print(f"Total users: {total_users}")
        
        total_orders = Order.query.count()
        print(f"Orders count: {total_orders}")
        
        # Also check if we can fetch some sample data
        sample_users = User.query.limit(5).all()
        print(f"Sample users found: {len(sample_users)}")
        for user in sample_users:
            print(f"User: {user.username} - {user.email}")
        
        sample_sellers = SellerProfile.query.limit(5).all()
        print(f"Sample sellers found: {len(sample_sellers)}")
        for seller in sample_sellers:
            print(f"Seller: {seller.username} - {seller.email}")
        
        sample_products = Product.query.limit(5).all()
        print(f"Sample products found: {len(sample_products)}")
        for product in sample_products:
            print(f"Product: {product.name} - Price: {product.price}")
        
        sample_orders = Order.query.limit(5).all()
        print(f"Sample orders found: {len(sample_orders)}")
        for order in sample_orders:
            print(f"Order: {order.order_id} - Total: {order.total}")
        
        print(f"Final dashboard stats - Products: {total_products}, Users: {total_users}, Orders: {total_orders}")
        
        return jsonify({
            'success': True,
            'stats': {
                'products': total_products,
                'users': total_users,
                'orders': total_orders
            }
        })
    
    except Exception as e:
        print(f"Error fetching dashboard stats: {str(e)}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        return jsonify({'success': False, 'message': f'Error fetching dashboard statistics: {str(e)}'})

@app.route('/api/admin/users', methods=['GET'])
def admin_get_users():
    """Get all users and sellers for admin"""
    # First check if admin is authenticated
    auth_check = check_admin_auth()
    auth_data = auth_check.get_json()
    
    if not auth_data.get('isAuthenticated'):
        return jsonify({'success': False, 'message': 'Admin not authenticated'})
    
    try:
        # Get all buyers (users)
        users = User.query.all()
        user_list = []
        
        for user in users:
            user_list.append({
                'user_id': user.user_id,
                'username': user.username,
                'email': user.email,
                'phone_number': user.phone_number,
                'created_at': user.created_at.isoformat()
            })
        
        # Get all sellers
        sellers = SellerProfile.query.all()
        seller_list = []
        
        for seller in sellers:
            seller_list.append({
                'seller_id': seller.seller_id,
                'username': seller.username,
                'email': seller.email,
                'business_name': seller.business_name,
                'approval_status': seller.approval_status,
                'phone_number': seller.phone_number,
                'created_at': seller.created_at.isoformat()
            })
        
        return jsonify({
            'success': True,
            'users': user_list,
            'sellers': seller_list
        })
    
    except Exception as e:
        print(f"Error fetching users: {str(e)}")
        return jsonify({'success': False, 'message': f'Error fetching users: {str(e)}'})

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

@app.route('/api/admin/orders', methods=['GET'])
def admin_get_orders():
    """Get all orders for admin"""
    # First check if admin is authenticated
    auth_check = check_admin_auth()
    auth_data = auth_check.get_json()
    
    if not auth_data.get('isAuthenticated'):
        return jsonify({'success': False, 'message': 'Admin not authenticated'})
    
    try:
        orders = Order.query.order_by(Order.created_at.desc()).all()
        order_list = []
        
        for order in orders:
            # Get user info
            user = db.session.get(User, order.user_id)  # Using modern SQLAlchemy method
            user_name = user.username if user else "Unknown User"
            user_email = user.email if user else "Unknown Email"
            
            # Get order items
            order_items = OrderItem.query.filter_by(order_id=order.order_id).all()
            items = []
            
            for item in order_items:
                product = db.session.get(Product, item.product_id)  # Using modern SQLAlchemy method
                if product:
                    items.append({
                        'id': str(product.product_id),
                        'name': product.name,
                        'price': item.price,
                        'quantity': item.quantity
                    })
            
            order_list.append({
                'id': str(order.order_id),
                'user_name': user_name,
                'user_email': user_email,
                'items': items,
                'total': order.total,
                'status': order.status,
                'created_at': order.created_at.isoformat()
            })
        
        return jsonify({
            'success': True,
            'orders': order_list
        })
    
    except Exception as e:
        print(f"Error fetching orders: {str(e)}")
        return jsonify({'success': False, 'message': f'Error fetching orders: {str(e)}'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
