# Smart Inventory Management System - Team File Assignments

## Team Structure

### Team Members & Branches
- **Dhanush** - Project Lead & Backend - Branch: `dhanush`
- **Tharun** - Backend & Database - Branch: `tharun`
- **Mageswari** - Backend & Database - Branch: `mageswari`
- **Indra** - Backend & Database - Branch: `indra`
- **Akash** - Frontend Development - Branch: `akash`
- **Kazi** - Frontend Development - Branch: `kazi`
- **Punyashree** - Frontend Development - Branch: `punyashree`

---

## Development Strategy

### Phase 1: Backend Development (PRIORITY)
**Backend team focuses on building APIs and database first**

### Phase 2: Frontend Development
**Frontend team builds UI and integrates with backend APIs**

### 🔧 Backend Team (Phase 1)
**Members:** Dhanush (Lead), Tharun, Mageswari, Indra

**Focus:** Build Flask REST APIs, SQLite database, authentication, business logic

### 💻 Frontend Team (Phase 2)
**Members:** Akash, Kazi, Punyashree

**Focus:** Build HTML pages, CSS styling, JavaScript functionality, integrate with backend

---

## File Assignments

### 🔧 Dhanush (Project Lead) - Core Backend & Authentication
**Branch:** `dhanush`  
**Team:** Backend

#### Your Files:
- `app.py` - Flask application setup and configuration
- `config.py` - Environment variables and settings
- `backend/__init__.py` - Backend package initialization
- `backend/routes.py` - Main route registration
- `backend/auth.py` - Authentication and authorization logic
- `backend/models.py` - Database models (User, Product, Order, etc.)
- `database/database.py` - SQLite database connection and initialization
- `database/schema.sql` - Database schema definitions

#### Key Responsibilities:
- Flask application setup with CORS
- SQLite database connection and initialization
- Database schema design (Users, Products, Inventory, Orders, Suppliers)
- User authentication system (Login/Register)
- Session management
- Password hashing and security
- User authorization middleware
- Error handling and validation
- Integration of all routes and services
- Final code review and merging

#### Features to Implement:
- ✅ Flask app with CORS middleware
- ✅ SQLite database connection with error handling
- ✅ Database models (User, Product, Inventory, Order, Supplier)
- ✅ User registration endpoint (POST /api/auth/register)
- ✅ User login endpoint (POST /api/auth/login)
- ✅ User logout endpoint (POST /api/auth/logout)
- ✅ Session management with Flask sessions
- ✅ Password hashing with werkzeug.security
- ✅ Protected route decorator
- ✅ Database initialization script

#### Git Commands:
```bash
# Initial setup
git clone <repository-url>
cd "Smart Inventory Management System"
git checkout dhanush

# Set up Python environment
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Daily workflow
git checkout dhanush
git pull origin main
# ... work on your files ...
git add .
git commit -m "Implemented Flask setup with SQLite and authentication"
git push origin dhanush

# When merging all branches to main (Team Lead only)
git checkout main
git pull origin main
git merge dhanush
git merge tharun
git merge mageswari
git merge indra
git push origin main
```

---

### 🔧 Tharun - Inventory Management & Product Operations
**Branch:** `tharun`  
**Team:** Backend & Database

#### Your Files:
- `backend/inventory.py` - Inventory management logic
- `database/seed_data.sql` - Sample data for testing
- `backend/utils.py` - Helper utilities (validation, formatting)

#### Key Responsibilities:
- Inventory CRUD operations
- Product management endpoints
- Stock level tracking
- Low stock alerts
- Product categories management
- Barcode/SKU generation
- Inventory adjustments (add/remove stock)
- Product search and filtering
- Inventory valuation calculations
- Data validation utilities

