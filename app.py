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

# Configure upload folder for product images and videos
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
        user = User.query.get(user_id)
        
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
        seller = SellerProfile.query.get(seller_id)
        
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
            user = User.query.get(order.user_id)
            user_name = user.username if user else "Unknown User"
            user_email = user.email if user else "Unknown Email"
            
            # Get order items
            order_items = OrderItem.query.filter_by(order_id=order.order_id).all()
            items = []
            
            for item in order_items:
                product = Product.query.get(item.product_id)
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

@app.route('/api/admin/update-profile', methods=['PUT'])
def update_admin_profile():
    """Update admin profile information"""
    # First check if admin is authenticated
    auth_check = check_admin_auth()
    auth_data = auth_check.get_json()
    
    if not auth_data.get('isAuthenticated'):
        return jsonify({'success': False, 'message': 'Admin not authenticated'})
    
    try:
        admin_id = auth_data.get('admin_id')
        admin = AdminProfile.query.get(admin_id)
        
        if not admin:
            return jsonify({'success': False, 'message': 'Admin not found'})
        
        data = request.json
        
        # Update fields
        if 'username' in data:
            admin.username = data['username']
        if 'department' in data:
            admin.department = data['department']
        if 'phone_number' in data:
            admin.phone_number = data['phone_number']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Profile updated successfully'
        })
    
    except Exception as e:
        db.session.rollback()
        print(f"Error updating admin profile: {str(e)}")
        return jsonify({'success': False, 'message': f'Update failed: {str(e)}'})

@app.route('/api/admin/products/<product_id>', methods=['DELETE'])
def admin_delete_product(product_id):
    """Admin delete a product"""
    # First check if admin is authenticated
    auth_check = check_admin_auth()
    auth_data = auth_check.get_json()
    
    if not auth_data.get('isAuthenticated'):
        return jsonify({'success': False, 'message': 'Admin not authenticated'})
    
    try:
        product = Product.query.get(product_id)
        
        if not product:
            return jsonify({'success': False, 'message': 'Product not found'})
        
        db.session.delete(product)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Product deleted successfully by admin'
        })
    
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting product: {str(e)}")
        return jsonify({'success': False, 'message': f'Error deleting product: {str(e)}'})

# Product routes
@app.route('/api/products', methods=['GET'])
def get_products():
    """Get all products for public viewing"""
    try:
        products = Product.query.all()
        product_list = []
        
        for product in products:
            # Get seller info
            seller = SellerProfile.query.get(product.seller_id)
            seller_name = seller.business_name if seller else "Unknown Seller"
            
            product_list.append({
                'id': str(product.product_id),
                'name': product.name,
                'description': product.description,
                'price': product.price,
                'stock': product.stock,
                'category': product.category,
                'image': product.image_url,
                'video': product.video_url,  # Add video URL
                'videoUrl': product.video_url,  # Also add as videoUrl for compatibility
                'sellerId': str(product.seller_id),
                'sellerName': seller_name,
                'createdAt': product.created_at.isoformat()
            })
        
        return jsonify({
            'success': True,
            'products': product_list
        })
    
    except Exception as e:
        print(f"Error fetching products: {str(e)}")
        return jsonify({'success': False, 'message': f'Error fetching products: {str(e)}'})

@app.route('/api/products/<product_id>', methods=['GET'])
def get_product(product_id):
    """Get a specific product by ID"""
    try:
        product = Product.query.get(product_id)
        
        if not product:
            return jsonify({'success': False, 'message': 'Product not found'})
        
        # Get seller info
        seller = SellerProfile.query.get(product.seller_id)
        seller_name = seller.business_name if seller else "Unknown Seller"
        
        product_data = {
            'id': str(product.product_id),
            'name': product.name,
            'description': product.description,
            'price': product.price,
            'stock': product.stock,
            'category': product.category,
            'image': product.image_url,
            'video': product.video_url,  # Add video URL
            'videoUrl': product.video_url,  # Also add as videoUrl for compatibility
            'sellerId': str(product.seller_id),
            'sellerName': seller_name,
            'sellerEmail': seller.email if seller else None,
            'createdAt': product.created_at.isoformat()
        }
        
        return jsonify({
            'success': True,
            'product': product_data
        })
    
    except Exception as e:
        print(f"Error fetching product: {str(e)}")
        return jsonify({'success': False, 'message': f'Error fetching product: {str(e)}'})

