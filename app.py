"""
Smart Inventory Management System - Main Application
"""
from flask import Flask, request, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required
from backend.config import Config
from database.database import get_db_connection, init_db
from backend.auth import register_user, login_user, get_current_user, refresh_token, change_user_role, change_password
from backend.inventory import (create_product, get_all_products, get_product, update_product, 
                               delete_product, update_stock, get_stock_movements, 
                               get_categories, get_suppliers)
import os

# Initialize Flask app
app = Flask(__name__, static_folder='frontend', static_url_path='')
app.config.from_object(Config)

# Initialize extensions
CORS(app)
jwt = JWTManager(app)

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

# Product/Inventory Routes - Milestone 2
@app.route('/api/products', methods=['GET'])
@jwt_required()
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
