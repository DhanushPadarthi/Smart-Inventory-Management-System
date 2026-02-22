# API Documentation - Smart Inventory Management System

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication. After logging in, you'll receive a session cookie that must be included in subsequent requests.

---

## 📋 Table of Contents
1. [Authentication](#authentication-endpoints)
2. [Products & Inventory](#products-endpoints)
3. [Stock Management](#stock-management-endpoints)
4. [Categories & Suppliers](#categories-suppliers-endpoints)
5. [Reports](#reports-endpoints) (Coming Soon)

---

## 🔐 Authentication Endpoints

### Register User
Creates a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Email already exists"
}
```

---

### Login User
Authenticates a user and creates a session.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### Logout User
Ends the current user session.

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Cookie: session=<session-id>
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Change Password
Change the current user's password.

**Endpoint:** `PUT /api/auth/change-password`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "current_password": "OldPass@123",
  "new_password": "NewPass@456"
}
```

**Response (Success - 200):**
```json
{
  "message": "Password changed successfully"
}
```

**Response (Error - 401):**
```json
{
  "error": "Current password is incorrect"
}
```

---

### Get Current User
Gets information about the currently authenticated user.

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response (Success - 200):**
```json
{
  "user": {
    "user_id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "admin",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

---

### Change User Role
Changes a user's role. **Admin only**.

**Endpoint:** `PUT /api/auth/change-role`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "user_id": 5,
  "new_role": "admin"
}
```

**Response (Success - 200):**
```json
{
  "message": "User role updated successfully from employee to admin",
  "user": {
    "user_id": 5,
    "username": "johndoe",
    "email": "john@example.com",
    "old_role": "employee",
    "new_role": "admin"
  }
}
```

**Response (Error - 403):**
```json
{
  "error": "Unauthorized. Admin access required"
}
```

**Response (Error - 404):**
```json
{
  "error": "User not found"
}
```

**Response (Error - 400):**
```json
{
  "error": "Cannot change your own role"
}
```

**Notes:**
- Only users with `admin` role can change roles
- Admins cannot change their own role
- Valid roles: `admin`, `employee`

---

## 📦 Products & Inventory Endpoints

### Get All Products
Retrieves all products with optional filtering.

**Endpoint:** `GET /api/products`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `category` (optional): Filter by category
- `supplier` (optional): Filter by supplier
- `low_stock` (optional): 'true' to show only low stock items
- `search` (optional): Search by product name or SKU

**Example:**
```
GET /api/products?category=Electronics&low_stock=true&search=laptop
```

**Response (Success - 200):**
```json
{
  "products": [
    {
      "product_id": 1,
      "sku": "PROD-001",
      "product_name": "Laptop Dell XPS 15",
      "description": "15-inch laptop with 16GB RAM",
      "category": "Electronics",
      "supplier": "TechSupply Inc",
      "unit_price": 1299.99,
      "quantity_in_stock": 5,
      "min_stock_level": 10,
      "unit_of_measure": "units",
      "is_active": true,
      "is_low_stock": true,
      "created_at": "2026-02-22T10:00:00",
      "updated_at": "2026-02-22T10:00:00"
    }
  ],
  "total": 1
}
```

---

### Get Single Product
Retrieves details of a specific product.

**Endpoint:** `GET /api/products/<product_id>`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response (Success - 200):**
```json
{
  "product": {
    "product_id": 1,
    "sku": "PROD-001",
    "product_name": "Laptop Dell XPS 15",
    "description": "15-inch laptop with 16GB RAM",
    "category": "Electronics",
    "supplier": "TechSupply Inc",
    "unit_price": 1299.99,
    "quantity_in_stock": 5,
    "min_stock_level": 10,
    "unit_of_measure": "units",
    "is_active": true,
    "is_low_stock": true,
    "created_at": "2026-02-22T10:00:00",
    "updated_at": "2026-02-22T10:00:00"
  }
}
```

**Response (Error - 404):**
```json
{
  "error": "Product not found"
}
```

---

### Create Product
Creates a new product in the inventory.

**Endpoint:** `POST /api/products`

**Headers:**
```
Authorization: Bearer <access-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "sku": "PROD-001",
  "product_name": "Laptop Dell XPS 15",
  "description": "15-inch laptop with 16GB RAM",
  "category": "Electronics",
  "supplier": "TechSupply Inc",
  "unit_price": 1299.99,
  "quantity_in_stock": 10,
  "min_stock_level": 5,
  "unit_of_measure": "units"
}
```

**Response (Success - 201):**
```json
{
  "message": "Product created successfully",
  "product": {
    "product_id": 1,
    "sku": "PROD-001",
    "product_name": "Laptop Dell XPS 15",
    "category": "Electronics",
    "supplier": "TechSupply Inc",
    "unit_price": 1299.99,
    "quantity_in_stock": 10,
    "min_stock_level": 5
  }
}
```

**Response (Error - 400):**
```json
{
  "error": "Product with SKU PROD-001 already exists"
}
```

**Notes:**
- SKU must be unique and can only contain letters, numbers, hyphens, and underscores
- All required fields: sku, product_name, category, supplier, unit_price
- Initial quantity_in_stock defaults to 0 if not provided
- Automatically creates a stock movement record if initial quantity > 0

---

### Update Product
Updates product details (excludes stock quantity).

**Endpoint:** `PUT /api/products/<product_id>`

**Headers:**
```
Authorization: Bearer <access-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "product_name": "Laptop Dell XPS 15 Pro",
  "description": "Updated description",
  "unit_price": 1499.99,
  "min_stock_level": 8
}
```

**Response (Success - 200):**
```json
{
  "message": "Product updated successfully"
}
```

**Notes:**
- Use `/api/products/<product_id>/stock` endpoint to update stock quantity
- Updateable fields: product_name, description, category, supplier, unit_price, min_stock_level, unit_of_measure

---

### Delete Product
Soft deletes a product (admin only).

**Endpoint:** `DELETE /api/products/<product_id>`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response (Success - 200):**
```json
{
  "message": "Product deleted successfully"
}
```

**Response (Error - 403):**
```json
{
  "error": "Unauthorized. Admin access required"
}
```

**Notes:**
- Only admins can delete products
- This is a soft delete - product is marked as inactive but not removed from database

---

## 📊 Stock Management Endpoints

### Update Product Stock
Updates stock quantity with movement tracking.

**Endpoint:** `PUT /api/products/<product_id>/stock`

**Headers:**
```
Authorization: Bearer <access-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "movement_type": "stock-in",
  "quantity": 20,
  "reference_number": "PO-12345",
  "notes": "Received from supplier"
}
```

**Response (Success - 200):**
```json
{
  "message": "Stock updated successfully",
  "movement": {
    "movement_type": "stock-in",
    "quantity": 20,
    "previous_quantity": 5,
    "new_quantity": 25
  }
}
```

**Movement Types:**
- `stock-in`: Receive inventory (purchase, returns)
- `stock-out`: Reduce inventory (sales, damage, use)
- `adjustment`: Manual correction

**Response (Error - 400):**
```json
{
  "error": "Insufficient stock. Cannot reduce stock below 0"
}
```

---

### Get Stock Movement History
Retrieves stock movement history for a product.

**Endpoint:** `GET /api/products/<product_id>/movements`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response (Success - 200):**
```json
{
  "movements": [
    {
      "movement_id": 1,
      "product_id": 1,
      "movement_type": "stock-in",
      "quantity": 20,
      "previous_quantity": 5,
      "new_quantity": 25,
      "reference_number": "PO-12345",
      "notes": "Received from supplier",
      "created_at": "2026-02-22T10:00:00",
      "created_by": 1
    }
  ],
  "total": 1
}
```

---

## 🏷️ Categories & Suppliers Endpoints

### Get All Categories
Retrieves all unique product categories.

**Endpoint:** `GET /api/categories`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response (Success - 200):**
```json
{
  "categories": [
    "Electronics",
    "Office Supplies",
    "Furniture"
  ]
}
```

---

### Get All Suppliers
Retrieves all unique suppliers.

**Endpoint:** `GET /api/suppliers`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response (Success - 200):**
```json
{
  "suppliers": [
    "TechSupply Inc",
    "Office World",
    "Furniture Plus"
  ]
}
```

---

**Notes:**

### Refresh Token
Refreshes the access token.

**Endpoint:** `POST /api/auth/refresh`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response (Success - 200):**
```json
{
  "access_token": "new.jwt.token"
}
```

---

### Get Current User
Retrieves the currently authenticated user's information.

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Cookie: session=<session-id>
```

**Response (Success - 200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

## 📦 Products Endpoints

### Get All Products
Retrieves a list of all products.

**Endpoint:** `GET /api/products`

**Query Parameters:**
- `category` (optional): Filter by category
- `search` (optional): Search by name or SKU

**Example:**
```
GET /api/products?category=Electronics&search=laptop
```

**Response (Success - 200):**
```json
{
  "success": true,
  "products": [
    {
      "id": 1,
      "sku": "LAP001",
      "name": "Dell Laptop",
      "description": "15-inch laptop with 16GB RAM",
      "category": "Electronics",
      "price": 50000,
      "quantity": 10,
      "reorder_level": 5,
      "supplier_id": 1,
      "created_at": "2026-02-13T10:00:00",
      "updated_at": "2026-02-13T10:00:00"
    }
  ],
  "total": 1
}
```

---

### Get Single Product
Retrieves details of a specific product.

**Endpoint:** `GET /api/products/<id>`

**Example:**
```
GET /api/products/1
```

**Response (Success - 200):**
```json
{
  "success": true,
  "product": {
    "id": 1,
    "sku": "LAP001",
    "name": "Dell Laptop",
    "description": "15-inch laptop with 16GB RAM",
    "category": "Electronics",
    "price": 50000,
    "quantity": 10,
    "reorder_level": 5,
    "supplier_id": 1,
    "created_at": "2026-02-13T10:00:00",
    "updated_at": "2026-02-13T10:00:00"
  }
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "message": "Product not found"
}
```

---

### Add Product
Creates a new product in the inventory.

**Endpoint:** `POST /api/products`

**Headers:**
```
Content-Type: application/json
Cookie: session=<session-id>
```

**Request Body:**
```json
{
  "sku": "LAP001",
  "name": "Dell Laptop",
  "description": "15-inch laptop with 16GB RAM",
  "category": "Electronics",
  "price": 50000,
  "quantity": 10,
  "reorder_level": 5,
  "supplier_id": 1
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Product added successfully",
  "product": {
    "id": 1,
    "sku": "LAP001",
    "name": "Dell Laptop"
  }
}
```

---

### Update Product
Updates an existing product.

**Endpoint:** `PUT /api/products/<id>`

**Headers:**
```
Content-Type: application/json
Cookie: session=<session-id>
```

**Request Body:**
```json
{
  "name": "Dell Laptop Pro",
  "price": 55000,
  "quantity": 15
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "product": {
    "id": 1,
    "name": "Dell Laptop Pro",
    "price": 55000
  }
}
```

---

### Delete Product
Deletes a product from the inventory.

**Endpoint:** `DELETE /api/products/<id>`

**Headers:**
```
Cookie: session=<session-id>
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

### Search Products
Searches products by keyword.

**Endpoint:** `GET /api/products/search`

**Query Parameters:**
- `q`: Search query (required)

**Example:**
```
GET /api/products/search?q=laptop
```

**Response (Success - 200):**
```json
{
  "success": true,
  "products": [
    {
      "id": 1,
      "sku": "LAP001",
      "name": "Dell Laptop",
      "category": "Electronics",
      "price": 50000,
      "quantity": 10
    }
  ],
  "total": 1
}
```

---

## 📊 Inventory Endpoints

### Update Stock Level
Updates the quantity of a product.

**Endpoint:** `PUT /api/inventory/<id>/stock`

**Headers:**
```
Content-Type: application/json
Cookie: session=<session-id>
```

**Request Body:**
```json
{
  "quantity": 20,
  "reason": "Stock replenishment"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Stock updated successfully",
  "product": {
    "id": 1,
    "name": "Dell Laptop",
    "previous_quantity": 10,
    "new_quantity": 20
  }
}
```

---

### Get Low Stock Items
Retrieves products with stock below reorder level.

**Endpoint:** `GET /api/inventory/low-stock`

**Response (Success - 200):**
```json
{
  "success": true,
  "low_stock_items": [
    {
      "id": 2,
      "sku": "MOU001",
      "name": "Wireless Mouse",
      "quantity": 3,
      "reorder_level": 10,
      "difference": -7
    }
  ],
  "total": 1
}
```

---

## 📝 Orders Endpoints

### Get All Orders
Retrieves all orders.

**Endpoint:** `GET /api/orders`

**Query Parameters:**
- `status` (optional): Filter by status (pending, completed, cancelled)

**Response (Success - 200):**
```json
{
  "success": true,
  "orders": [
    {
      "id": 1,
      "order_number": "ORD-001",
      "user_id": 1,
      "total_amount": 55000,
      "status": "pending",
      "order_date": "2026-02-13T10:00:00",
      "items": [
        {
          "product_id": 1,
          "product_name": "Dell Laptop",
          "quantity": 1,
          "price": 50000
        }
      ]
    }
  ],
  "total": 1
}
```

---

### Create Order
Creates a new order.

**Endpoint:** `POST /api/orders`

**Headers:**
```
Content-Type: application/json
Cookie: session=<session-id>
```

**Request Body:**
```json
{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "products": [
    {
      "product_id": 1,
      "quantity": 2
    },
    {
      "product_id": 2,
      "quantity": 1
    }
  ]
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "id": 1,
    "order_number": "ORD-001",
    "total_amount": 105000,
    "status": "pending"
  }
}
```

---

### Update Order Status
Updates the status of an order.

**Endpoint:** `PUT /api/orders/<id>/status`

**Headers:**
```
Content-Type: application/json
Cookie: session=<session-id>
```

**Request Body:**
```json
{
  "status": "completed"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Order status updated",
  "order": {
    "id": 1,
    "order_number": "ORD-001",
    "status": "completed"
  }
}
```

---

## 🏢 Suppliers Endpoints

### Get All Suppliers
Retrieves all suppliers.

**Endpoint:** `GET /api/suppliers`

**Response (Success - 200):**
```json
{
  "success": true,
  "suppliers": [
    {
      "id": 1,
      "name": "Tech Suppliers Ltd",
      "contact_person": "Jane Smith",
      "email": "jane@techsuppliers.com",
      "phone": "+91-9876543210",
      "address": "123 Tech Street, Bangalore",
      "created_at": "2026-02-13T10:00:00"
    }
  ],
  "total": 1
}
```

---

### Add Supplier
Creates a new supplier.

**Endpoint:** `POST /api/suppliers`

**Headers:**
```
Content-Type: application/json
Cookie: session=<session-id>
```

**Request Body:**
```json
{
  "name": "Tech Suppliers Ltd",
  "contact_person": "Jane Smith",
  "email": "jane@techsuppliers.com",
  "phone": "+91-9876543210",
  "address": "123 Tech Street, Bangalore"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Supplier added successfully",
  "supplier": {
    "id": 1,
    "name": "Tech Suppliers Ltd"
  }
}
```

---

## 📈 Reports Endpoints

### Dashboard Statistics
Retrieves key metrics for the dashboard.

**Endpoint:** `GET /api/reports/dashboard`

**Headers:**
```
Cookie: session=<session-id>
```

**Response (Success - 200):**
```json
{
  "success": true,
  "statistics": {
    "total_products": 150,
    "low_stock_items": 12,
    "total_orders": 45,
    "pending_orders": 8,
    "total_revenue": 2500000,
    "total_suppliers": 15
  }
}
```

---

### Sales Report
Generates a sales report for a date range.

**Endpoint:** `GET /api/reports/sales`

**Query Parameters:**
- `start_date` (optional): Start date (YYYY-MM-DD)
- `end_date` (optional): End date (YYYY-MM-DD)

**Example:**
```
GET /api/reports/sales?start_date=2026-01-01&end_date=2026-02-13
```

**Response (Success - 200):**
```json
{
  "success": true,
  "report": {
    "period": {
      "start": "2026-01-01",
      "end": "2026-02-13"
    },
    "total_sales": 2500000,
    "total_orders": 45,
    "average_order_value": 55555,
    "top_products": [
      {
        "product_id": 1,
        "product_name": "Dell Laptop",
        "units_sold": 25,
        "revenue": 1250000
      }
    ]
  }
}
```

---

### Inventory Report
Generates an inventory summary report.

**Endpoint:** `GET /api/reports/inventory`

**Response (Success - 200):**
```json
{
  "success": true,
  "report": {
    "total_products": 150,
    "total_stock_value": 5000000,
    "low_stock_items": 12,
    "out_of_stock_items": 3,
    "categories": [
      {
        "category": "Electronics",
        "product_count": 50,
        "total_value": 2500000
      }
    ]
  }
}
```

---

### Export Report to CSV
Exports a report in CSV format.

**Endpoint:** `GET /api/reports/export/csv`

**Query Parameters:**
- `type`: Report type (sales, inventory, products)
- `start_date` (optional): Start date
- `end_date` (optional): End date

**Example:**
```
GET /api/reports/export/csv?type=sales&start_date=2026-01-01&end_date=2026-02-13
```

**Response (Success - 200):**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="sales_report_2026-02-13.csv"

Order Number,Date,Customer,Amount,Status
ORD-001,2026-02-13,John Doe,55000,completed
```

---

## ⚠️ Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid request data",
  "errors": {
    "field_name": "Error description"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "An internal server error occurred"
}
```

---

## 📝 Notes

- All dates are in ISO 8601 format
- All prices are in INR (Indian Rupees)
- Authentication is required for most endpoints
- Use session cookies for authentication
- CORS is enabled for `http://localhost:5000`

---

**Last Updated:** February 13, 2026
