"""
Transaction Management Module - Milestone 4
"""
from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

@jwt_required()
def get_all_transactions(db_connection):
    try:
        cursor = db_connection.cursor()
        from backend.config import Config
        use_sqlite = Config.USE_SQLITE
        query = "SELECT transaction_id, product_id, user_id, transaction_type, quantity, unit_price, total_amount, transaction_date, notes FROM transactions ORDER BY transaction_date DESC"
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        if use_sqlite:
            from database.database import dict_from_row
            transactions = [dict_from_row(row) for row in rows]
        else:
            transactions = rows
        return jsonify({'transactions': transactions, 'total': len(transactions)}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to get transactions: {str(e)}'}), 500

@jwt_required()
def get_transaction(db_connection, transaction_id):
    try:
        cursor = db_connection.cursor()
        from backend.config import Config
        use_sqlite = Config.USE_SQLITE
        query = "SELECT transaction_id, product_id, user_id, transaction_type, quantity, unit_price, total_amount, transaction_date, notes FROM transactions WHERE transaction_id = ?" if use_sqlite else "SELECT transaction_id, product_id, user_id, transaction_type, quantity, unit_price, total_amount, transaction_date, notes FROM transactions WHERE transaction_id = %s"
        cursor.execute(query, (transaction_id,))
        row = cursor.fetchone()
        cursor.close()
        if not row:
            return jsonify({'error': 'Transaction not found'}), 404
        if use_sqlite:
            from database.database import dict_from_row
            transaction = dict_from_row(row)
        else:
            transaction = row
        return jsonify({'transaction': transaction}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to get transaction: {str(e)}'}), 500

@jwt_required()
def create_transaction(db_connection):
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        required_fields = ['product_id', 'transaction_type', 'quantity', 'unit_price']
        for field in required_fields:
            if field not in data or not str(data[field]).strip():
                return jsonify({'error': f'{field} is required'}), 400
        product_id = int(data['product_id'])
        transaction_type = data['transaction_type']
        quantity = int(data['quantity'])
        unit_price = float(data['unit_price'])
        notes = data.get('notes', '').strip()
        transaction_date = datetime.now()
        total_amount = unit_price * quantity
        from backend.config import Config
        use_sqlite = Config.USE_SQLITE
        cursor = db_connection.cursor()
        # Insert transaction
        if use_sqlite:
            cursor.execute("""
                INSERT INTO transactions (product_id, user_id, transaction_type, quantity, unit_price, total_amount, transaction_date, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (product_id, user_id, transaction_type, quantity, unit_price, total_amount, transaction_date, notes))
        else:
            cursor.execute("""
                INSERT INTO transactions (product_id, user_id, transaction_type, quantity, unit_price, total_amount, transaction_date, notes)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (product_id, user_id, transaction_type, quantity, unit_price, total_amount, transaction_date, notes))
        db_connection.commit()
        transaction_id = cursor.lastrowid
        cursor.close()
        return jsonify({'message': 'Transaction created successfully', 'transaction_id': transaction_id}), 201
    except Exception as e:
        return jsonify({'error': f'Failed to create transaction: {str(e)}'}), 500
