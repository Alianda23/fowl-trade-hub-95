from flask import Blueprint, request, jsonify
import requests
import base64
from datetime import datetime
import json
import socket

mpesa_routes = Blueprint('mpesa', __name__)

# M-Pesa API credentials
CONSUMER_KEY = "eUb7fiTHhwdNdiAcNgAoJlziG7sZRfnyBu6eBENXS2OqyLGh"
CONSUMER_SECRET = "LSk070XeJmvHg1OIg39Bl3QgeBCEMM3XMgrKVZDGt5S96wFsTnVJqn2kGyRAO10h"
BUSINESS_SHORT_CODE = "174379"  # Lipa Na M-Pesa shortcode
PASSKEY = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"  # Lipa Na M-Pesa passkey

# Use ngrok or a similar service for testing in development
# For production, use your actual domain
# CALLBACK_URL = "http://localhost:5000/api/mpesa/callback"  # This won't work with M-Pesa API
CALLBACK_URL = "https://webhook.site/3c1f62b5-4214-47d6-9f26-71c1f4b9c8f0"  # Use a webhook.site URL for testing

# M-Pesa API endpoints
API_BASE_URL = "https://sandbox.safaricom.co.ke"
AUTH_ENDPOINT = "/oauth/v1/generate"
STK_PUSH_ENDPOINT = "/mpesa/stkpush/v1/processrequest"

# Store transaction details in memory (in a real app, you'd use a database)
TRANSACTIONS = {}

# Add the missing utility functions
def check_internet_connection():
    """Check if there is internet connectivity"""
    try:
        # Try to connect to Google's DNS server
        socket.create_connection(("8.8.8.8", 53), timeout=3)
        return True
    except OSError:
        return False

def is_mpesa_api_reachable():
    """Check if M-Pesa API is reachable"""
    try:
        response = requests.get(f"{API_BASE_URL}/healthcheck", timeout=5)
        return response.status_code == 200
    except:
        # If we can't reach the API, just assume it's because it doesn't have a healthcheck endpoint
        # In a production app, you might want to be more careful here
        return True

