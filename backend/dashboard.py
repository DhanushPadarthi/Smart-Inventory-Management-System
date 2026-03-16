"""
Dashboard statistics and extra features - Milestone 4
"""
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
import datetime

def get_dashboard_stats(db_connection):
    try:
        cursor = db_connection.cursor()
        from backend.config import Config
        use_sqlite = Config.USE_SQLITE
        
        user_id = int(get_jwt_identity())
        
        # Get user role
        if use_sqlite:
            cursor.execute("SELECT role FROM users WHERE user_id = ?", (user_id,))
        else:
            cursor.execute("SELECT role FROM users WHERE user_id = %s", (user_id,))
        role_row = cursor.fetchone()
        role = role_row[0] if isinstance(role_row, tuple) else role_row['role']

        # 1. Total Products
        cursor.execute("SELECT COUNT(*) as total FROM products WHERE is_active = 1")
        total_products = cursor.fetchone()
        total_products = total_products[0] if isinstance(total_products, tuple) else total_products['total']

        # 2. Low Stock Count
        cursor.execute("SELECT COUNT(*) as total FROM products WHERE quantity_in_stock <= min_stock_level AND is_active = 1")
        low_stock = cursor.fetchone()
        low_stock = low_stock[0] if isinstance(low_stock, tuple) else low_stock['total']

        # 3. Transactions Today
        today = datetime.date.today().strftime('%Y-%m-%d')
        if use_sqlite:
            cursor.execute("SELECT COUNT(*) as total FROM stock_movements WHERE date(created_at) = ?", (today,))
        else:
            cursor.execute("SELECT COUNT(*) as total FROM stock_movements WHERE DATE(created_at) = %s", (today,))
        transactions = cursor.fetchone()
        transactions = transactions[0] if isinstance(transactions, tuple) else transactions['total']

        # 4. Active Users (Admin only see actual count, users see 1 for simplicity or same)
        cursor.execute("SELECT COUNT(*) as total FROM users WHERE is_active = 1")
        active_users = cursor.fetchone()
        active_users = active_users[0] if isinstance(active_users, tuple) else active_users['total']

        # 5. Recent Movements (Feature enhancement)
        # Admins see everyone's, Employees see their own
        if role == 'admin':
            if use_sqlite:
                cursor.execute("""
                    SELECT m.*, p.product_name, u.username 
                    FROM stock_movements m 
                    JOIN products p ON m.product_id = p.product_id 
                    LEFT JOIN users u ON m.created_by = u.user_id 
                    ORDER BY m.created_at DESC LIMIT 5
                """)
            else:
                cursor.execute("""
                    SELECT m.*, p.product_name, u.username 
                    FROM stock_movements m 
                    JOIN products p ON m.product_id = p.product_id 
                    LEFT JOIN users u ON m.created_by = u.user_id 
                    ORDER BY m.created_at DESC LIMIT 5
                """)
        else:
            if use_sqlite:
                cursor.execute("""
                    SELECT m.*, p.product_name 
                    FROM stock_movements m 
                    JOIN products p ON m.product_id = p.product_id 
                    WHERE m.created_by = ? 
                    ORDER BY m.created_at DESC LIMIT 5
                """, (user_id,))
            else:
                cursor.execute("""
                    SELECT m.*, p.product_name 
                    FROM stock_movements m 
                    JOIN products p ON m.product_id = p.product_id 
                    WHERE m.created_by = %s 
                    ORDER BY m.created_at DESC LIMIT 5
                """, (user_id,))
        
        movements_raw = cursor.fetchall()
        recent_movements = []
        if use_sqlite:
            from database.database import dict_from_row
            recent_movements = [dict_from_row(row) for row in movements_raw]
        else:
            recent_movements = movements_raw

        # 6. Top Products (Admin only)
        top_products = []
        if role == 'admin':
            cursor.execute("""
                SELECT p.product_name, p.quantity_in_stock, p.unit_of_measure 
                FROM products p 
                WHERE is_active = 1 
                ORDER BY quantity_in_stock DESC LIMIT 3
            """)
            top_raw = cursor.fetchall()
            if use_sqlite:
                top_products = [dict_from_row(row) for row in top_raw]
            else:
                top_products = top_raw

        # 7. Latest Broadcast (Announcement)
        cursor.execute("""
            SELECT alert_message FROM alerts 
            WHERE alert_type IN ('Broadcast', 'Urgent', 'Maintenance') 
            AND is_acknowledged = 0 AND product_id IS NULL 
            ORDER BY created_at DESC LIMIT 1
        """)
        broadcast_row = cursor.fetchone()
        latest_broadcast = broadcast_row[0] if isinstance(broadcast_row, tuple) else (broadcast_row['alert_message'] if broadcast_row else None)

        cursor.close()

        return jsonify({
            'total_products': total_products,
            'low_stock_count': low_stock,
            'total_transactions': transactions,
            'active_users': active_users,
            'recent_movements': recent_movements,
            'top_products': top_products,
            'latest_broadcast': latest_broadcast,
            'role': role
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
