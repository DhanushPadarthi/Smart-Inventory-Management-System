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

    
    # CORS configuration
    CORS_HEADERS = 'Content-Type'

