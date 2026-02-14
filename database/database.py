"""
Database connection and utilities
"""
import pymysql
from config import Config

def get_db_connection():
    """Create and return a database connection"""
    try:
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
    except pymysql.Error as e:
        print(f"Error connecting to database: {e}")
        raise

def init_db():
    """Initialize database with schema"""
    try:
        # Connect without database to create it
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
        
        print("Database initialized successfully")
        return True
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        return False

def close_db_connection(connection):
    """Close database connection"""
    if connection:
        connection.close()
