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
2. [Products](#products-endpoints)
3. [Inventory](#inventory-endpoints)
4. [Orders](#orders-endpoints)
5. [Suppliers](#suppliers-endpoints)
6. [Reports](#reports-endpoints)

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
