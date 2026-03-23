"""
Smart Inventory Management System - Main Application
"""
from flask import Flask, request, send_from_directory, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required
from backend.config import Config
from database.database import get_db_connection, init_db
from backend.reporting import generate_inventory_report, export_inventory_csv, get_admin_analytics
from backend.dashboard import get_dashboard_stats
from backend.orders import create_order, get_user_orders, get_all_orders_admin, update_order_status
from backend.auth import (register_user, login_user, get_current_user, 
                          refresh_token, change_user_role, change_password,
                          get_all_users, delete_user, update_profile, get_user_stats)
from backend.alerts import get_active_alerts, acknowledge_alert, get_alert_history, create_custom_alert
from backend.inventory import (get_all_products, create_product, get_product, update_product,
                               delete_product, update_stock, get_stock_movements, get_categories, get_suppliers)
from backend.transactions import get_all_transactions, get_transaction, create_transaction
import os

# Initialize Flask app
app = Flask(__name__, static_folder='frontend', static_url_path='')
app.config.from_object(Config)

# Initialize extensions
CORS(app, resources={r"/api/*": {"origins": ["http://127.0.0.1:5500", "http://localhost:5500", "http://localhost:5000"]}}, supports_credentials=True)
jwt = JWTManager(app)

# JWT error handlers — return clean JSON instead of default HTML
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'error': 'Token has expired. Please log in again.', 'token_expired': True}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({'error': 'Invalid token. Please log in again.', 'token_invalid': True}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({'error': 'Authentication required.', 'token_missing': True}), 401

# Database connection
db = None

def get_db():
    """Get database connection"""
    global db
    if db is None:
        db = get_db_connection()
    return db

# Serve frontend files
@app.route('/')
def index():
    """Serve login page"""
    return send_from_directory('frontend', 'login.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files"""
    if os.path.exists(os.path.join('frontend', path)):
        return send_from_directory('frontend', path)
    return send_from_directory('frontend', 'login.html')

# Authentication Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    return register_user(get_db())

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user"""
    return login_user(get_db())

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def me():
    """Get current user"""
    return get_current_user(get_db())

@app.route('/api/auth/refresh', methods=['POST'])
def refresh():
    """Refresh access token"""
    return refresh_token()

@app.route('/api/auth/change-role', methods=['PUT'])
@jwt_required()
def change_role():
    """Change user role (Admin only)"""
    return change_user_role(get_db())

@app.route('/api/auth/change-password', methods=['PUT'])
@jwt_required()
def password_change():
    """Change user password"""
    return change_password(get_db())

@app.route('/api/auth/users', methods=['GET'])
@jwt_required()
def users_list():
    """Get all users (Admin only)"""
    return get_all_users(get_db())

@app.route('/api/auth/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def user_delete(user_id):
    """Delete a user (Admin only)"""
    return delete_user(get_db(), user_id)

@app.route('/api/auth/profile', methods=['PUT'])
@jwt_required()
def profile_update():
    """Update current user profile"""
    return update_profile(get_db())

@app.route('/api/auth/profile/stats', methods=['GET'])
@jwt_required()
def profile_stats():
    """Get user profile stats"""
    return get_user_stats(get_db())

# Product/Inventory Routes - Milestone 2
@app.route('/api/products', methods=['GET'])
@jwt_required(optional=True)
def products_list():
    """Get all products"""
    return get_all_products(get_db())

@app.route('/api/products', methods=['POST'])
@jwt_required()
def products_create():
    """Create a new product"""
    return create_product(get_db())

@app.route('/api/products/<int:product_id>', methods=['GET'])
@jwt_required()
def products_get(product_id):
    """Get a single product"""
    return get_product(get_db(), product_id)

@app.route('/api/products/<int:product_id>', methods=['PUT'])
@jwt_required()
def products_update(product_id):
    """Update a product"""
    return update_product(get_db(), product_id)

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
@jwt_required()
def products_delete(product_id):
    """Delete a product"""
    return delete_product(get_db(), product_id)

@app.route('/api/products/<int:product_id>/stock', methods=['PUT'])
@jwt_required()
def products_stock_update(product_id):
    """Update product stock"""
    return update_stock(get_db(), product_id)

@app.route('/api/products/<int:product_id>/movements', methods=['GET'])
@jwt_required()
def products_movements(product_id):
    """Get stock movements for a product"""
    return get_stock_movements(get_db(), product_id)

@app.route('/api/categories', methods=['GET'])
@jwt_required()
def categories_list():
    """Get all categories"""
    return get_categories(get_db())

@app.route('/api/suppliers', methods=['GET'])
@jwt_required()
def suppliers_list():
    """Get all suppliers"""
    return get_suppliers(get_db())

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return {'status': 'ok', 'message': 'Server is running'}, 200

# Alerts Routes
@app.route('/api/alerts', methods=['GET'])
@jwt_required()
def alerts_list():
    return get_active_alerts(get_db())

@app.route('/api/alerts/<int:alert_id>/acknowledge', methods=['PUT'])
@jwt_required()
def alerts_acknowledge(alert_id):
    return acknowledge_alert(get_db(), alert_id)

@app.route('/api/alerts/history', methods=['GET'])
@jwt_required()
def alerts_history():
    return get_alert_history(get_db())

@app.route('/api/alerts/custom', methods=['POST'])
@jwt_required()
def alerts_custom_create():
    """Create custom broadcast alert (Admin only)"""
    return create_custom_alert(get_db())

# Transactions Routes
@app.route('/api/transactions', methods=['GET'])
@jwt_required()
def transactions_list():
    return get_all_transactions(get_db())

@app.route('/api/transactions/<int:transaction_id>', methods=['GET'])
@jwt_required()
def transactions_get(transaction_id):
    return get_transaction(get_db(), transaction_id)

@app.route('/api/transactions', methods=['POST'])
@jwt_required()
def transactions_create():
    return create_transaction(get_db())

# Reporting Routes
@app.route('/api/reports/inventory', methods=['GET'])
@jwt_required()
def reports_inventory():
    return generate_inventory_report(get_db())

@app.route('/api/reports/export', methods=['GET'])
@jwt_required()
def reports_export():
    return export_inventory_csv(get_db())

@app.route('/api/stats', methods=['GET'])
@jwt_required()
def stats_dashboard():
    """Get dashboard statistics"""
    return get_dashboard_stats(get_db())

@app.route('/api/orders', methods=['POST'])
@jwt_required()
def orders_create():
    """Create a new order"""
    return create_order(get_db())

@app.route('/api/orders', methods=['GET'])
@jwt_required()
def orders_user_list():
    """Get orders for current user"""
    return get_user_orders(get_db())

@app.route('/api/admin/orders', methods=['GET'])
@jwt_required()
def admin_orders_list():
    """Get all orders (Admin only)"""
    return get_all_orders_admin(get_db())

@app.route('/api/admin/orders/<int:order_id>/status', methods=['PUT'])
@jwt_required()
def admin_order_status_update(order_id):
    """Update order status (Admin only)"""
    return update_order_status(get_db(), order_id)

@app.route('/api/admin/analytics', methods=['GET'])
@jwt_required()
def admin_analytics():
    """Get advanced admin analytics"""
    return get_admin_analytics(get_db())

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return {'error': 'Endpoint not found'}, 404

@app.errorhandler(500)
def internal_error(error):
    return {'error': 'Internal server error'}, 500

if __name__ == '__main__':
    # Initialize database on first run
    print("Starting Smart Inventory Management System...")
    print("Initializing database...")
    
    # Initialize database
    init_db()
    
    print("Server starting on http://localhost:5000")
    print("Open http://localhost:5000 in your browser")
    app.run(debug=True, host='0.0.0.0', port=5000)
