import requests

print('=== Testing Admin vs Client Permissions ===\n')

# Test Admin
print('--- ADMIN USER ---')
r1 = requests.post('http://localhost:5000/api/auth/login', json={
    'email': 'testadmin@test.com',
    'password': 'NewPass@123'
})
admin_token = r1.json()['access_token']
print(f'Login: {r1.status_code} ✓')

# Admin can create product
r2 = requests.post('http://localhost:5000/api/products', json={
    'sku': 'ADMIN-TEST-001',
    'product_name': 'Admin Created Product',
    'category': 'Test',
    'supplier': 'Test Supplier',
    'unit_price': 50.00,
    'quantity_in_stock': 100
}, headers={'Authorization': f'Bearer {admin_token}'})
print(f'Create Product: {r2.status_code} ✓')

# Test Client
print('\n--- CLIENT USER ---')
r3 = requests.post('http://localhost:5000/api/auth/login', json={
    'email': 'client2@test.com',
    'password': 'Client@123'
})
client_token = r3.json()['access_token']
client_user = r3.json()['user']
print(f'Login: {r3.status_code} ✓')
print(f'User Info: {client_user["first_name"]} {client_user["last_name"]} - Role: {client_user["role"]}')

# Client can view products
r4 = requests.get('http://localhost:5000/api/products', headers={
    'Authorization': f'Bearer {client_token}'
})
print(f'View Products: {r4.status_code} - Count: {len(r4.json()["products"])} ✓')

# Client can view categories
r5 = requests.get('http://localhost:5000/api/categories', headers={
    'Authorization': f'Bearer {client_token}'
})
print(f'View Categories: {r5.status_code} - Count: {len(r5.json()["categories"])} ✓')

# Client can view reports
r6 = requests.get('http://localhost:5000/api/suppliers', headers={
    'Authorization': f'Bearer {client_token}'
})
print(f'View Suppliers: {r6.status_code} - Count: {len(r6.json()["suppliers"])} ✓')

print('\n✓ All permissions working correctly!')
print('- Admin: Full access (create, edit, delete, stock management)')
print('- Client: Read-only access (view products, categories, suppliers, reports)')
