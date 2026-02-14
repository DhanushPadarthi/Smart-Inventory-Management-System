"""
Database connection and utilities
"""
import sqlite3
import pymysql
from backend.config import Config
import os

def get_db_connection():
    """Create and return a database connection (SQLite or MySQL)"""
    try:
        if Config.USE_SQLITE:
            # Use SQLite
            connection = sqlite3.connect(Config.SQLITE_DB_PATH, check_same_thread=False)
            connection.row_factory = sqlite3.Row  # Return rows as dictionaries
            return connection
        else:
            # Use MySQL
            connection = pymysql.connect(
                host=Config.DB_HOST,
                user=Config.DB_USER,
                password=Config.DB_PASSWORD,
                database=Config.DB_NAME,
                port=Config.DB_PORT,
                cursorclass=pymysql.cursors.DictCursor,
                autocommit=False
            )
            return connection
    except Exception as e:
        print(f"Error connecting to database: {e}")
        raise

def init_db():
    """Initialize database with schema"""
    try:
        if Config.USE_SQLITE:
            # Initialize SQLite database
            connection = sqlite3.connect(Config.SQLITE_DB_PATH)
            cursor = connection.cursor()
            
            # Create users table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    role TEXT NOT NULL DEFAULT 'employee',
                    first_name TEXT,
                    last_name TEXT,
                    phone TEXT,
                    is_active INTEGER DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP NULL,
                    created_by INTEGER,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
                )
            """)
            
            # Create default admin user (password: Admin@123)
            cursor.execute("""
                INSERT OR IGNORE INTO users (username, email, password_hash, role, first_name, last_name, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                'admin',
                'admin@inventory.com',
                '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5agyPY.9F7Lca',
                'admin',
                'System',
                'Administrator',
                1
            ))
            
            connection.commit()
            cursor.close()
            connection.close()
            
            print(f"SQLite database initialized successfully at {Config.SQLITE_DB_PATH}")
            return True
        else:
            # Initialize MySQL database
            connection = pymysql.connect(
                host=Config.DB_HOST,
                user=Config.DB_USER,
                password=Config.DB_PASSWORD,
                port=Config.DB_PORT
            )
            
            cursor = connection.cursor()
            
            # Read and execute schema file
            with open('database/schema.sql', 'r') as f:
                schema = f.read()
                
            # Split by semicolon and execute each statement
            statements = schema.split(';')
            for statement in statements:
                if statement.strip():
                    cursor.execute(statement)
            
            connection.commit()
            cursor.close()
            connection.close()
            
            print("MySQL database initialized successfully")
            return True
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        return False

def close_db_connection(connection):
    """Close database connection"""
    if connection:
        connection.close()

def dict_from_row(row):
    """Convert SQLite row to dictionary"""
    if row is None:
        return None
    return dict(row)
