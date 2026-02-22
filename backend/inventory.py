"""
Product and Inventory Management Module - Milestone 2
"""
from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import re

def validate_sku(sku):
    """Validate SKU format (alphanumeric with hyphens/underscores)"""
    pattern = r'^[A-Za-z0-9_-]+$'
    return re.match(pattern, sku) is not None

def create_product(db_connection):
    """
    Create a new product
    Required fields: sku, product_name, category, supplier, unit_price
    """
    try:
        user_id = int(get_jwt_identity())  # JWT identity is now a string user_id
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['sku', 'product_name', 'category', 'supplier', 'unit_price']
        for field in required_fields:
            if field not in data or not str(data[field]).strip():
                return jsonify({'error': f'{field} is required'}), 400
        
        sku = data['sku'].strip().upper()
        product_name = data['product_name'].strip()
        description = data.get('description', '').strip()
        category = data['category'].strip()
        supplier = data['supplier'].strip()
        unit_price = float(data['unit_price'])
        quantity_in_stock = int(data.get('quantity_in_stock', 0))
        min_stock_level = int(data.get('min_stock_level', 10))
        unit_of_measure = data.get('unit_of_measure', 'units').strip()
        
        # Validate SKU format
        if not validate_sku(sku):
            return jsonify({'error': 'Invalid SKU format. Use only letters, numbers, hyphens, and underscores'}), 400
        
        # Validate unit price
        if unit_price <= 0:
            return jsonify({'error': 'Unit price must be greater than 0'}), 400
        
        # Validate quantities
        if quantity_in_stock < 0:
            return jsonify({'error': 'Quantity in stock cannot be negative'}), 400
        
        if min_stock_level < 0:
            return jsonify({'error': 'Minimum stock level cannot be negative'}), 400
        
        # Check if using SQLite or MySQL
        from backend.config import Config
        use_sqlite = Config.USE_SQLITE
        
        cursor = db_connection.cursor()
        
        # Check if SKU already exists
        if use_sqlite:
            cursor.execute("SELECT product_id FROM products WHERE sku = ?", (sku,))
        else:
            cursor.execute("SELECT product_id FROM products WHERE sku = %s", (sku,))
        
        if cursor.fetchone():
            cursor.close()
            return jsonify({'error': f'Product with SKU {sku} already exists'}), 400
        
        # Insert product
        if use_sqlite:
            cursor.execute("""
                INSERT INTO products (sku, product_name, description, category, supplier, 
                                    unit_price, quantity_in_stock, min_stock_level, 
                                    unit_of_measure, created_by, updated_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (sku, product_name, description, category, supplier, unit_price,
                  quantity_in_stock, min_stock_level, unit_of_measure, user_id, user_id))
        else:
            cursor.execute("""
                INSERT INTO products (sku, product_name, description, category, supplier, 
                                    unit_price, quantity_in_stock, min_stock_level, 
                                    unit_of_measure, created_by, updated_by)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (sku, product_name, description, category, supplier, unit_price,
                  quantity_in_stock, min_stock_level, unit_of_measure, user_id, user_id))
        
        product_id = cursor.lastrowid
        
        # If initial stock > 0, create a stock movement record
        if quantity_in_stock > 0:
            if use_sqlite:
                cursor.execute("""
                    INSERT INTO stock_movements (product_id, movement_type, quantity, 
                                                previous_quantity, new_quantity, 
                                                reference_number, notes, created_by)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (product_id, 'stock-in', quantity_in_stock, 0, quantity_in_stock,
                      'INITIAL', 'Initial stock entry', user_id))
            else:
                cursor.execute("""
                    INSERT INTO stock_movements (product_id, movement_type, quantity, 
                                                previous_quantity, new_quantity, 
                                                reference_number, notes, created_by)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (product_id, 'stock-in', quantity_in_stock, 0, quantity_in_stock,
                      'INITIAL', 'Initial stock entry', user_id))
        
        db_connection.commit()
        cursor.close()
        
        return jsonify({
            'message': 'Product created successfully',
            'product': {
                'product_id': product_id,
                'sku': sku,
                'product_name': product_name,
                'category': category,
                'supplier': supplier,
                'unit_price': unit_price,
                'quantity_in_stock': quantity_in_stock,
                'min_stock_level': min_stock_level
            }
        }), 201
        
    except ValueError as e:
        return jsonify({'error': f'Invalid numeric value: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': f'Failed to create product: {str(e)}'}), 500