#### Features to Implement:
- ✅ Add product endpoint (POST /api/products)
- ✅ Update product endpoint (PUT /api/products/<id>)
- ✅ Delete product endpoint (DELETE /api/products/<id>)
- ✅ Get all products endpoint (GET /api/products)
- ✅ Get single product endpoint (GET /api/products/<id>)
- ✅ Search products endpoint (GET /api/products/search?q=keyword)
- ✅ Update stock levels endpoint (PUT /api/inventory/<id>/stock)
- ✅ Get low stock items endpoint (GET /api/inventory/low-stock)
- ✅ Product category management
- ✅ SKU/Barcode generation logic
- ✅ Stock adjustment tracking
- ✅ Helper utilities (validators, formatters)

#### Git Commands:
```bash
# Initial setup
git clone <repository-url>
cd "Smart Inventory Management System"
git checkout tharun

# Set up Python environment
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Daily workflow
git checkout tharun
git pull origin main
# ... work on your files ...
git add .
git commit -m "Implemented inventory management with stock tracking"
git push origin tharun
```

---

### 🔧 Mageswari - Reports & Analytics
**Branch:** `mageswari`  
**Team:** Backend & Database

#### Your Files:
- `backend/reports.py` - Reports generation logic and endpoints

#### Key Responsibilities:
- Sales reports generation
- Inventory reports (stock levels, valuation)
- Product performance analytics
- Supplier reports
- Order history reports
- Date range filtering
- Export reports to CSV/PDF
- Dashboard statistics
- Trend analysis
- Real-time inventory summary

#### Features to Implement:
- ✅ Sales report endpoint (GET /api/reports/sales)
- ✅ Inventory summary endpoint (GET /api/reports/inventory)
- ✅ Low stock report endpoint (GET /api/reports/low-stock)
- ✅ Product performance endpoint (GET /api/reports/products)
- ✅ Supplier reports endpoint (GET /api/reports/suppliers)
- ✅ Dashboard statistics endpoint (GET /api/reports/dashboard)
- ✅ Date range filtering
- ✅ Export to CSV functionality
- ✅ Monthly/Weekly/Daily reports
- ✅ Top selling products
- ✅ Revenue analytics
- ✅ Profit margin calculations

#### Git Commands:
```bash
# Initial setup
git clone <repository-url>
cd "Smart Inventory Management System"
git checkout mageswari

# Set up Python environment
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Daily workflow
git checkout mageswari
git pull origin main
# ... work on your files ...
git add .
git commit -m "Implemented reports and analytics endpoints"
git push origin mageswari
```

---

### 🔧 Indra - Order Management & Supplier Operations
**Branch:** `indra`  
**Team:** Backend & Database

#### Your Files:
- (These endpoints will be added to existing route files)
- Order management endpoints in `backend/routes.py`
- Supplier management logic

#### Key Responsibilities:
- Order creation and management
- Order status tracking (Pending, Completed, Cancelled)
- Purchase order management
- Supplier CRUD operations
- Supplier contact management
- Order-to-inventory integration
- Order history tracking
- Invoice generation
- Payment status tracking
- Supplier performance tracking

#### Features to Implement:
- ✅ Create order endpoint (POST /api/orders)
- ✅ Get all orders endpoint (GET /api/orders)
- ✅ Get order by ID endpoint (GET /api/orders/<id>)
- ✅ Update order status endpoint (PUT /api/orders/<id>/status)
- ✅ Cancel order endpoint (DELETE /api/orders/<id>)
- ✅ Add supplier endpoint (POST /api/suppliers)
- ✅ Get all suppliers endpoint (GET /api/suppliers)
- ✅ Update supplier endpoint (PUT /api/suppliers/<id>)
- ✅ Delete supplier endpoint (DELETE /api/suppliers/<id>)
- ✅ Purchase order creation
- ✅ Order-inventory stock updates
- ✅ Invoice generation logic
- ✅ Payment tracking

#### Git Commands:
```bash
# Initial setup
git clone <repository-url>
cd "Smart Inventory Management System"
git checkout indra

# Set up Python environment
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Daily workflow
git checkout indra
git pull origin main
# ... work on your files ...
git add .
git commit -m "Implemented order and supplier management"
git push origin indra
```

---

### 💻 Akash - Dashboard & Product Management UI
**Branch:** `akash`  
**Team:** Frontend

