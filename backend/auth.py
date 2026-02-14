"""
Authentication module for user registration and login
"""
import bcrypt
from flask import jsonify, request
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from datetime import datetime
import re

def hash_password(password):
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password, hashed_password):
    """Verify a password against its hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """
    Validate password strength
    - At least 8 characters
    - Contains uppercase and lowercase
    - Contains at least one digit
    - Contains at least one special character
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r'\d', password):
        return False, "Password must contain at least one digit"
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Password must contain at least one special character"
    
    return True, "Password is valid"

def register_user(db_connection):
    """Register a new user (admin or employee)"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['username', 'email', 'password', 'role', 'first_name', 'last_name']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400
        
        username = data['username'].strip()
        email = data['email'].strip().lower()
        password = data['password']
        role = data['role'].lower()
        first_name = data['first_name'].strip()
        last_name = data['last_name'].strip()
        phone = data.get('phone', '').strip()
        
        # Validate role
        if role not in ['admin', 'employee']:
            return jsonify({'error': 'Role must be either admin or employee'}), 400
        
        # Validate email format
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate password strength
        is_valid, message = validate_password(password)
        if not is_valid:
            return jsonify({'error': message}), 400
        
        # Validate username length
        if len(username) < 3:
            return jsonify({'error': 'Username must be at least 3 characters long'}), 400
        
        # Hash the password
        password_hash = hash_password(password)
        
        cursor = db_connection.cursor()
        
        # Check if using SQLite or MySQL
        from backend.config import Config
        use_sqlite = Config.USE_SQLITE
        
        # Check if username already exists
        if use_sqlite:
            cursor.execute("SELECT user_id FROM users WHERE username = ?", (username,))
        else:
            cursor.execute("SELECT user_id FROM users WHERE username = %s", (username,))
        
        if cursor.fetchone():
            cursor.close()
            return jsonify({'error': 'Username already exists'}), 409
        
        # Check if email already exists
        if use_sqlite:
            cursor.execute("SELECT user_id FROM users WHERE email = ?", (email,))
        else:
            cursor.execute("SELECT user_id FROM users WHERE email = %s", (email,))
        
        if cursor.fetchone():
            cursor.close()
            return jsonify({'error': 'Email already exists'}), 409
        
        # Get created_by from JWT if available (admin creating employee)
        created_by = None
        try:
            from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
            verify_jwt_in_request(optional=True)
            identity = get_jwt_identity()
            if identity:
                created_by = identity.get('user_id')
        except:
            pass
        
        # Insert new user
        if use_sqlite:
            query = """
                INSERT INTO users (username, email, password_hash, role, first_name, last_name, phone, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """
        else:
            query = """
                INSERT INTO users (username, email, password_hash, role, first_name, last_name, phone, created_by)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """
        
        cursor.execute(query, (username, email, password_hash, role, first_name, last_name, phone, created_by))
        db_connection.commit()
        
        user_id = cursor.lastrowid
        cursor.close()
        
        return jsonify({
            'message': 'User registered successfully',
            'user': {
                'user_id': user_id,
                'username': username,
                'email': email,
                'role': role,
                'first_name': first_name,
                'last_name': last_name
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

def login_user(db_connection):
    """Login user and return JWT token"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        email = data['email'].strip().lower()
        password = data['password']
        
        # Check if using SQLite or MySQL
        from backend.config import Config
        use_sqlite = Config.USE_SQLITE
        
        cursor = db_connection.cursor()
        
        # Get user by email
        if use_sqlite:
            query = """
                SELECT user_id, username, email, password_hash, role, first_name, last_name, is_active
                FROM users
                WHERE email = ?
            """
        else:
            query = """
                SELECT user_id, username, email, password_hash, role, first_name, last_name, is_active
                FROM users
                WHERE email = %s
            """
        
        cursor.execute(query, (email,))
        row = cursor.fetchone()
        
        if not row:
            cursor.close()
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Convert to dict if SQLite
        if use_sqlite:
            from database.database import dict_from_row
            user = dict_from_row(row)
        else:
            user = row
        
        # Check if user is active
        if not user['is_active']:
            cursor.close()
            return jsonify({'error': 'Account is inactive. Please contact administrator'}), 403
        
        # Verify password
        if not verify_password(password, user['password_hash']):
            cursor.close()
            return jsonify({'error': 'Invalid username or password'}), 401
        
        # Update last login timestamp
        if use_sqlite:
            cursor.execute("UPDATE users SET last_login = ? WHERE user_id = ?", 
                          (datetime.now(), user['user_id']))
        else:
            cursor.execute("UPDATE users SET last_login = %s WHERE user_id = %s", 
                          (datetime.now(), user['user_id']))
        
        db_connection.commit()
        cursor.close()
        
        # Create JWT tokens
        identity = {
            'user_id': user['user_id'],
            'username': user['username'],
            'role': user['role']
        }
        
        access_token = create_access_token(identity=identity)
        refresh_token = create_refresh_token(identity=identity)
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': {
                'user_id': user['user_id'],
                'username': user['username'],
                'email': user['email'],
                'role': user['role'],
                'first_name': user['first_name'],
                'last_name': user['last_name']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Login failed: {str(e)}'}), 500

@jwt_required()
def get_current_user(db_connection):
    """Get current logged-in user details"""
    try:
        identity = get_jwt_identity()
        user_id = identity['user_id']
        
        # Check if using SQLite or MySQL
        from backend.config import Config
        use_sqlite = Config.USE_SQLITE
        
        cursor = db_connection.cursor()
        
        if use_sqlite:
            query = """
                SELECT user_id, username, email, role, first_name, last_name, phone, created_at, last_login
                FROM users
                WHERE user_id = ? AND is_active = 1
            """
        else:
            query = """
                SELECT user_id, username, email, role, first_name, last_name, phone, created_at, last_login
                FROM users
                WHERE user_id = %s AND is_active = TRUE
            """
        
        cursor.execute(query, (user_id,))
        row = cursor.fetchone()
        cursor.close()
        
        if not row:
            return jsonify({'error': 'User not found'}), 404
        
        # Convert to dict if SQLite
        if use_sqlite:
            from database.database import dict_from_row
            user = dict_from_row(row)
        else:
            user = row
        
        return jsonify({'user': user}), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get user: {str(e)}'}), 500

@jwt_required(refresh=True)
def refresh_token():
    """Refresh access token using refresh token"""
    try:
        identity = get_jwt_identity()
        access_token = create_access_token(identity=identity)
        
        return jsonify({
            'access_token': access_token
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Token refresh failed: {str(e)}'}), 500

def change_user_role(db_connection):
    """Change user role (Admin only)"""
    try:
        # Get current user from JWT
        identity = get_jwt_identity()
        current_user_role = identity.get('role')
        
        # Only admins can change roles
        if current_user_role != 'admin':
            return jsonify({'error': 'Unauthorized. Admin access required'}), 403
        
        data = request.get_json()
        
        # Validate required fields
        if not data.get('user_id') or not data.get('new_role'):
            return jsonify({'error': 'user_id and new_role are required'}), 400
        
        user_id = data['user_id']
        new_role = data['new_role'].lower()
        
        # Validate role
        if new_role not in ['admin', 'employee']:
            return jsonify({'error': 'Role must be either admin or employee'}), 400
        
        # Check if using SQLite or MySQL
        from backend.config import Config
        use_sqlite = Config.USE_SQLITE
        
        cursor = db_connection.cursor()
        
        # Check if user exists
        if use_sqlite:
            cursor.execute("SELECT user_id, username, email, role FROM users WHERE user_id = ?", (user_id,))
        else:
            cursor.execute("SELECT user_id, username, email, role FROM users WHERE user_id = %s", (user_id,))
        
        row = cursor.fetchone()
        
        if not row:
            cursor.close()
            return jsonify({'error': 'User not found'}), 404
        
        # Convert to dict if SQLite
        if use_sqlite:
            from database.database import dict_from_row
            user = dict_from_row(row)
        else:
            user = {
                'user_id': row[0],
                'username': row[1],
                'email': row[2],
                'role': row[3]
            }
        
        # Prevent changing own role
        if user['user_id'] == identity.get('user_id'):
            cursor.close()
            return jsonify({'error': 'Cannot change your own role'}), 400
        
        # Update user role
        if use_sqlite:
            cursor.execute(
                "UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?",
                (new_role, user_id)
            )
        else:
            cursor.execute(
                "UPDATE users SET role = %s, updated_at = CURRENT_TIMESTAMP WHERE user_id = %s",
                (new_role, user_id)
            )
        
        db_connection.commit()
        cursor.close()
        
        return jsonify({
            'message': f'User role updated successfully from {user["role"]} to {new_role}',
            'user': {
                'user_id': user['user_id'],
                'username': user['username'],
                'email': user['email'],
                'old_role': user['role'],
                'new_role': new_role
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Role change failed: {str(e)}'}), 500
