-- Sample users
INSERT INTO users (user_id, username, password, role) VALUES (1, 'admin', 'hashedpassword', 'admin');
INSERT INTO users (user_id, username, password, role) VALUES (2, 'staff', 'hashedpassword', 'staff');

-- Sample products
INSERT INTO products (product_id, product_name, category_id, supplier_id, stock_quantity, unit_price) VALUES (1, 'Widget A', 1, 1, 100, 10.00);
INSERT INTO products (product_id, product_name, category_id, supplier_id, stock_quantity, unit_price) VALUES (2, 'Widget B', 1, 2, 50, 15.00);

-- Sample alerts
INSERT INTO alerts (alert_id, product_id, alert_type, alert_message, is_acknowledged, created_at) VALUES (1, 1, 'Low Stock', 'Stock below threshold', 0, CURRENT_TIMESTAMP);
INSERT INTO alerts (alert_id, product_id, alert_type, alert_message, is_acknowledged, created_at) VALUES (2, 2, 'Low Stock', 'Stock below threshold', 1, CURRENT_TIMESTAMP);

-- Sample transactions
INSERT INTO transactions (transaction_id, product_id, user_id, transaction_type, quantity, unit_price, total_amount, transaction_date, notes) VALUES (1, 1, 1, 'purchase', 20, 10.00, 200.00, CURRENT_TIMESTAMP, 'Initial stock');
INSERT INTO transactions (transaction_id, product_id, user_id, transaction_type, quantity, unit_price, total_amount, transaction_date, notes) VALUES (2, 2, 2, 'sale', 5, 15.00, 75.00, CURRENT_TIMESTAMP, 'Sold to customer');
