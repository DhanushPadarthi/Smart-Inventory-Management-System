"""
Smart Inventory Management System - Main Application
"""
from flask import Flask, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from database.database import get_db_connection, init_db
from backend.auth import register_user, login_user, get_current_user, refresh_token

# Initialize Flask app
app = Flask(__name__)
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

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return {'status': 'ok', 'message': 'Server is running'}, 200

@app.route('/')
def index():
    """Root endpoint"""
    return {
        'message': 'Smart Inventory Management System API',
        'version': '1.0.0',
        'endpoints': {
            'auth': {
                'register': '/api/auth/register [POST]',
                'login': '/api/auth/login [POST]',
                'me': '/api/auth/me [GET]',
                'refresh': '/api/auth/refresh [POST]'
            }
        }
    }, 200

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
    
    # Uncomment the line below to initialize database on first run
    # init_db()
    
    print("Server starting on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
