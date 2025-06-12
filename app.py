
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Product, SellerProfile, AdminProfile, Message, CartItem, Order, OrderItem
from app_auth import check_auth, check_seller_auth, check_admin_auth

# Create Flask app
app = Flask(__name__)

# Configure Flask app
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'mysql+pymysql://root:@localhost/kukuhub')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.permanent_session_lifetime = False

# Initialize extensions
db.init_app(app)
CORS(app, supports_credentials=True, origins=["https://2bd66808-6b81-4c9b-9b94-93ebefb9b96b.lovableproject.com"])

# Basic route for testing
@app.route('/')
def index():
    return jsonify({'message': 'KukuHub API is running!'})

# Authentication routes
@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'success': False, 'message': 'Email and password required'})
        
        # Check if user exists
        user = User.query.filter_by(email=email).first()
        
        if user and check_password_hash(user.password_hash, password):
            session['user_id'] = user.user_id
            return jsonify({
                'success': True,
                'message': 'Login successful',
                'user': {
                    'id': user.user_id,
                    'username': user.username,
                    'email': user.email
                }
            })
        else:
            return jsonify({'success': False, 'message': 'Invalid email or password'})
            
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'success': False, 'message': 'Login failed'})

@app.route('/api/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        phone_number = data.get('phone_number')
        
        if not all([username, email, password]):
            return jsonify({'success': False, 'message': 'Username, email and password required'})
        
        # Check if user already exists
        if User.query.filter_by(email=email).first():
            return jsonify({'success': False, 'message': 'Email already registered'})
        
        # Create new user
        password_hash = generate_password_hash(password)
        new_user = User(
            username=username,
            email=email,
            password_hash=password_hash,
            phone_number=phone_number
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'User created successfully'})
        
    except Exception as e:
        db.session.rollback()
        print(f"Signup error: {str(e)}")
        return jsonify({'success': False, 'message': 'Registration failed'})

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'success': True, 'message': 'Logged out successfully'})

@app.route('/api/auth/check', methods=['GET'])
def check_authentication():
    return check_auth()

# Products routes
@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        products = Product.query.all()
        
        products_list = []
        for product in products:
            seller = SellerProfile.query.get(product.seller_id)
            products_list.append({
                'id': str(product.product_id),
                'name': product.name,
                'description': product.description,
                'price': product.price,
                'stock': product.stock,
                'category': product.category,
                'image': product.image_url,
                'sellerId': str(product.seller_id),
                'sellerName': seller.business_name if seller else 'Unknown Seller'
            })
        
        return jsonify({'success': True, 'products': products_list})
        
    except Exception as e:
        print(f"Error fetching products: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch products'})

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

# ... keep existing code (cart operations, orders, etc.)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)
