
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from models import db, User, SellerProfile, AdminProfile, Product, Message
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os
from app_auth import check_admin_auth, check_seller_auth

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
    return check_seller_auth()

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

@app.route('/api/logout', methods=['POST'])
def logout():
    # Clear the session
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully'})

# New Product Endpoints
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

@app.route('/api/seller/products', methods=['POST'])
def add_product():
    """Add a new product (seller only)"""
    # First check if seller is authenticated
    auth_check = check_seller_auth()
    auth_data = auth_check.get_json()
    
    if not auth_data.get('isAuthenticated'):
        return jsonify({'success': False, 'message': 'Seller not authenticated'})
    
    try:
        data = request.json
        seller_id = auth_data.get('seller_id')
        
        # Create new product
        new_product = Product(
            name=data['name'],
            description=data['description'],
            price=float(data['price']),
            stock=int(data['stock']),
            category=data['category'],
            image_url=data['image'],  # Frontend should upload image first and send URL
            seller_id=seller_id
        )
        
        db.session.add(new_product)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Product added successfully',
            'productId': new_product.product_id
        })
    
    except Exception as e:
        db.session.rollback()
        print(f"Error adding product: {str(e)}")
        return jsonify({'success': False, 'message': f'Error adding product: {str(e)}'})

@app.route('/api/upload/product-image', methods=['POST'])
def upload_product_image():
    """Upload a product image and return the URL"""
    # Check authentication first
    auth_check = check_seller_auth()
    auth_data = auth_check.get_json()
    
    if not auth_data.get('isAuthenticated'):
        return jsonify({'success': False, 'message': 'Seller not authenticated'})
    
    if 'image' not in request.files:
        return jsonify({'success': False, 'message': 'No image file provided'})
    
    try:
        file = request.files['image']
        if file.filename == '':
            return jsonify({'success': False, 'message': 'No image selected'})
        
        # Generate unique filename
        filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{file.filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Save file
        file.save(file_path)
        
        # Generate URL
        image_url = f"/static/uploads/{filename}"
        
        return jsonify({
            'success': True,
            'imageUrl': image_url
        })
    
    except Exception as e:
        print(f"Error uploading image: {str(e)}")
        return jsonify({'success': False, 'message': f'Error uploading image: {str(e)}'})

@app.route('/api/products/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    """Delete a product (seller only)"""
    # First check if seller is authenticated
    auth_check = check_seller_auth()
    auth_data = auth_check.get_json()
    
    if not auth_data.get('isAuthenticated'):
        return jsonify({'success': False, 'message': 'Seller not authenticated'})
    
    try:
        seller_id = auth_data.get('seller_id')
        product = Product.query.get(product_id)
        
        if not product:
            return jsonify({'success': False, 'message': 'Product not found'})
        
        # Verify this product belongs to the seller
        if product.seller_id != int(seller_id):
            return jsonify({'success': False, 'message': 'You do not own this product'})
        
        db.session.delete(product)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Product deleted successfully'
        })
    
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting product: {str(e)}")
        return jsonify({'success': False, 'message': f'Error deleting product: {str(e)}'})

# Message Endpoints
@app.route('/api/messages/send', methods=['POST'])
def send_message():
    """Send a message to a seller"""
    # Check if user is authenticated
    auth_check = check_auth()
    auth_data = auth_check.get_json()
    
    if not auth_data.get('isAuthenticated'):
        return jsonify({'success': False, 'message': 'User not authenticated'})
    
    try:
        data = request.json
        
        # Validate seller exists
        seller = SellerProfile.query.get(data['sellerId'])
        if not seller:
            return jsonify({'success': False, 'message': 'Seller not found'})
        
        # Create new message
        new_message = Message(
            content=data['content'],
            user_id=auth_data.get('user_id'),
            seller_id=data['sellerId'],
            product_id=data.get('productId')  # Optional
        )
        
        db.session.add(new_message)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Message sent successfully',
            'messageId': new_message.message_id
        })
    
    except Exception as e:
        db.session.rollback()
        print(f"Error sending message: {str(e)}")
        return jsonify({'success': False, 'message': f'Error sending message: {str(e)}'})

@app.route('/api/seller/messages', methods=['GET'])
def get_seller_messages():
    """Get messages for the authenticated seller"""
    # Check if seller is authenticated
    auth_check = check_seller_auth()
    auth_data = auth_check.get_json()
    
    if not auth_data.get('isAuthenticated'):
        return jsonify({'success': False, 'message': 'Seller not authenticated'})
    
    try:
        seller_id = auth_data.get('seller_id')
        messages = Message.query.filter_by(seller_id=seller_id).order_by(Message.created_at.desc()).all()
        message_list = []
        
        for msg in messages:
            # Get user info if available
            username = "Anonymous"
            if msg.user_id:
                user = User.query.get(msg.user_id)
                if user:
                    username = user.username
            
            # Get product info if available
            product_name = None
            if msg.product_id:
                product = Product.query.get(msg.product_id)
                if product:
                    product_name = product.name
            
            message_list.append({
                'id': msg.message_id,
                'content': msg.content,
                'username': username,
                'userId': msg.user_id,
                'productId': msg.product_id,
                'productName': product_name,
                'isRead': msg.is_read,
                'createdAt': msg.created_at.isoformat()
            })
        
        return jsonify({
            'success': True,
            'messages': message_list
        })
    
    except Exception as e:
        print(f"Error fetching messages: {str(e)}")
        return jsonify({'success': False, 'message': f'Error fetching messages: {str(e)}'})

@app.route('/api/seller/messages/mark-read/<message_id>', methods=['PUT'])
def mark_message_read(message_id):
    """Mark a message as read"""
    # Check if seller is authenticated
    auth_check = check_seller_auth()
    auth_data = auth_check.get_json()
    
    if not auth_data.get('isAuthenticated'):
        return jsonify({'success': False, 'message': 'Seller not authenticated'})
    
    try:
        seller_id = auth_data.get('seller_id')
        message = Message.query.get(message_id)
        
        if not message:
            return jsonify({'success': False, 'message': 'Message not found'})
        
        # Verify this message belongs to the seller
        if message.seller_id != int(seller_id):
            return jsonify({'success': False, 'message': 'This message does not belong to you'})
        
        message.is_read = True
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Message marked as read'
        })
    
    except Exception as e:
        db.session.rollback()
        print(f"Error marking message as read: {str(e)}")
        return jsonify({'success': False, 'message': f'Error marking message as read: {str(e)}'})

if __name__ == '__main__':
    app.run(debug=True)