@app.route('/api/seller/products', methods=['GET'])
def get_seller_products():
    """Get products for the authenticated seller"""
    # First check if seller is authenticated
    auth_check = check_seller_auth()
    auth_data = auth_check.get_json()
    
    if not auth_data.get('isAuthenticated'):
        return jsonify({'success': False, 'message': 'Seller not authenticated'})
    
    try:
        seller_id = auth_data.get('seller_id')
        products = Product.query.filter_by(seller_id=seller_id).all()
        product_list = []
        
        for product in products:
            product_list.append({
                'id': str(product.product_id),
                'name': product.name,
                'description': product.description,
                'price': product.price,
                'stock': product.stock,
                'category': product.category,
                'image': product.image_url,
                'video': product.video_url,  # Add video URL
                'videoUrl': product.video_url,  # Also add as videoUrl for compatibility
                'sellerId': str(product.seller_id),
                'sellerName': auth_data.get('business_name'),
                'createdAt': product.created_at.isoformat()
            })
        
        return jsonify({
            'success': True,
            'products': product_list
        })
    
    except Exception as e:
        print(f"Error fetching seller products: {str(e)}")
        return jsonify({'success': False, 'message': f'Error fetching products: {str(e)}'})

@app.route('/api/products/create', methods=['POST'])
def add_product():
    """Add a new product (seller only)"""
    # First check if seller is authenticated
    auth_check = check_seller_auth()
    auth_data = auth_check.get_json()
    
    if not auth_data.get('isAuthenticated'):
        return jsonify({'success': False, 'message': 'Seller not authenticated'})
    
    try:
        print("=== DEBUG: Starting product creation ===")
        print(f"Request files: {list(request.files.keys())}")
        print(f"Request form: {dict(request.form)}")
        
        # Check if we have form data (multipart/form-data) or JSON
        if request.form:
            name = request.form.get('name')
            description = request.form.get('description')
            price = float(request.form.get('price', 0))
            stock = int(request.form.get('stock', 0))
            category = request.form.get('category')
            seller_id = auth_data.get('seller_id')
            
            print(f"=== DEBUG: Form data extracted ===")
            print(f"Name: {name}, Price: {price}, Stock: {stock}")
            
            # Handle image upload
            image_url = None
            if 'image' in request.files:
                file = request.files['image']
                print(f"=== DEBUG: Image file ===")
                print(f"Image filename: {file.filename}")
                if file and file.filename != '':
                    # Generate unique filename
                    filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}"
                    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                    
                    print(f"Image file path: {file_path}")
                    
                    # Ensure directory exists
                    os.makedirs(os.path.dirname(file_path), exist_ok=True)
                    
                    # Save file
                    file.save(file_path)
                    print(f"Image saved successfully: {file_path}")
                    
                    # Generate URL
                    image_url = f"/static/uploads/{filename}"
                    print(f"Image URL: {image_url}")
            
            # Handle video upload
            video_url = None
            if 'video' in request.files:
                video_file = request.files['video']
                print(f"=== DEBUG: Video file ===")
                print(f"Video filename: {video_file.filename}")
                print(f"Video file object: {video_file}")
                
                if video_file and video_file.filename != '':
                    # Generate unique filename for video
                    video_filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{video_file.filename}"
                    video_file_path = os.path.join(app.config['UPLOAD_FOLDER'], video_filename)
                    
                    print(f"Video file path: {video_file_path}")
                    
                    # Ensure directory exists
                    os.makedirs(os.path.dirname(video_file_path), exist_ok=True)
                    
                    try:
                        # Save video file
                        video_file.save(video_file_path)
                        print(f"Video saved successfully: {video_file_path}")
                        
                        # Verify file was actually saved
                        if os.path.exists(video_file_path):
                            print(f"Video file exists on disk: {video_file_path}")
                            file_size = os.path.getsize(video_file_path)
                            print(f"Video file size: {file_size} bytes")
                        else:
                            print(f"ERROR: Video file was not saved to disk!")
                        
                        # Generate video URL
                        video_url = f"/static/uploads/{video_filename}"
                        print(f"Video URL: {video_url}")
                        
                    except Exception as video_save_error:
                        print(f"ERROR saving video file: {str(video_save_error)}")
                        return jsonify({'success': False, 'message': f'Error saving video file: {str(video_save_error)}'})
                else:
                    print("No video file provided or empty filename")
            else:
                print("No 'video' key in request.files")
            
            print(f"=== DEBUG: Final URLs ===")
            print(f"Image URL: {image_url}")
            print(f"Video URL: {video_url}")
            
            # Create new product
            new_product = Product(
                name=name,
                description=description,
                price=price,
                stock=stock,
                category=category,
                image_url=image_url,
                video_url=video_url,  # This should now be properly set
                seller_id=seller_id
            )
            
            print(f"=== DEBUG: Product object before save ===")
            print(f"Product video_url field: {new_product.video_url}")
            
        else:
            # Handle JSON data
            data = request.json
            seller_id = auth_data.get('seller_id')
            
            # Create new product
            new_product = Product(
                name=data['name'],
                description=data['description'],
                price=float(data['price']),
                stock=int(data['stock']),
                category=data['category'],
                image_url=data.get('image'),  # Frontend should upload image first and send URL
                video_url=data.get('video'),  # Frontend should upload video first and send URL
                seller_id=seller_id
            )
        
        db.session.add(new_product)
        db.session.commit()
        
        print(f"=== DEBUG: Product saved to database ===")
        print(f"Product ID: {new_product.product_id}")
        print(f"Product video_url in DB: {new_product.video_url}")
        
        # Fetch the product back from DB to verify
        saved_product = Product.query.get(new_product.product_id)
        print(f"=== DEBUG: Product retrieved from DB ===")
        print(f"Retrieved video_url: {saved_product.video_url}")
        
        return jsonify({
            'success': True,
            'message': 'Product added successfully',
            'productId': new_product.product_id,
            'debug': {
                'image_url': image_url,
                'video_url': video_url,
                'saved_video_url': saved_product.video_url
            }
        })
    
    except Exception as e:
        db.session.rollback()
        print(f"ERROR adding product: {str(e)}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        return jsonify({'success': False, 'message': f'Error adding product: {str(e)}'})

@app.route('/api/upload/product-video', methods=['POST'])
def upload_product_video():
    """Upload a product video and return the URL"""
    # Check authentication first
    auth_check = check_seller_auth()
    auth_data = auth_check.get_json()
    
    if not auth_data.get('isAuthenticated'):
        return jsonify({'success': False, 'message': 'Seller not authenticated'})
    
    print("=== DEBUG: Video upload endpoint called ===")
    print(f"Request files: {list(request.files.keys())}")
    
    if 'video' not in request.files:
        print("ERROR: No video file in request")
        return jsonify({'success': False, 'message': 'No video file provided'})
    
    try:
        file = request.files['video']
        print(f"Video file: {file}")
        print(f"Video filename: {file.filename}")
        
        if file.filename == '':
            return jsonify({'success': False, 'message': 'No video selected'})
        
        # Generate unique filename
        filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        print(f"Saving video to: {file_path}")
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        # Save file
        file.save(file_path)
        
        # Verify file was saved
        if os.path.exists(file_path):
            file_size = os.path.getsize(file_path)
            print(f"Video saved successfully. Size: {file_size} bytes")
        else:
            print("ERROR: Video file was not saved!")
            return jsonify({'success': False, 'message': 'Failed to save video file'})
        
        # Generate URL
        video_url = f"/static/uploads/{filename}"
        print(f"Video URL: {video_url}")
        
        return jsonify({
            'success': True,
            'videoUrl': video_url
        })
    
    except Exception as e:
        print(f"Error uploading video: {str(e)}")
        import traceback
        print(f"Full traceback: {traceback.format_exc()}")
        return jsonify({'success': False, 'message': f'Error uploading video: {str(e)}'})

# All other routes remain the same

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