#### Your Files:
- `frontend/index.html` - Landing/Home page
- `frontend/dashboard.html` - Main dashboard page
- `frontend/inventory.html` - Inventory management page
- `frontend/css/style.css` - Main stylesheet
- `frontend/css/dashboard.css` - Dashboard-specific styles
- `frontend/js/main.js` - Main JavaScript file
- `frontend/js/dashboard.js` - Dashboard functionality

#### Key Responsibilities:
- Landing page design
- Dashboard UI with statistics cards
- Inventory table with CRUD operations
- Product add/edit forms
- Product search functionality
- Stock level indicators
- Responsive design
- Navigation menu
- API integration for products
- Data tables and pagination

#### Features to Implement:
- ✅ Landing page with navigation
- ✅ Dashboard with statistics cards (total products, low stock, orders)
- ✅ Inventory table with product list
- ✅ Add product modal/form
- ✅ Edit product functionality
- ✅ Delete product confirmation
- ✅ Search and filter products
- ✅ Stock level color indicators (red for low stock)
- ✅ Responsive navigation bar
- ✅ API integration with fetch/axios
- ✅ Real-time inventory updates
- ✅ Loading states and error handling

#### Git Commands:
```bash
# Initial setup
git clone <repository-url>
cd "Smart Inventory Management System"
git checkout akash

# Daily workflow
git checkout akash
git pull origin main
# ... work on your files ...
git add .
git commit -m "Implemented dashboard UI with inventory table"
git push origin akash
```

---

### 💻 Kazi - Authentication & Reports UI
**Branch:** `kazi`  
**Team:** Frontend

#### Your Files:
- `frontend/login.html` - Login page
- `frontend/reports.html` - Reports and analytics page
- `frontend/css/inventory.css` - Inventory page styles
- `frontend/css/reports.css` - Reports page styles
- `frontend/js/auth.js` - Authentication logic
- `frontend/js/reports.js` - Reports functionality

#### Key Responsibilities:
- Login/Register page design
- User authentication flow
- Session management (localStorage/cookies)
- Reports page UI
- Charts and graphs for analytics
- Report filtering (date range, category)
- Export reports functionality
- Protected routes (redirect if not logged in)
- Form validation
- Error messages display

#### Features to Implement:
- ✅ Login page design
- ✅ Registration form
- ✅ Login/register form validation
- ✅ API integration for authentication
- ✅ Store JWT token/session
- ✅ Logout functionality
- ✅ Protected route checking
- ✅ Reports page with filters
- ✅ Sales charts (Chart.js or similar)
- ✅ Inventory analytics visualization
- ✅ Date range picker
- ✅ Export to CSV button
- ✅ Loading states for reports

#### Git Commands:
```bash
# Initial setup
git clone <repository-url>
cd "Smart Inventory Management System"
git checkout kazi

# Daily workflow
git checkout kazi
git pull origin main
# ... work on your files ...
git add .
git commit -m "Implemented authentication UI and reports page"
git push origin kazi
```

---

### 💻 Punyashree - Order & Supplier Management UI
**Branch:** `punyashree`  
**Team:** Frontend

#### Your Files:
- Additional pages for orders and suppliers (to be created)
- `frontend/orders.html` - Orders management page
- `frontend/suppliers.html` - Suppliers management page
- `frontend/js/inventory.js` - Inventory page functionality
- `frontend/js/utils.js` - Utility functions (date formatting, validation)

#### Key Responsibilities:
- Orders page UI
- Create new order form
- Order status tracking display
- Order history table
- Suppliers page UI
- Add/edit supplier forms
- Supplier contact information display
- Utility functions for frontend
- Date/time formatting
- Input validation helpers
- API error handling
- Toast notifications

#### Features to Implement:
- ✅ Orders page with orders list
- ✅ Create order form
- ✅ Order status badges (Pending, Completed, Cancelled)
- ✅ Order details modal
- ✅ Update order status functionality
- ✅ Suppliers page with supplier list
- ✅ Add supplier form
- ✅ Edit supplier functionality
- ✅ Delete supplier confirmation
- ✅ Utility functions (formatDate, formatCurrency)
- ✅ Form validation helpers
- ✅ Toast notification system
- ✅ API error handling wrapper

