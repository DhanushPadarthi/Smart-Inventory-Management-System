from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from database.database import dict_from_row

@jwt_required()
def create_order(db_connection):
    """Create a new product order for a user"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        product_id = data.get('product_id')
        quantity = int(data.get('quantity', 0))
        shipping_address = data.get('shipping_address', 'Default Address')
        payment_method = data.get('payment_method', 'Cash on Delivery')
        
        if not product_id or quantity <= 0:
            return jsonify({'error': 'Valid product_id and quantity are required'}), 400
            
        cursor = db_connection.cursor()
        
        from backend.config import Config
        use_sqlite = Config.USE_SQLITE
        
        # 1. Get product price and check stock
        if use_sqlite:
            cursor.execute("SELECT product_name, unit_price, quantity_in_stock FROM products WHERE product_id = ?", (product_id,))
        else:
            cursor.execute("SELECT product_name, unit_price, quantity_in_stock FROM products WHERE product_id = %s", (product_id,))
            
        product = cursor.fetchone()
        if not product:
            cursor.close()
            return jsonify({'error': 'Product not found'}), 404
            
        if use_sqlite:
            from database.database import dict_from_row
            product_data = dict_from_row(product)
        else:
            product_data = product
            
        if product_data['quantity_in_stock'] < quantity:
            cursor.close()
            return jsonify({'error': 'Insufficient stock available'}), 400
            
        unit_price = product_data['unit_price']
        total_amount = unit_price * quantity
        
        # 2. Create Order (Status: Under Process)
        payment_status = 'Pending' if payment_method == 'Cash on Delivery' else 'Paid'
        
        if use_sqlite:
            query = """
                INSERT INTO orders (user_id, product_id, quantity, unit_price, total_amount, status, payment_status, payment_method, shipping_address)
                VALUES (?, ?, ?, ?, ?, 'Under Process', ?, ?, ?)
            """
        else:
            query = """
                INSERT INTO orders (user_id, product_id, quantity, unit_price, total_amount, status, payment_status, payment_method, shipping_address)
                VALUES (%s, %s, %s, %s, %s, 'Under Process', %s, %s, %s)
            """
            
        cursor.execute(query, (user_id, product_id, quantity, unit_price, total_amount, payment_status, payment_method, shipping_address))
        db_connection.commit()
        
        order_id = cursor.lastrowid
        cursor.close()
        
        return jsonify({
            'message': 'Order placed successfully',
            'order_id': order_id,
            'total_amount': total_amount
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@jwt_required()
def get_user_orders(db_connection):
    """Retrieve orders for the logged-in user"""
    try:
        user_id = int(get_jwt_identity())
        cursor = db_connection.cursor()
        
        from backend.config import Config
        use_sqlite = Config.USE_SQLITE
        
        if use_sqlite:
            query = """
                SELECT o.*, p.product_name 
                FROM orders o
                JOIN products p ON o.product_id = p.product_id
                WHERE o.user_id = ?
                ORDER BY o.created_at DESC
            """
        else:
            query = """
                SELECT o.*, p.product_name 
                FROM orders o
                JOIN products p ON o.product_id = p.product_id
                WHERE o.user_id = %s
                ORDER BY o.created_at DESC
            """
            
        cursor.execute(query, (user_id,))
        rows = cursor.fetchall()
        
        orders = []
        if use_sqlite:
            for row in rows:
                orders.append(dict_from_row(row))
        else:
            orders = rows
            
        cursor.close()
        return jsonify({'orders': orders}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@jwt_required()
def get_all_orders_admin(db_connection):
    """Retrieve all orders (Admins only)"""
    try:
        # Check role
        from flask_jwt_extended import get_jwt
        claims = get_jwt()
        # Note: In our current setup, identity is a string ID. Usually role is in claims.
        # Let's verify role by checking DB if claims not enough.
        # But for now assuming role check is done in app.py via custom decorator or simpler check.
        
        user_id = int(get_jwt_identity())
        cursor = db_connection.cursor()
        
        from backend.config import Config
        use_sqlite = Config.USE_SQLITE
        
        # Verify if admin
        if use_sqlite:
            cursor.execute("SELECT role FROM users WHERE user_id = ?", (user_id,))
        else:
            cursor.execute("SELECT role FROM users WHERE user_id = %s", (user_id,))
        
        row = cursor.fetchone()
        user_role = (dict_from_row(row)['role'] if use_sqlite else row['role']) if row else 'employee'
        
        if user_role != 'admin':
            cursor.close()
            return jsonify({'error': 'Admin access required'}), 403

        query = """
            SELECT o.*, p.product_name, u.username as customer_name
            FROM orders o
            JOIN products p ON o.product_id = p.product_id
            JOIN users u ON o.user_id = u.user_id
            ORDER BY o.created_at DESC
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        
        orders = []
        if use_sqlite:
            for row in rows:
                orders.append(dict_from_row(row))
        else:
            orders = rows
            
        cursor.close()
        return jsonify({'orders': orders}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@jwt_required()
def update_order_status(db_connection, order_id):
    """Update order status and reflect in stock if delivered"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        new_status = data.get('status') # 'Under Process', 'Shipped', 'Delivered', 'Cancelled'
        
        if not new_status:
            return jsonify({'error': 'Status is required'}), 400
            
        cursor = db_connection.cursor()
        from backend.config import Config
        use_sqlite = Config.USE_SQLITE
        
        # Verify if admin
        if use_sqlite:
            cursor.execute("SELECT role FROM users WHERE user_id = ?", (user_id,))
        else:
            cursor.execute("SELECT role FROM users WHERE user_id = %s", (user_id,))
        
        row = cursor.fetchone()
        user_role = (dict_from_row(row)['role'] if use_sqlite else row['role']) if row else 'employee'
        
        if user_role != 'admin':
            cursor.close()
            return jsonify({'error': 'Admin access required'}), 403

        # Get current order info
        if use_sqlite:
            cursor.execute("SELECT * FROM orders WHERE order_id = ?", (order_id,))
        else:
            cursor.execute("SELECT * FROM orders WHERE order_id = %s", (order_id,))
        
        order_row = cursor.fetchone()
        if not order_row:
            cursor.close()
            return jsonify({'error': 'Order not found'}), 404
            
        order = dict_from_row(order_row) if use_sqlite else order_row
        old_status = order['status']

        # Update Status and potentially Payment Status
        if new_status == 'Delivered':
            if use_sqlite:
                cursor.execute("UPDATE orders SET status = ?, payment_status = 'Paid', updated_at = ? WHERE order_id = ?", 
                              (new_status, datetime.now(), order_id))
            else:
                cursor.execute("UPDATE orders SET status = %s, payment_status = 'Paid', updated_at = %s WHERE order_id = %s", 
                              (new_status, datetime.now(), order_id))
        else:
            if use_sqlite:
                cursor.execute("UPDATE orders SET status = ?, updated_at = ? WHERE order_id = ?", 
                              (new_status, datetime.now(), order_id))
            else:
                cursor.execute("UPDATE orders SET status = %s, updated_at = %s WHERE order_id = %s", 
                              (new_status, datetime.now(), order_id))
        
        # If status changed to 'Delivered', reduce stock and create transaction record
        if new_status == 'Delivered' and old_status != 'Delivered':
            product_id = order['product_id']
            qty = order['quantity']
            
            # Reduce stock
            if use_sqlite:
                cursor.execute("UPDATE products SET quantity_in_stock = quantity_in_stock - ? WHERE product_id = ?", (qty, product_id))
                # Get new qty for stock movement record
                cursor.execute("SELECT quantity_in_stock FROM products WHERE product_id = ?", (product_id,))
            else:
                cursor.execute("UPDATE products SET quantity_in_stock = quantity_in_stock - %s WHERE product_id = %s", (qty, product_id))
                cursor.execute("SELECT quantity_in_stock FROM products WHERE product_id = %s", (product_id,))
            
            p_row = cursor.fetchone()
            new_qty = (dict_from_row(p_row)['quantity_in_stock'] if use_sqlite else p_row['quantity_in_stock'])
            
            # Record stock movement
            if use_sqlite:
                cursor.execute("""
                    INSERT INTO stock_movements (product_id, movement_type, quantity, previous_quantity, new_quantity, reference_number, created_by)
                    VALUES (?, 'stock-out', ?, ?, ?, ?, ?)
                """, (product_id, qty, new_qty + qty, new_qty, f"ORD-{order_id}", user_id))
            else:
                cursor.execute("""
                    INSERT INTO stock_movements (product_id, movement_type, quantity, previous_quantity, new_quantity, reference_number, created_by)
                    VALUES (%s, 'stock-out', %s, %s, %s, %s, %s)
                """, (product_id, qty, new_qty + qty, new_qty, f"ORD-{order_id}", user_id))

            # Record transaction for reporting
            if use_sqlite:
                cursor.execute("""
                    INSERT INTO transactions (product_id, user_id, transaction_type, quantity, unit_price, total_amount, notes)
                    VALUES (?, ?, 'Sale', ?, ?, ?, ?)
                """, (product_id, order['user_id'], qty, order['unit_price'], order['total_amount'], f"Order Delivered: ORD-{order_id}"))
            else:
                cursor.execute("""
                    INSERT INTO transactions (product_id, user_id, transaction_type, quantity, unit_price, total_amount, notes)
                    VALUES (%s, %s, 'Sale', %s, %s, %s, %s)
                """, (product_id, order['user_id'], qty, order['unit_price'], order['total_amount'], f"Order Delivered: ORD-{order_id}"))

        db_connection.commit()
        cursor.close()
        return jsonify({'message': f'Order status updated to {new_status}'}), 200
        
    except Exception as e:
        db_connection.rollback()
        return jsonify({'error': str(e)}), 500