def get_all_products(db_connection):
    """Get all products with optional filters"""
    try:
        # Get query parameters for filtering
        category = request.args.get('category')
        supplier = request.args.get('supplier')
        low_stock = request.args.get('low_stock')  # 'true' or 'false'
        search = request.args.get('search')  # Search by name or SKU
        
        # Check if using SQLite or MySQL
        from backend.config import Config
        use_sqlite = Config.USE_SQLITE
        
        cursor = db_connection.cursor()
        
        # Build query
        query = """
            SELECT product_id, sku, product_name, description, category, supplier,
                   unit_price, quantity_in_stock, min_stock_level, unit_of_measure,
                   is_active, created_at, updated_at
            FROM products
            WHERE is_active = {}
        """.format(1 if use_sqlite else 'TRUE')
        
        params = []
        
        # Add filters
        if category:
            query += " AND category = {}".format('?' if use_sqlite else '%s')
            params.append(category)
        
        if supplier:
            query += " AND supplier = {}".format('?' if use_sqlite else '%s')
            params.append(supplier)
        
        if low_stock == 'true':
            query += " AND quantity_in_stock <= min_stock_level"
        
        if search:
            search_pattern = f"%{search}%"
            query += " AND (product_name LIKE {} OR sku LIKE {})".format(
                '?' if use_sqlite else '%s',
                '?' if use_sqlite else '%s'
            )
            params.extend([search_pattern, search_pattern])
        
        query += " ORDER BY product_name ASC"
        
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        
        # Convert to dict if SQLite
        if use_sqlite:
            from database.database import dict_from_row
            products = [dict_from_row(row) for row in rows]
        else:
            products = rows
        
        # Add low stock flag
        for product in products:
            product['is_low_stock'] = product['quantity_in_stock'] <= product['min_stock_level']
        
        return jsonify({
            'products': products,
            'total': len(products)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get products: {str(e)}'}), 500

def get_product(db_connection, product_id):
    """Get a single product by ID"""
    try:
        # Check if using SQLite or MySQL
        from backend.config import Config
        use_sqlite = Config.USE_SQLITE
        
        cursor = db_connection.cursor()
        
        if use_sqlite:
            cursor.execute("""
                SELECT product_id, sku, product_name, description, category, supplier,
                       unit_price, quantity_in_stock, min_stock_level, unit_of_measure,
                       is_active, created_at, updated_at
                FROM products
                WHERE product_id = ? AND is_active = 1
            """, (product_id,))
        else:
            cursor.execute("""
                SELECT product_id, sku, product_name, description, category, supplier,
                       unit_price, quantity_in_stock, min_stock_level, unit_of_measure,
                       is_active, created_at, updated_at
                FROM products
                WHERE product_id = %s AND is_active = TRUE
            """, (product_id,))
        
        row = cursor.fetchone()
        cursor.close()
        
        if not row:
            return jsonify({'error': 'Product not found'}), 404
        
        # Convert to dict if SQLite
        if use_sqlite:
            from database.database import dict_from_row
            product = dict_from_row(row)
        else:
            product = row
        
        product['is_low_stock'] = product['quantity_in_stock'] <= product['min_stock_level']
        
        return jsonify({'product': product}), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get product: {str(e)}'}), 500

def update_product(db_connection, product_id):
    """Update product details (not stock quantity)"""
    try:
        user_id = int(get_jwt_identity())  # JWT identity is now a string user_id
        
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Check if using SQLite or MySQL
        from backend.config import Config
        use_sqlite = Config.USE_SQLITE
        
        cursor = db_connection.cursor()
        
        # Check if product exists
        if use_sqlite:
            cursor.execute("SELECT product_id FROM products WHERE product_id = ? AND is_active = 1", (product_id,))
        else:
            cursor.execute("SELECT product_id FROM products WHERE product_id = %s AND is_active = TRUE", (product_id,))
        
        if not cursor.fetchone():
            cursor.close()
            return jsonify({'error': 'Product not found'}), 404
        
        # Build update query dynamically
        allowed_fields = ['product_name', 'description', 'category', 'supplier', 
                         'unit_price', 'min_stock_level', 'unit_of_measure']
        
        update_fields = []
        params = []
        
        for field in allowed_fields:
            if field in data:
                if field == 'product_name' and not data[field].strip():
                    cursor.close()
                    return jsonify({'error': 'Product name cannot be empty'}), 400
                
                if field == 'unit_price':
                    value = float(data[field])
                    if value <= 0:
                        cursor.close()
                        return jsonify({'error': 'Unit price must be greater than 0'}), 400
                    update_fields.append(f"{field} = {'?' if use_sqlite else '%s'}")
                    params.append(value)
                elif field == 'min_stock_level':
                    value = int(data[field])
                    if value < 0:
                        cursor.close()
                        return jsonify({'error': 'Minimum stock level cannot be negative'}), 400
                    update_fields.append(f"{field} = {'?' if use_sqlite else '%s'}")
                    params.append(value)
                else:
                    update_fields.append(f"{field} = {'?' if use_sqlite else '%s'}")
                    params.append(data[field].strip() if isinstance(data[field], str) else data[field])
        
        if not update_fields:
            cursor.close()
            return jsonify({'error': 'No valid fields to update'}), 400
        
        # Add updated_by and updated_at
        update_fields.append(f"updated_by = {'?' if use_sqlite else '%s'}")
        params.append(user_id)
        
        if use_sqlite:
            update_fields.append("updated_at = CURRENT_TIMESTAMP")
        
        params.append(product_id)
        
        query = f"UPDATE products SET {', '.join(update_fields)} WHERE product_id = {'?' if use_sqlite else '%s'}"
        
        cursor.execute(query, params)
        db_connection.commit()
        cursor.close()
        
        return jsonify({'message': 'Product updated successfully'}), 200
        
    except ValueError as e:
        return jsonify({'error': f'Invalid numeric value: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': f'Failed to update product: {str(e)}'}), 500

def delete_product(db_connection, product_id):
    """Soft delete a product (set is_active to False)"""
    try:
        user_id = int(get_jwt_identity())  # JWT identity is now a string user_id
        
        # Check if using SQLite or MySQL
        from backend.config import Config
        use_sqlite = Config.USE_SQLITE
        
        cursor = db_connection.cursor()
        
        # Get current user's role to verify admin access
        if use_sqlite:
            cursor.execute("SELECT role FROM users WHERE user_id = ?", (user_id,))
        else:
            cursor.execute("SELECT role FROM users WHERE user_id = %s", (user_id,))
        
        current_user = cursor.fetchone()
        if not current_user:
            cursor.close()
            return jsonify({'error': 'Current user not found'}), 404
        
        user_role = current_user[0] if isinstance(current_user, tuple) else current_user['role']
        
        # Only admins can delete products
        if user_role != 'admin':
            cursor.close()
            return jsonify({'error': 'Unauthorized. Admin access required'}), 403
        
        # Check if using SQLite or MySQL
        from backend.config import Config
        use_sqlite = Config.USE_SQLITE
        
        cursor = db_connection.cursor()
        
        # Check if product exists
        if use_sqlite:
            cursor.execute("SELECT product_id, product_name FROM products WHERE product_id = ? AND is_active = 1", 
                          (product_id,))
        else:
            cursor.execute("SELECT product_id, product_name FROM products WHERE product_id = %s AND is_active = TRUE", 
                          (product_id,))
        
        row = cursor.fetchone()
        
        if not row:
            cursor.close()
            return jsonify({'error': 'Product not found'}), 404
        
        # Soft delete
        if use_sqlite:
            cursor.execute("UPDATE products SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE product_id = ?", 
                          (product_id,))
        else:
            cursor.execute("UPDATE products SET is_active = FALSE WHERE product_id = %s", 
                          (product_id,))
        
        db_connection.commit()
        cursor.close()
        
        return jsonify({'message': 'Product deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to delete product: {str(e)}'}), 500

def update_stock(db_connection, product_id):
    """
    Update product stock (stock-in or stock-out)
    Required fields: movement_type ('stock-in' or 'stock-out'), quantity
    """
    try:
        user_id = int(get_jwt_identity())  # JWT identity is now a string user_id
        
        data = request.get_json()
        
        # Validate required fields
        if 'movement_type' not in data or 'quantity' not in data:
            return jsonify({'error': 'movement_type and quantity are required'}), 400
        
        movement_type = data['movement_type']
        quantity = int(data['quantity'])
        reference_number = data.get('reference_number', '').strip()
        notes = data.get('notes', '').strip()
        
        # Validate movement type
        if movement_type not in ['stock-in', 'stock-out', 'adjustment']:
            return jsonify({'error': 'movement_type must be stock-in, stock-out, or adjustment'}), 400
        
        # Validate quantity
        if quantity <= 0:
            return jsonify({'error': 'Quantity must be greater than 0'}), 400
        
        # Check if using SQLite or MySQL
        from backend.config import Config
        use_sqlite = Config.USE_SQLITE
        
        cursor = db_connection.cursor()
        
        # Get current stock
        if use_sqlite:
            cursor.execute("SELECT quantity_in_stock FROM products WHERE product_id = ? AND is_active = 1", 
                          (product_id,))
        else:
            cursor.execute("SELECT quantity_in_stock FROM products WHERE product_id = %s AND is_active = TRUE", 
                          (product_id,))
        
        row = cursor.fetchone()
        
        if not row:
            cursor.close()
            return jsonify({'error': 'Product not found'}), 404
        
        # Get current quantity
        if use_sqlite:
            from database.database import dict_from_row
            product_data = dict_from_row(row)
            previous_quantity = product_data['quantity_in_stock']
        else:
            previous_quantity = row['quantity_in_stock']
        
        # Calculate new quantity
        if movement_type == 'stock-in':
            new_quantity = previous_quantity + quantity
        elif movement_type == 'stock-out':
            new_quantity = previous_quantity - quantity
            if new_quantity < 0:
                cursor.close()
                return jsonify({'error': 'Insufficient stock. Cannot reduce stock below 0'}), 400
        else:  # adjustment
            new_quantity = quantity
        
        # Update product stock
        if use_sqlite:
            cursor.execute("""
                UPDATE products 
                SET quantity_in_stock = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?
                WHERE product_id = ?
            """, (new_quantity, user_id, product_id))
        else:
            cursor.execute("""
                UPDATE products 
                SET quantity_in_stock = %s, updated_by = %s
                WHERE product_id = %s
            """, (new_quantity, user_id, product_id))
        
        # Record stock movement
        if use_sqlite:
            cursor.execute("""
                INSERT INTO stock_movements (product_id, movement_type, quantity, 
                                            previous_quantity, new_quantity, 
                                            reference_number, notes, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (product_id, movement_type, quantity, previous_quantity, new_quantity,
                  reference_number, notes, user_id))
        else:
            cursor.execute("""
                INSERT INTO stock_movements (product_id, movement_type, quantity, 
                                            previous_quantity, new_quantity, 
                                            reference_number, notes, created_by)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (product_id, movement_type, quantity, previous_quantity, new_quantity,
                  reference_number, notes, user_id))
        
        db_connection.commit()
        cursor.close()
        
        return jsonify({
            'message': 'Stock updated successfully',
            'movement': {
                'movement_type': movement_type,
                'quantity': quantity,
                'previous_quantity': previous_quantity,
                'new_quantity': new_quantity
            }
        }), 200
        
    except ValueError as e:
        return jsonify({'error': f'Invalid numeric value: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': f'Failed to update stock: {str(e)}'}), 500

def get_stock_movements(db_connection, product_id):
    """Get stock movement history for a product"""
    try:
        # Check if using SQLite or MySQL
        from backend.config import Config
        use_sqlite = Config.USE_SQLITE
        
        cursor = db_connection.cursor()
        
        # Check if product exists
        if use_sqlite:
            cursor.execute("SELECT product_id FROM products WHERE product_id = ?", (product_id,))
        else:
            cursor.execute("SELECT product_id FROM products WHERE product_id = %s", (product_id,))
        
        if not cursor.fetchone():
            cursor.close()
            return jsonify({'error': 'Product not found'}), 404
        
        # Get movements
        if use_sqlite:
            cursor.execute("""
                SELECT movement_id, product_id, movement_type, quantity,
                       previous_quantity, new_quantity, reference_number, 
                       notes, created_at, created_by
                FROM stock_movements
                WHERE product_id = ?
                ORDER BY created_at DESC
            """, (product_id,))
        else:
            cursor.execute("""
                SELECT movement_id, product_id, movement_type, quantity,
                       previous_quantity, new_quantity, reference_number, 
                       notes, created_at, created_by
                FROM stock_movements
                WHERE product_id = %s
                ORDER BY created_at DESC
            """, (product_id,))
        
        rows = cursor.fetchall()
        cursor.close()
        
        # Convert to dict if SQLite
        if use_sqlite:
            from database.database import dict_from_row
            movements = [dict_from_row(row) for row in rows]
        else:
            movements = rows
        
        return jsonify({
            'movements': movements,
            'total': len(movements)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get stock movements: {str(e)}'}), 500

def get_categories(db_connection):
    """Get all unique product categories"""
    try:
        # Check if using SQLite or MySQL
        from backend.config import Config
        use_sqlite = Config.USE_SQLITE
        
        cursor = db_connection.cursor()
        
        cursor.execute("""
            SELECT DISTINCT category 
            FROM products 
            WHERE is_active = {} AND category IS NOT NULL AND category != ''
            ORDER BY category ASC
        """.format(1 if use_sqlite else 'TRUE'))
        
        rows = cursor.fetchall()
        cursor.close()
        
        # Extract category names
        if use_sqlite:
            categories = [row[0] for row in rows]
        else:
            categories = [row['category'] for row in rows]
        
        return jsonify({'categories': categories}), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get categories: {str(e)}'}), 500

def get_suppliers(db_connection):
    """Get all unique suppliers"""
    try:
        # Check if using SQLite or MySQL
        from backend.config import Config
        use_sqlite = Config.USE_SQLITE
        
        cursor = db_connection.cursor()
        
        cursor.execute("""
            SELECT DISTINCT supplier 
            FROM products 
            WHERE is_active = {} AND supplier IS NOT NULL AND supplier != ''
            ORDER BY supplier ASC
        """.format(1 if use_sqlite else 'TRUE'))
        
        rows = cursor.fetchall()
        cursor.close()
        
        # Extract supplier names
        if use_sqlite:
            suppliers = [row[0] for row in rows]
        else:
            suppliers = [row['supplier'] for row in rows]
        
        return jsonify({'suppliers': suppliers}), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get suppliers: {str(e)}'}), 500
