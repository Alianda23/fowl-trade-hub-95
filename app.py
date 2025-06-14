from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime

app = Flask(__name__)
CORS(app, supports_credentials=True, origins='http://localhost:3000')
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True

DATABASE = 'database.db'

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    db = get_db_connection()
    with open('schema.sql', 'r') as f:
        db.cursor().executescript(f.read())
    db.commit()
    db.close()

if not os.path.exists(DATABASE):
    init_db()

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data['username']
    email = data['email']
    password = data['password']
    user_type = data['userType']

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("INSERT INTO users (username, email, password, user_type, created_at) VALUES (?, ?, ?, ?, ?)",
                       (username, email, password, user_type, datetime.now()))
        conn.commit()
        conn.close()

        return jsonify({'success': True, 'message': 'User registered successfully'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data['email']
    password = data['password']

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM users WHERE email = ? AND password = ?", (email, password))
        user = cursor.fetchone()
        conn.close()

        if user:
            # Convert the sqlite3.Row object to a dictionary
            user_dict = dict(user)
            return jsonify({'success': True, 'message': 'Login successful', 'user': user_dict})
        else:
            return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/logout', methods=['POST'])
def logout():
    return jsonify({'success': True, 'message': 'Logged out successfully'})

@app.route('/api/admin/check-auth', methods=['GET'])
def check_admin_auth():
    # Placeholder for admin authentication check
    # In a real application, you would verify the admin's session or token
    return jsonify({'isAuthenticated': True, 'email': 'admin@example.com'})

@app.route('/api/admin/dashboard-stats', methods=['GET'])
def get_dashboard_stats():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get total users count
        cursor.execute("SELECT COUNT(*) FROM users")
        total_users = cursor.fetchone()[0]
        
        # Get total products count  
        cursor.execute("SELECT COUNT(*) FROM products")
        total_products = cursor.fetchone()[0]
        
        # Get total orders count
        cursor.execute("SELECT COUNT(*) FROM orders")
        total_orders = cursor.fetchone()[0]
        
        # Get recent activities (last 10 activities)
        recent_activities = []
        
        # Get recent seller registrations
        cursor.execute("""
            SELECT username, created_at FROM users 
            WHERE user_type = 'seller' 
            ORDER BY created_at DESC 
            LIMIT 3
        """)
        recent_sellers = cursor.fetchall()
        
        for seller in recent_sellers:
            username, created_at = seller
            recent_activities.append({
                'type': 'seller_registration',
                'description': f'New seller registration: {username}',
                'timestamp': created_at
            })
        
        # Get recent orders
        cursor.execute("""
            SELECT total_amount, created_at FROM orders 
            ORDER BY created_at DESC 
            LIMIT 3
        """)
        recent_orders = cursor.fetchall()
        
        for order in recent_orders:
            amount, created_at = order
            recent_activities.append({
                'type': 'order',
                'description': f'Large order processed: KShs {amount:,.0f}',
                'timestamp': created_at
            })
        
        # Sort activities by timestamp
        recent_activities.sort(key=lambda x: x['timestamp'], reverse=True)
        recent_activities = recent_activities[:5]  # Keep only top 5
        
        conn.close()
        
        return jsonify({
            'success': True,
            'stats': {
                'total_users': total_users,
                'total_products': total_products,
                'total_orders': total_orders
            },
            'recent_activities': recent_activities
        })
        
    except Exception as e:
        print(f"Error fetching dashboard stats: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