#### Git Commands:
```bash
# Initial setup
git clone <repository-url>
cd "Smart Inventory Management System"
git checkout punyashree

# Daily workflow
git checkout punyashree
git pull origin main
# ... work on your files ...
git add .
git commit -m "Implemented orders and suppliers UI"
git push origin punyashree
```

---

## Backend Development Checklist

### Phase 1 Tasks (Backend Priority)

#### Core Infrastructure (Dhanush)
- [ ] Flask app setup with CORS
- [ ] SQLite database connection
- [ ] Database schema (Users, Products, Inventory, Orders, Suppliers)
- [ ] User authentication system
- [ ] Password hashing
- [ ] Session management
- [ ] Protected route decorator
- [ ] Error handling middleware

#### Inventory & Products (Tharun)
- [ ] Product CRUD endpoints
- [ ] Inventory tracking endpoints
- [ ] Stock level management
- [ ] Low stock alerts
- [ ] Product search
- [ ] Category management
- [ ] SKU generation
- [ ] Helper utilities

#### Reports & Analytics (Mageswari)
- [ ] Sales reports endpoint
- [ ] Inventory reports endpoint
- [ ] Dashboard statistics
- [ ] Product performance analytics
- [ ] Supplier reports
- [ ] Export to CSV functionality
- [ ] Date range filtering
- [ ] Trend analysis

#### Orders & Suppliers (Indra)
- [ ] Order CRUD endpoints
- [ ] Order status tracking
- [ ] Supplier CRUD endpoints
- [ ] Purchase order management
- [ ] Order-inventory integration
- [ ] Invoice generation
- [ ] Payment tracking
- [ ] Supplier performance tracking

---

## Backend Dependencies (requirements.txt)

```txt
Flask==3.0.0
Flask-CORS==4.0.0
python-dotenv==1.0.0
Werkzeug==3.0.1
```

---

## Environment Variables (.env file)

```bash
# Flask Configuration
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here-use-long-random-string

# Database Configuration
DATABASE_PATH=database/inventory.db

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5000,http://127.0.0.1:5000

# Session Configuration
SESSION_TYPE=filesystem
PERMANENT_SESSION_LIFETIME=3600
```

---

## Quick Git Workflow Reference

### Daily Workflow for Everyone

```bash
# 1. Start your day
git checkout <your-branch>
git pull origin main

# 2. Work on your assigned files
# ... code, test, debug ...

# 3. Check what you changed
git status

# 4. Stage your changes
git add .

# 5. Commit with descriptive message
git commit -m "Implemented [feature name]"

# 6. Push to your branch
git push origin <your-branch>
```

### Common Git Commands

| Command | Purpose |
|---------|---------|
| `git status` | See modified files |
| `git add .` | Stage all changes |
| `git commit -m "message"` | Commit with message |
| `git push origin <branch>` | Push to your branch |
| `git pull origin main` | Get latest from main |
| `git checkout <branch>` | Switch branches |
| `git log --oneline` | View commit history |
| `git branch` | See all branches |

---

## Backend Setup Instructions

### Prerequisites
- Python 3.8+
- Git installed

### Setup Steps

1. **Clone Repository**
```bash
git clone <repository-url>
cd "Smart Inventory Management System"
```

2. **Switch to Your Branch**
```bash
git checkout <your-branch-name>
```

3. **Set Up Python Environment**
```bash
python -m venv venv
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # Mac/Linux
```

4. **Install Dependencies**
```bash
pip install -r requirements.txt
```

5. **Create .env File**
```bash
# Copy example file
copy .env.example .env  # Windows
# or
cp .env.example .env  # Mac/Linux

# Edit .env and add your configuration
```

6. **Initialize Database**
```bash
python -c "from database.database import init_db; init_db()"
```

7. **Run Flask Server**
```bash
python app.py
```

Server will run at: `http://localhost:5000`

---

## API Endpoints Overview

