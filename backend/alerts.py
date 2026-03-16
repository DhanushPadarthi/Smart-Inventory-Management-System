"""
Low-Stock Alerts and Notification Module - Milestone 3
"""
from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

# Get all active alerts
@jwt_required()
def get_active_alerts(db_connection):
    try:
        cursor = db_connection.cursor()
        from backend.config import Config
        use_sqlite = Config.USE_SQLITE
        query = "SELECT alert_id, product_id, alert_type, alert_message, is_acknowledged, created_at FROM alerts WHERE is_acknowledged = 0 ORDER BY created_at DESC"
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        if use_sqlite:
            from database.database import dict_from_row
            alerts = [dict_from_row(row) for row in rows]
        else:
            alerts = rows
        return jsonify({'alerts': alerts, 'total': len(alerts)}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to get alerts: {str(e)}'}), 500

# Acknowledge alert
@jwt_required()
def acknowledge_alert(db_connection, alert_id):
    try:
        user_id = int(get_jwt_identity())
        cursor = db_connection.cursor()
        from backend.config import Config
        use_sqlite = Config.USE_SQLITE
        # Check if alert exists
        query = "SELECT alert_id FROM alerts WHERE alert_id = ? AND is_acknowledged = 0" if use_sqlite else "SELECT alert_id FROM alerts WHERE alert_id = %s AND is_acknowledged = 0"
        cursor.execute(query, (alert_id,))
        if not cursor.fetchone():
            cursor.close()
            return jsonify({'error': 'Alert not found or already acknowledged'}), 404
        # Acknowledge
        if use_sqlite:
            cursor.execute("UPDATE alerts SET is_acknowledged = 1, acknowledged_at = CURRENT_TIMESTAMP, acknowledged_by = ? WHERE alert_id = ?", (user_id, alert_id))
        else:
            cursor.execute("UPDATE alerts SET is_acknowledged = 1, acknowledged_at = CURRENT_TIMESTAMP, acknowledged_by = %s WHERE alert_id = %s", (user_id, alert_id))
        db_connection.commit()
        cursor.close()
        return jsonify({'message': 'Alert acknowledged successfully'}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to acknowledge alert: {str(e)}'}), 500

# Get alert history
@jwt_required()
def get_alert_history(db_connection):
    try:
        cursor = db_connection.cursor()
        from backend.config import Config
        use_sqlite = Config.USE_SQLITE
        query = "SELECT alert_id, product_id, alert_type, alert_message, is_acknowledged, created_at, acknowledged_at, acknowledged_by FROM alerts WHERE is_acknowledged = 1 ORDER BY acknowledged_at DESC"
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        if use_sqlite:
            from database.database import dict_from_row
            alerts = [dict_from_row(row) for row in rows]
        else:
            alerts = rows
        return jsonify({'alerts': alerts, 'total': len(alerts)}), 200
    except Exception as e:
        return jsonify({'error': f'Failed to get alert history: {str(e)}'}), 500

# Create custom broadcast alert (Admin only)
@jwt_required()
def create_custom_alert(db_connection):
    try:
        user_id = int(get_jwt_identity())
        cursor = db_connection.cursor()
        from backend.config import Config
        use_sqlite = Config.USE_SQLITE

        # Verify admin role
        query = "SELECT role FROM users WHERE user_id = ?" if use_sqlite else "SELECT role FROM users WHERE user_id = %s"
        cursor.execute(query, (user_id,))
        row = cursor.fetchone()
        if not row:
            cursor.close()
            return jsonify({'error': 'User not found'}), 404
        role = row[0] if isinstance(row, tuple) else row['role']
        if role != 'admin':
            cursor.close()
            return jsonify({'error': 'Admin access required'}), 403

        data = request.get_json()
        alert_type = data.get('alert_type', 'Broadcast')
        message = data.get('message', '').strip()
        if not message:
            cursor.close()
            return jsonify({'error': 'Message is required'}), 400

        if use_sqlite:
            cursor.execute(
                "INSERT INTO alerts (product_id, alert_type, alert_message, is_acknowledged, created_at) VALUES (NULL, ?, ?, 0, CURRENT_TIMESTAMP)",
                (alert_type, message)
            )
        else:
            cursor.execute(
                "INSERT INTO alerts (product_id, alert_type, alert_message, is_acknowledged, created_at) VALUES (NULL, %s, %s, 0, CURRENT_TIMESTAMP)",
                (alert_type, message)
            )
        db_connection.commit()
        cursor.close()
        return jsonify({'message': 'Alert created successfully'}), 201
    except Exception as e:
        return jsonify({'error': f'Failed to create alert: {str(e)}'}), 500
