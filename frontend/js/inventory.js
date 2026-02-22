// Protect the inventory page
protectPage();

// Global state
let allProducts = [];
let categories = [];
let suppliers = [];
let currentUser = getCurrentUser();
let isAdmin = currentUser && currentUser.role === 'admin';

// Modal elements
const productModal = document.getElementById('product-modal');
const stockModal = document.getElementById('stock-modal');
const detailsModal = document.getElementById('details-modal');

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    setupRoleBasedUI();
    loadProducts();
    loadCategories();
    loadSuppliers();
    setupEventListeners();
});

// Setup role-based UI
function setupRoleBasedUI() {
    if (!isAdmin) {
        // Hide admin-only features for clients
        const addProductBtn = document.getElementById('add-product-btn');
        if (addProductBtn) {
            addProductBtn.style.display = 'none';
        }
        
        // Hide filters for clients (optional - you can keep this if clients should filter)
        // const filtersSection = document.querySelector('.filters-section');
        // if (filtersSection) filtersSection.style.display = 'none';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Add product button
    document.getElementById('add-product-btn').addEventListener('click', () => {
        openProductModal();
    });

    // Close modals
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Product form submit
    document.getElementById('product-form').addEventListener('submit', handleProductSubmit);

    // Stock form submit
    document.getElementById('stock-form').addEventListener('submit', handleStockSubmit);

    // Cancel buttons
    document.getElementById('cancel-btn').addEventListener('click', () => {
        productModal.style.display = 'none';
    });

    document.getElementById('cancel-stock-btn').addEventListener('click', () => {
        stockModal.style.display = 'none';
    });

    // Filters
    document.getElementById('search-input').addEventListener('input', applyFilters);
    document.getElementById('category-filter').addEventListener('change', applyFilters);
    document.getElementById('supplier-filter').addEventListener('change', applyFilters);
    document.getElementById('low-stock-filter').addEventListener('change', applyFilters);
    
    document.getElementById('clear-filters-btn').addEventListener('click', clearFilters);

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            logout();
        }
    });
}

// Load all products
async function loadProducts() {
    try {
        showLoading(true);
        const data = await apiCall('/products', 'GET');
        allProducts = data.products;
        renderProducts(allProducts);
        updateSummary();
        showLoading(false);
    } catch (error) {
        showLoading(false);
        showError('Failed to load products: ' + error.message, 'error-message-products');
    }
}

