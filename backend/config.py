import os
from datetime import timedelta

class Config:
    """Application configuration"""
    
    # Secret key for JWT
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key-change-in-production'
    
    # JWT configuration
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # Database configuration
    USE_SQLITE = os.environ.get('USE_SQLITE', 'True').lower() == 'true'
    SQLITE_DB_PATH = os.environ.get('SQLITE_DB_PATH') or 'database/inventory.db'
    
    # MySQL configuration (if USE_SQLITE is False)
    DB_HOST = os.environ.get('DB_HOST') or 'localhost'
    DB_USER = os.environ.get('DB_USER') or 'root'
    DB_PASSWORD = os.environ.get('DB_PASSWORD') or ''
    DB_NAME = os.environ.get('DB_NAME') or 'inventory_db'
    DB_PORT = int(os.environ.get('DB_PORT') or 3306)
    
    # CORS configuration
    CORS_HEADERS = 'Content-Type'