### Authentication (Dhanush)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Products & Inventory (Tharun)
- `POST /api/products` - Add new product
- `GET /api/products` - Get all products
- `GET /api/products/<id>` - Get single product
- `PUT /api/products/<id>` - Update product
- `DELETE /api/products/<id>` - Delete product
- `GET /api/products/search?q=keyword` - Search products
- `PUT /api/inventory/<id>/stock` - Update stock levels
- `GET /api/inventory/low-stock` - Get low stock items

### Reports (Mageswari)
- `GET /api/reports/sales` - Sales report
- `GET /api/reports/inventory` - Inventory summary
- `GET /api/reports/low-stock` - Low stock report
- `GET /api/reports/products` - Product performance
- `GET /api/reports/suppliers` - Supplier reports
- `GET /api/reports/dashboard` - Dashboard statistics
- `GET /api/reports/export/csv` - Export report to CSV

### Orders (Indra)
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders
- `GET /api/orders/<id>` - Get single order
- `PUT /api/orders/<id>/status` - Update order status
- `DELETE /api/orders/<id>` - Cancel order

### Suppliers (Indra)
- `POST /api/suppliers` - Add new supplier
- `GET /api/suppliers` - Get all suppliers
- `GET /api/suppliers/<id>` - Get single supplier
- `PUT /api/suppliers/<id>` - Update supplier
- `DELETE /api/suppliers/<id>` - Delete supplier

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Products Table
```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    price REAL NOT NULL,
    quantity INTEGER DEFAULT 0,
    reorder_level INTEGER DEFAULT 10,
    supplier_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);
```

### Orders Table
```sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Suppliers Table
```sql
CREATE TABLE suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Testing Your Backend

### Using Postman/Thunder Client

1. **Test Registration**
```json
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

2. **Test Login**
```json
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

3. **Test Add Product**
```json
POST http://localhost:5000/api/products
Content-Type: application/json

{
  "name": "Laptop",
  "sku": "LAP001",
  "description": "Dell Laptop",
  "category": "Electronics",
  "price": 50000,
  "quantity": 10,
  "reorder_level": 5
}
```

4. **Test Create Order**
```json
POST http://localhost:5000/api/orders
Content-Type: application/json

{
  "products": [
    {"product_id": 1, "quantity": 2}
  ]
}
```

---

## Frontend Setup Instructions

### For Frontend Team

1. **File Structure**
```
frontend/
├── index.html          # Landing page (Akash)
├── login.html          # Login page (Kazi)
├── dashboard.html      # Dashboard (Akash)
├── inventory.html      # Inventory page (Akash)
├── reports.html        # Reports page (Kazi)
├── orders.html         # Orders page (Punyashree)
├── suppliers.html      # Suppliers page (Punyashree)
├── css/
│   ├── style.css       # Main styles (Akash)
│   ├── dashboard.css   # Dashboard styles (Akash)
│   ├── inventory.css   # Inventory styles (Kazi)
│   └── reports.css     # Reports styles (Kazi)
└── js/
    ├── main.js         # Main JS (Akash)
    ├── auth.js         # Auth logic (Kazi)
    ├── dashboard.js    # Dashboard JS (Akash)
    ├── inventory.js    # Inventory JS (Punyashree)
    ├── reports.js      # Reports JS (Kazi)
    └── utils.js        # Utilities (Punyashree)
```

2. **Open HTML Files**
```bash
# Navigate to frontend folder
cd frontend

# Open in browser (any method)
# - Double click HTML files
# - Use Live Server extension in VS Code
# - Open with browser directly
```

3. **API Integration**
```javascript
// Example: Fetch products
const API_URL = 'http://localhost:5000/api';

async function getProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}
```

---

## Communication & Collaboration

### Daily Standup (Recommended)
- What did you complete yesterday?
- What will you work on today?
- Any blockers?

### Code Review Process
1. Push to your branch
2. Create Pull Request (optional)
3. Tag Dhanush for review
4. Dhanush merges to main