@mpesa_routes.route('/stkpush', methods=['POST'])
def initiate_stk_push():
    try:
        data = request.json
        phone_number = data.get('phoneNumber')
        amount = data.get('amount', 1)  # Default to 1 if not provided
        
        if not phone_number:
            return jsonify({
                'success': False,
                'message': 'Phone number is required'
            }), 400
        
        # Check internet connectivity first
        if not check_internet_connection():
            return jsonify({
                'success': False,
                'message': 'No internet connection. Please check your network and try again.'
            }), 503
        
        # Check if M-Pesa API is reachable
        if not is_mpesa_api_reachable():
            return jsonify({
                'success': False,
                'message': 'Unable to reach M-Pesa API. Please try again later.'
            }), 503
        
        # Get access token
        access_token_result = get_access_token()
        if 'error' in access_token_result:
            return jsonify({
                'success': False,
                'message': 'Failed to authenticate with M-Pesa',
                'details': access_token_result['error']
            }), 500
        
        access_token = access_token_result['access_token']
        
        # Prepare timestamp
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        
        # Generate password - format: BusinessShortCode+Passkey+Timestamp
        password = base64.b64encode(f"{BUSINESS_SHORT_CODE}{PASSKEY}{timestamp}".encode()).decode('utf-8')
        
        # Prepare STK push request
        stk_request = {
            "BusinessShortCode": BUSINESS_SHORT_CODE,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": amount,
            "PartyA": phone_number,
            "PartyB": BUSINESS_SHORT_CODE,
            "PhoneNumber": phone_number,
            "CallBackURL": CALLBACK_URL,
            "AccountReference": "KukuHub",
            "TransactionDesc": "Payment for products"
        }
        
        print(f"Sending M-Pesa request with callback URL: {CALLBACK_URL}")
        
        # Make request to M-Pesa API
        try:
            response = requests.post(
                f"{API_BASE_URL}{STK_PUSH_ENDPOINT}",
                json=stk_request,
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json"
                },
                timeout=30  # Add timeout to prevent indefinite waiting
            )
            
            print(f"M-Pesa API Response Status: {response.status_code}")
            print(f"M-Pesa API Response: {response.text}")
            
            if response.status_code != 200:
                return jsonify({
                    'success': False,
                    'message': f'M-Pesa API returned status code {response.status_code}',
                    'details': response.text
                }), 400
                
            mpesa_response = response.json()
            
            if 'ResponseCode' in mpesa_response and mpesa_response['ResponseCode'] == '0':
                # Success - store transaction
                checkout_request_id = mpesa_response['CheckoutRequestID']
                TRANSACTIONS[checkout_request_id] = {
                    'amount': amount,
                    'phone_number': phone_number,
                    'status': 'pending',
                    'timestamp': datetime.now().isoformat()
                }
                
                return jsonify({
                    'success': True,
                    'message': 'STK push sent successfully',
                    'checkoutRequestID': checkout_request_id
                })
            else:
                return jsonify({
                    'success': False,
                    'message': 'Failed to initiate STK push',
                    'details': mpesa_response
                }), 400
        except requests.exceptions.RequestException as e:
            return jsonify({
                'success': False,
                'message': 'Error sending STK push request',
                'details': str(e)
            }), 500
            
    except Exception as e:
        print(f"STK push error: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }), 500

@mpesa_routes.route('/callback', methods=['POST'])
def mpesa_callback():
    """Handle M-Pesa callback after STK push"""
    try:
        callback_data = request.json
        print(f"M-Pesa Callback Data: {json.dumps(callback_data, indent=2)}")
        
        # Extract relevant information from the callback data
        checkout_request_id = callback_data.get('Body', {}).get('stkCallback', {}).get('CheckoutRequestID')
        result_code = callback_data.get('Body', {}).get('stkCallback', {}).get('ResultCode')
        result_desc = callback_data.get('Body', {}).get('stkCallback', {}).get('ResultDesc')
        
        # Log the callback data and result
        print(f"Callback received for CheckoutRequestID: {checkout_request_id}, ResultCode: {result_code}, ResultDesc: {result_desc}")
        
        # Check if the transaction exists
        if checkout_request_id in TRANSACTIONS:
            # Update transaction status based on the callback
            if result_code == 0:
                TRANSACTIONS[checkout_request_id]['status'] = 'completed'
                print(f"Transaction {checkout_request_id} completed successfully.")
            else:
                TRANSACTIONS[checkout_request_id]['status'] = 'failed'
                print(f"Transaction {checkout_request_id} failed. Result Description: {result_desc}")
            
            # You can add more detailed handling here, such as updating a database
            # or sending notifications to users.
            
            return jsonify({'success': True, 'message': 'Callback processed successfully'}), 200
        else:
            print(f"Transaction with CheckoutRequestID {checkout_request_id} not found.")
            return jsonify({'success': False, 'message': 'Transaction not found'}), 404
    
    except Exception as e:
        print(f"Callback processing error: {str(e)}")
        return jsonify({'success': False, 'message': f'An error occurred: {str(e)}'}), 500

@mpesa_routes.route('/status/<checkout_request_id>', methods=['GET'])
def check_payment_status(checkout_request_id):
    """Check the status of an M-Pesa payment"""
    try:
        if checkout_request_id in TRANSACTIONS:
            transaction = TRANSACTIONS[checkout_request_id]
            return jsonify({
                'success': True,
                'status': transaction['status'],
                'message': f'Transaction status is {transaction["status"]}'
            })
        else:
            return jsonify({
                'success': False,
                'status': 'not_found',
                'message': 'Transaction not found'
            }), 404
    except Exception as e:
        print(f"Status check error: {str(e)}")
        return jsonify({
            'success': False,
            'status': 'error',
            'message': f'An error occurred: {str(e)}'
        }), 500

def get_access_token():
    """Get M-Pesa API access token"""
    try:
        credentials = base64.b64encode(f"{CONSUMER_KEY}:{CONSUMER_SECRET}".encode()).decode('utf-8')
        
        response = requests.get(
            f"{API_BASE_URL}{AUTH_ENDPOINT}?grant_type=client_credentials",
            headers={
                "Authorization": f"Basic {credentials}"
            },
            timeout=30  # Add timeout to prevent indefinite waiting
        )
        
        if response.status_code != 200:
            return {
                'error': f"API returned status code {response.status_code}: {response.text}"
            }
            
        data = response.json()
        if 'access_token' not in data:
            return {
                'error': f"No access token in response: {data}"
            }
            
        return {'access_token': data.get('access_token')}
    except requests.exceptions.ConnectionError as e:
        print(f"Connection error: {str(e)}")
        return {'error': f"Connection error: {str(e)}"}
    except requests.exceptions.Timeout as e:
        print(f"Request timed out: {str(e)}")
        return {'error': f"Request timed out: {str(e)}"}
    except requests.exceptions.RequestException as e:
        print(f"Error getting access token: {str(e)}")
        return {'error': f"Request error: {str(e)}"}
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return {'error': f"Unexpected error: {str(e)}"}
