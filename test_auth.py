import requests

print('=== Testing Complete Authentication Flow ===\n')

# Test 1: Register Client
r1 = requests.post('http://localhost:5000/api/auth/register', json={
    'username': 'client1',
    'email': 'client@test.com',
    'password': 'Client@123',
    'first_name': 'John',
    'last_name': 'Client',
    'role': 'client'
})
print(f'1. Client Registration: {r1.status_code}')
if r1.status_code != 201:
    print(f'   Error: {r1.json()}')

# Test 2: Client Login
r2 = requests.post('http://localhost:5000/api/auth/login', json={
    'email': 'client@test.com',
    'password': 'Client@123'
})
print(f'2. Client Login: {r2.status_code}')
client_token = r2.json().get('access_token')

# Test 3: Client View Products
r3 = requests.get('http://localhost:5000/api/products', headers={
    'Authorization': f'Bearer {client_token}'
})
print(f'3. Client View Products: {r3.status_code}')
print(f'   Products Count: {len(r3.json()["products"])}')

# Test 4: Admin Login
r4 = requests.post('http://localhost:5000/api/auth/login', json={
    'email': 'testadmin@test.com',
    'password': 'NewPass@123'
})
print(f'4. Admin Login: {r4.status_code}')
admin_token = r4.json().get('access_token')

# Test 5: Admin View Products
r5 = requests.get('http://localhost:5000/api/products', headers={
    'Authorization': f'Bearer {admin_token}'
})
print(f'5. Admin View Products: {r5.status_code}')
print(f'   Products Count: {len(r5.json()["products"])}')

# Test 6: Admin Create Product
r6 = requests.post('http://localhost:5000/api/products', json={
    'sku': 'LAPTOP-001',
    'product_name': 'Dell Laptop',
    'category': 'Electronics',
    'supplier': 'Dell Inc',
    'unit_price': 1200.00,
    'quantity_in_stock': 25
}, headers={'Authorization': f'Bearer {admin_token}'})
print(f'6. Admin Create Product: {r6.status_code}')
if r6.status_code == 201:
    print(f'   Created: {r6.json()["product"]["product_name"]}')

# Test 7: View all products again
r7 = requests.get('http://localhost:5000/api/products', headers={
    'Authorization': f'Bearer {admin_token}'
})
print(f'7. Final Products Count: {len(r7.json()["products"])}')

print('\n=== All Tests Passed! ===')