// Render products table
function renderProducts(products) {
    const tbody = document.getElementById('products-tbody');
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="no-data">No products found.</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(product => {
        // Build action buttons based on user role
        let actionButtons = `
            <button class="btn-action btn-view" onclick="viewProduct(${product.product_id})">View</button>
        `;
        
        // Admin-only buttons (clients only see View button)
        if (isAdmin) {
            actionButtons += `
                <button class="btn-action btn-stock" onclick="openStockModal(${product.product_id})">Stock</button>
                <button class="btn-action btn-edit" onclick="editProduct(${product.product_id})">Edit</button>
                <button class="btn-action btn-delete" onclick="deleteProduct(${product.product_id}, '${product.product_name}')">Delete</button>
            `;
        }
        
        return `
            <tr>
                <td><strong>${product.sku}</strong></td>
                <td>${product.product_name}</td>
                <td>${product.category}</td>
                <td>${product.supplier}</td>
                <td>$${parseFloat(product.unit_price).toFixed(2)}</td>
                <td>${product.quantity_in_stock} ${product.unit_of_measure}</td>
                <td>${product.min_stock_level}</td>
                <td>${getStatusBadge(product)}</td>
                <td>
                    <div class="action-buttons">
                        ${actionButtons}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Get status badge HTML
function getStatusBadge(product) {
    const qty = product.quantity_in_stock;
    const minLevel = product.min_stock_level;

    if (qty === 0) {
        return '<span class="status-badge out-of-stock">Out of Stock</span>';
    } else if (qty <= minLevel) {
        return '<span class="status-badge low-stock">Low Stock</span>';
    } else {
        return '<span class="status-badge in-stock">In Stock</span>';
    }
}

// Update summary
function updateSummary() {
    const total = allProducts.length;
    const lowStock = allProducts.filter(p => p.is_low_stock).length;
    
    document.getElementById('total-products').textContent = total;
    document.getElementById('low-stock-count').textContent = lowStock;
}

// Load categories for filter
async function loadCategories() {
    try {
        const data = await apiCall('/categories', 'GET');
        categories = data.categories;
        
        const categoryFilter = document.getElementById('category-filter');
        const categoriesList = document.getElementById('categories-list');
        
        categories.forEach(cat => {
            // Add to filter dropdown
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categoryFilter.appendChild(option);
            
            // Add to datalist for input
            const dataOption = document.createElement('option');
            dataOption.value = cat;
            categoriesList.appendChild(dataOption);
        });
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

// Load suppliers for filter
async function loadSuppliers() {
    try {
        const data = await apiCall('/suppliers', 'GET');
        suppliers = data.suppliers;
        
        const supplierFilter = document.getElementById('supplier-filter');
        const suppliersList = document.getElementById('suppliers-list');
        
        suppliers.forEach(sup => {
            // Add to filter dropdown
            const option = document.createElement('option');
            option.value = sup;
            option.textContent = sup;
            supplierFilter.appendChild(option);
            
            // Add to datalist for input
            const dataOption = document.createElement('option');
            dataOption.value = sup;
            suppliersList.appendChild(dataOption);
        });
    } catch (error) {
        console.error('Failed to load suppliers:', error);
    }
}

// Apply filters
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const categoryFilter = document.getElementById('category-filter').value;
    const supplierFilter = document.getElementById('supplier-filter').value;
    const lowStockOnly = document.getElementById('low-stock-filter').checked;

    let filtered = allProducts;

    // Search filter
    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.product_name.toLowerCase().includes(searchTerm) ||
            p.sku.toLowerCase().includes(searchTerm)
        );
    }

    // Category filter
    if (categoryFilter) {
        filtered = filtered.filter(p => p.category === categoryFilter);
    }

    // Supplier filter
    if (supplierFilter) {
        filtered = filtered.filter(p => p.supplier === supplierFilter);
    }

    // Low stock filter
    if (lowStockOnly) {
        filtered = filtered.filter(p => p.is_low_stock);
    }

    renderProducts(filtered);
}

// Clear all filters
function clearFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('category-filter').value = '';
    document.getElementById('supplier-filter').value = '';
    document.getElementById('low-stock-filter').checked = false;
    renderProducts(allProducts);
}

// Open product modal (add new)
function openProductModal(product = null) {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    const modalTitle = document.getElementById('modal-title');
    
    form.reset();
    document.getElementById('modal-error').style.display = 'none';
    
    if (product) {
        // Edit mode
        modalTitle.textContent = 'Edit Product';
        document.getElementById('product-id').value = product.product_id;
        document.getElementById('sku').value = product.sku;
        document.getElementById('sku').readOnly = true; // SKU shouldn't change
        document.getElementById('product-name').value = product.product_name;
        document.getElementById('description').value = product.description || '';
        document.getElementById('category').value = product.category;
        document.getElementById('supplier').value = product.supplier;
        document.getElementById('unit-price').value = product.unit_price;
        document.getElementById('quantity-in-stock').value = product.quantity_in_stock;
        document.getElementById('quantity-in-stock').readOnly = true; // Use stock modal for updates
        document.getElementById('min-stock-level').value = product.min_stock_level;
        document.getElementById('unit-of-measure').value = product.unit_of_measure;
    } else {
        // Add mode
        modalTitle.textContent = 'Add New Product';
        document.getElementById('sku').readOnly = false;
        document.getElementById('quantity-in-stock').readOnly = false;
    }
    
    modal.style.display = 'block';
}

// Handle product form submit
async function handleProductSubmit(e) {
    e.preventDefault();
    
    const productId = document.getElementById('product-id').value;
    const isEdit = !!productId;
    
    const formData = {
        sku: document.getElementById('sku').value.trim().toUpperCase(),
        product_name: document.getElementById('product-name').value.trim(),
        description: document.getElementById('description').value.trim(),
        category: document.getElementById('category').value.trim(),
        supplier: document.getElementById('supplier').value.trim(),
        unit_price: parseFloat(document.getElementById('unit-price').value),
        min_stock_level: parseInt(document.getElementById('min-stock-level').value),
        unit_of_measure: document.getElementById('unit-of-measure').value
    };
    
    // Only include initial stock when adding new product
    if (!isEdit) {
        formData.quantity_in_stock = parseInt(document.getElementById('quantity-in-stock').value);
    }
    
    const submitBtn = document.getElementById('submit-product-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = isEdit ? 'Updating...' : 'Creating...';
    
    try {
        if (isEdit) {
            await apiCall(`/products/${productId}`, 'PUT', formData);
            showSuccessToast('Product updated successfully!');
        } else {
            await apiCall('/products', 'POST', formData);
            showSuccessToast('Product created successfully!');
        }
        
        productModal.style.display = 'none';
        loadProducts();
        loadCategories();
        loadSuppliers();
        
    } catch (error) {
        showModalError(error.message, 'modal-error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Product';
    }
}

// Edit product
async function editProduct(productId) {
    try {
        const data = await apiCall(`/products/${productId}`, 'GET');
        openProductModal(data.product);
    } catch (error) {
        alert('Failed to load product: ' + error.message);
    }
}

// Delete product
async function deleteProduct(productId, productName) {
    if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
        return;
    }
    
    try {
        await apiCall(`/products/${productId}`, 'DELETE');
        showSuccessToast('Product deleted successfully!');
        loadProducts();
    } catch (error) {
        alert('Failed to delete product: ' + error.message);
    }
}

// Open stock update modal
async function openStockModal(productId) {
    try {
        const data = await apiCall(`/products/${productId}`, 'GET');
        const product = data.product;
        
        document.getElementById('stock-product-id').value = product.product_id;
        document.getElementById('stock-product-name').textContent = product.product_name;
        document.getElementById('stock-current-qty').textContent = 
            `${product.quantity_in_stock} ${product.unit_of_measure}`;
        
        document.getElementById('stock-form').reset();
        document.getElementById('stock-modal-error').style.display = 'none';
        
        stockModal.style.display = 'block';
    } catch (error) {
        alert('Failed to load product: ' + error.message);
    }
}

// Handle stock form submit
async function handleStockSubmit(e) {
    e.preventDefault();
    
    const productId = document.getElementById('stock-product-id').value;
    
    const stockData = {
        movement_type: document.getElementById('movement-type').value,
        quantity: parseInt(document.getElementById('quantity').value),
        reference_number: document.getElementById('reference-number').value.trim(),
        notes: document.getElementById('notes').value.trim()
    };
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating...';
    
    try {
        await apiCall(`/products/${productId}/stock`, 'PUT', stockData);
        showSuccessToast('Stock updated successfully!');
        stockModal.style.display = 'none';
        loadProducts();
    } catch (error) {
        showModalError(error.message, 'stock-modal-error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Update Stock';
    }
}

// View product details
async function viewProduct(productId) {
    try {
        const productData = await apiCall(`/products/${productId}`, 'GET');
        const movementsData = await apiCall(`/products/${productId}/movements`, 'GET');
        
        const product = productData.product;
        const movements = movementsData.movements;
        
        // Render product details
        const detailsHtml = `
            <div class="detail-row">
                <span class="detail-label">SKU:</span>
                <span class="detail-value"><strong>${product.sku}</strong></span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Product Name:</span>
                <span class="detail-value">${product.product_name}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Description:</span>
                <span class="detail-value">${product.description || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Category:</span>
                <span class="detail-value">${product.category}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Supplier:</span>
                <span class="detail-value">${product.supplier}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Unit Price:</span>
                <span class="detail-value">$${parseFloat(product.unit_price).toFixed(2)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Current Stock:</span>
                <span class="detail-value"><strong>${product.quantity_in_stock} ${product.unit_of_measure}</strong></span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Min Stock Level:</span>
                <span class="detail-value">${product.min_stock_level}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">${getStatusBadge(product)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Created:</span>
                <span class="detail-value">${new Date(product.created_at).toLocaleString()}</span>
            </div>
        `;
        
        document.getElementById('product-details').innerHTML = detailsHtml;
        
        // Render movements
        const movementsContainer = document.getElementById('movements-container');
        
        if (movements.length === 0) {
            movementsContainer.innerHTML = '<div class="no-movements">No stock movements recorded</div>';
        } else {
            movementsContainer.innerHTML = movements.map(m => `
                <div class="movement-item ${m.movement_type}">
                    <div class="movement-header">
                        <span class="movement-type">${m.movement_type.toUpperCase()}</span>
                        <span class="movement-date">${new Date(m.created_at).toLocaleString()}</span>
                    </div>
                    <div class="movement-details">
                        <strong>Quantity:</strong> ${m.quantity} | 
                        <strong>Before:</strong> ${m.previous_quantity} → 
                        <strong>After:</strong> ${m.new_quantity}
                        ${m.reference_number ? `<br><strong>Ref:</strong> ${m.reference_number}` : ''}
                        ${m.notes ? `<br><strong>Notes:</strong> ${m.notes}` : ''}
                    </div>
                </div>
            `).join('');
        }
        
        detailsModal.style.display = 'block';
        
    } catch (error) {
        alert('Failed to load product details: ' + error.message);
    }
}

// Utility functions
function showLoading(show) {
    document.getElementById('loading-message').style.display = show ? 'block' : 'none';
}

function showError(message, elementId) {
    const errorDiv = document.getElementById(elementId);
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showModalError(message, elementId) {
    const errorDiv = document.getElementById(elementId);
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function showSuccessToast(message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add CSS animation for toast
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);
