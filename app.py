"""
Smart Inventory Management System - Main Application
"""
from flask import Flask, request, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from backend.config import Config
from database.database import get_db_connection, init_db
from backend.auth import register_user, login_user, get_current_user, refresh_token, change_user_role
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
def me():
    """Get current user"""
    return get_current_user(get_db())

@app.route('/api/auth/refresh', methods=['POST'])
def refresh():
    """Refresh access token"""
    return refresh_token()

@app.route('/api/auth/change-role', methods=['PUT'])
def change_role():
    """Change user role (Admin only)"""
    return change_user_role(get_db())

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
