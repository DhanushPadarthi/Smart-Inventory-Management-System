"""
Reporting and Export Module - Milestone 5
"""
from flask import jsonify, request, send_file
from flask_jwt_extended import jwt_required
import csv
import io

@jwt_required()
def generate_inventory_report(db_connection):
    try:
        cursor = db_connection.cursor()
        from backend.config import Config
        use_sqlite = Config.USE_SQLITE
        query = "SELECT sku, product_name, category, supplier, unit_price, quantity_in_stock, min_stock_level FROM products WHERE is_active = 1 ORDER BY product_name ASC"
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        if use_sqlite:
            from database.database import dict_from_row
            products = [dict_from_row(row) for row in rows]
        else:
            products = rows
        return jsonify({'products': products, 'total': len(products)}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to generate inventory report: {str(e)}'}), 500

@jwt_required()
def export_inventory_csv(db_connection):
    try:
        cursor = db_connection.cursor()
        from backend.config import Config
        use_sqlite = Config.USE_SQLITE
        query = "SELECT sku, product_name, category, supplier, unit_price, quantity_in_stock, min_stock_level FROM products WHERE is_active = 1 ORDER BY product_name ASC"
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['SKU', 'Product Name', 'Category', 'Supplier', 'Unit Price', 'In Stock', 'Min Stock Level'])
        for row in rows:
            if use_sqlite:
                writer.writerow([row[1], row[2], row[4], row[5], row[6], row[7], row[8]])
            else:
                writer.writerow([row['sku'], row['product_name'], row['category'], row['supplier'], row['unit_price'], row['quantity_in_stock'], row['min_stock_level']])
        output.seek(0)
        return send_file(io.BytesIO(output.getvalue().encode()), mimetype='text/csv', as_attachment=True, download_name='inventory-report.csv')
    except Exception as e:
        return jsonify({'error': f'Failed to export CSV: {str(e)}'}), 500

@jwt_required()
def get_admin_analytics(db_connection):
    try:
        cursor = db_connection.cursor()
        from backend.config import Config
        use_sqlite = Config.USE_SQLITE

        # Total products & value
        cursor.execute("SELECT COUNT(*), SUM(unit_price * quantity_in_stock) FROM products WHERE is_active = 1")
        row = cursor.fetchone()
        total_products = row[0] or 0
        total_value = float(row[1] or 0)

        # Low stock & out of stock
        cursor.execute("SELECT COUNT(*) FROM products WHERE quantity_in_stock <= min_stock_level AND is_active = 1")
        low_stock = cursor.fetchone()[0] or 0

        cursor.execute("SELECT COUNT(*) FROM products WHERE quantity_in_stock = 0 AND is_active = 1")
        out_of_stock = cursor.fetchone()[0] or 0

        # Total users
        cursor.execute("SELECT COUNT(*) FROM users WHERE is_active = 1")
        active_users = cursor.fetchone()[0] or 0

        # Top 5 low stock products
        cursor.execute("""
            SELECT product_name, sku, quantity_in_stock, min_stock_level
            FROM products
            WHERE quantity_in_stock <= min_stock_level AND is_active = 1
            ORDER BY quantity_in_stock ASC
            LIMIT 5
        """)
        low_stock_items_raw = cursor.fetchall()
        if use_sqlite:
            from database.database import dict_from_row
            low_stock_items = [dict_from_row(r) for r in low_stock_items_raw]
        else:
            low_stock_items = low_stock_items_raw

        # Category breakdown
        cursor.execute("""
            SELECT category, COUNT(*) as count, SUM(quantity_in_stock) as total_stock
            FROM products
            WHERE is_active = 1
            GROUP BY category
            ORDER BY count DESC
        """)
        categories_raw = cursor.fetchall()
        if use_sqlite:
            categories = [dict_from_row(r) for r in categories_raw]
        else:
            categories = categories_raw

        cursor.close()
        return jsonify({
            'total_products': total_products,
            'total_inventory_value': total_value,
            'low_stock_count': low_stock,
            'out_of_stock_count': out_of_stock,
            'active_users': active_users,
            'low_stock_items': low_stock_items,
            'categories': categories
        }), 200
    except Exception as e:
        return jsonify({'error': f'Failed to get analytics: {str(e)}'}), 500