### Naming Conventions
- **Files**: lowercase with underscores (`inventory_management.py`)
- **Functions**: snake_case (`get_all_products()`)
- **Classes**: PascalCase (`ProductModel`, `OrderService`)
- **Constants**: UPPER_SNAKE_CASE (`DATABASE_PATH`, `MAX_STOCK`)
- **Endpoints**: kebab-case (`/api/products`, `/api/auth/login`)
- **Variables**: snake_case (`product_id`, `order_data`)

---

## Important Guidelines

### ⚠️ DO NOT:
- Push directly to `main` branch
- Modify files not assigned to you
- Commit without testing
- Share passwords in code
- Delete others' work
- Commit `.env` file
- Force push (`git push -f`)

### ✅ DO:
- Work only on your assigned files
- Pull from main regularly (daily)
- Test before committing
- Write clear commit messages
- Ask for help when stuck
- Document your code with comments
- Handle errors properly
- Use try-except blocks in Python
- Validate user inputs
- Log important operations

---

## Troubleshooting

### Python Environment Issues
```bash
# If venv doesn't activate
python -m venv venv --clear
venv\Scripts\activate

# If packages don't install
pip install --upgrade pip
pip install -r requirements.txt --no-cache-dir
```

### SQLite Database Issues
```bash
# Recreate database
python -c "from database.database import init_db; init_db()"

# Check if database file exists
ls database/inventory.db  # Mac/Linux
dir database\inventory.db  # Windows
```

### Flask Server Won't Start
```bash
# Check if port 5000 is already in use
# On Windows:
netstat -ano | findstr :5000

# Kill process if needed
taskkill /PID <process-id> /F

# Try different port
python app.py --port 5001
```

### Git Merge Conflicts
```bash
# Update from main first
git checkout <your-branch>
git pull origin main

# If conflicts occur
# 1. Open conflicted files
# 2. Look for <<<<<<< and >>>>>>>
# 3. Choose correct code
# 4. Remove conflict markers
git add .
git commit -m "Resolved merge conflicts"
git push origin <your-branch>
```

### CORS Errors (Frontend)
```python
# Make sure CORS is enabled in app.py
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
```

---

## Timeline Suggestion

### Day 1 - Setup & Foundation
- **All**: Clone repository, setup environment
- **Dhanush**: Flask setup, SQLite connection, basic models
- **Tharun**: Product model structure
- **Mageswari**: Reports endpoints structure
- **Indra**: Order model structure
- **Frontend Team**: HTML structure for pages

### Day 2 - Core Features
- **Dhanush**: Complete authentication system
- **Tharun**: Product CRUD operations
- **Mageswari**: Basic reports implementation
- **Indra**: Order creation logic
- **Akash**: Dashboard UI
- **Kazi**: Login page UI
- **Punyashree**: Orders page UI

### Day 3 - Advanced Features
- **Dhanush**: Session management, protected routes
- **Tharun**: Inventory tracking, low stock alerts
- **Mageswari**: Analytics and charts data
- **Indra**: Supplier management
- **Frontend**: API integration

### Day 4 - Integration & Testing
- **All Backend**: Test APIs, fix bugs
- **Dhanush**: Merge all backend branches
- **Frontend**: Complete API integration
- **All**: End-to-end testing

### Day 5 - Final Polish
- **All**: Bug fixes, UI polish
- **Dhanush**: Final deployment preparation
- **Frontend**: Responsive design fixes
- **All**: Documentation and comments

---

## Branch Structure
- `main` - Production code (Dhanush merges here)
- `dhanush` - Core backend & authentication
- `tharun` - Inventory & products
- `mageswari` - Reports & analytics
- `indra` - Orders & suppliers
- `akash` - Dashboard & inventory UI
- `kazi` - Authentication & reports UI
- `punyashree` - Orders & suppliers UI

---

## Tech Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Python 3.8+, Flask
- **Database**: SQLite
- **Version Control**: Git

---

**Focus on Backend First - Build Solid API Foundation! 🚀**

**Remember**: Quality over speed. Write clean, working code. Test before committing. Help each other when stuck.

**Good Luck Team! Let's build an amazing inventory system! 💪** 
