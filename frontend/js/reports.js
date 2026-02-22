// Protect the reports page
protectPage();

// Global state
let allProducts = [];
let categoryStats = {};
let currentUser = getCurrentUser();
let isAdmin = currentUser && currentUser.role === 'admin';

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    setupRoleBasedUI();
    loadReportsData();
});

// Setup role-based UI
function setupRoleBasedUI() {
    if (!isAdmin) {
        // Hide admin-only features for clients
        const exportSection = document.querySelector('.export-section');
        if (exportSection) {
            exportSection.style.display = 'none';
        }
        
        // Update page title for clients
        const pageTitle = document.querySelector('.page-header h2');
        if (pageTitle) {
            pageTitle.textContent = '📊 Reports & Product Catalog';
        }
    }
}

// Logout button
document.getElementById('logout-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        logout();
    }
});

// Load all reports data
async function loadReportsData() {
    try {
        const data = await apiCall('/products', 'GET');
        allProducts = data.products;
        
        calculateStats();
        renderCategoryReport();
        renderLowStockReport();
        
    } catch (error) {
        console.error('Failed to load reports data:', error);
        alert('Failed to load reports data: ' + error.message);
    }
}

// Calculate statistics
function calculateStats() {
    const totalProducts = allProducts.length;
    const lowStockItems = allProducts.filter(p => p.is_low_stock && p.quantity_in_stock > 0).length;
    const outOfStock = allProducts.filter(p => p.quantity_in_stock === 0).length;
    
    // Calculate total inventory value
    const totalValue = allProducts.reduce((sum, p) => {
        return sum + (p.unit_price * p.quantity_in_stock);
    }, 0);
    
    // Update summary cards
    document.getElementById('total-products').textContent = totalProducts;
    document.getElementById('total-value').textContent = '$' + totalValue.toFixed(2);
    document.getElementById('low-stock').textContent = lowStockItems;
    document.getElementById('out-of-stock').textContent = outOfStock;
    
    // Calculate category stats
    categoryStats = {};
    allProducts.forEach(product => {
        const category = product.category || 'Uncategorized';
        
        if (!categoryStats[category]) {
            categoryStats[category] = {
                count: 0,
                totalStock: 0,
                totalValue: 0
            };
        }
        
        categoryStats[category].count++;
        categoryStats[category].totalStock += product.quantity_in_stock;
        categoryStats[category].totalValue += product.unit_price * product.quantity_in_stock;
    });
}

// Render category report (now showing all products)
function renderCategoryReport() {
    const tbody = document.getElementById('category-table');
    
    const colspan = isAdmin ? 9 : 8;
    if (allProducts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${colspan}" class="no-data">No products available</td></tr>`;
        return;
    }
    
    // Sort by product name
    const sortedProducts = [...allProducts].sort((a, b) => a.product_name.localeCompare(b.product_name));
    
    tbody.innerHTML = sortedProducts.map(product => {
        const stockValue = product.unit_price * product.quantity_in_stock;
        
        // Determine status
        let status = '';
        if (product.quantity_in_stock === 0) {
            status = '<span class="status-badge out-of-stock">Out of Stock</span>';
        } else if (product.quantity_in_stock <= product.min_stock_level) {
            status = '<span class="status-badge low-stock">Low Stock</span>';
        } else {
            status = '<span class="status-badge in-stock">In Stock</span>';
        }
        
        // Admin-only action buttons
        let actionsCell = '';
        if (isAdmin) {
            actionsCell = `
                <td class="admin-only">
                    <div class="action-buttons">
                        <button class="btn-action btn-stock" onclick="quickStock(${product.product_id}, '${product.product_name}', ${product.quantity_in_stock})">📦 Stock</button>
                        <button class="btn-action btn-edit" onclick="goToEdit(${product.product_id})">✏️</button>
                    </div>
                </td>
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
                <td><strong>$${stockValue.toFixed(2)}</strong></td>
                <td>${status}</td>
                ${actionsCell}
            </tr>
        `;
    }).join('');
    
    // Hide admin-only columns for clients
    if (!isAdmin) {
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'none';
        });
    }
}

// Render low stock report
function renderLowStockReport() {
    const tbody = document.getElementById('low-stock-table');
    
    const lowStockProducts = allProducts.filter(p => p.is_low_stock);
    
    if (lowStockProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-data">✅ No low stock items - all good!</td></tr>';
        return;
    }
    
    // Sort by shortage amount (most critical first)
    lowStockProducts.sort((a, b) => {
        const shortageA = a.min_stock_level - a.quantity_in_stock;
        const shortageB = b.min_stock_level - b.quantity_in_stock;
        return shortageB - shortageA;
    });
    
    tbody.innerHTML = lowStockProducts.map(product => {
        const shortage = Math.max(0, product.min_stock_level - product.quantity_in_stock);
        const rowClass = product.quantity_in_stock === 0 ? 'out-of-stock-row' : 'low-stock-row';
        
        // Determine status
        let status = '';
        if (product.quantity_in_stock === 0) {
            status = '<span class="status-badge out-of-stock">OUT OF STOCK</span>';
        } else if (shortage > product.min_stock_level * 0.5) {
            status = '<span class="status-badge low-stock">CRITICAL</span>';
        } else {
            status = '<span class="status-badge low-stock">LOW</span>';
        }
        
        return `
            <tr class="${rowClass}">
                <td><strong>${product.sku}</strong></td>
                <td>${product.product_name}</td>
                <td>${product.category}</td>
                <td><strong>${product.quantity_in_stock}</strong> ${product.unit_of_measure}</td>
                <td>${product.min_stock_level} ${product.unit_of_measure}</td>
                <td class="shortage"><strong>${shortage}</strong> ${product.unit_of_measure}</td>
                <td>${status}</td>
                <td>$${parseFloat(product.unit_price).toFixed(2)}</td>
            </tr>
        `;
    }).join('');
}

// Admin-only functions
function quickStock(productId, productName, currentStock) {
    const action = prompt(`Quick Stock Update for: ${productName}\nCurrent Stock: ${currentStock}\n\nEnter:\n+ number (to add stock)\n- number (to remove stock)\nExample: +50 or -20`);
    
    if (!action) return;
    
    const match = action.match(/^([+-])(\d+)$/);
    if (!match) {
        alert('Invalid format! Use +number or -number (e.g., +50 or -20)');
        return;
    }
    
    const operation = match[1];
    const quantity = parseInt(match[2]);
    const movement_type = operation === '+' ? 'stock-in' : 'stock-out';
    
    updateStockQuick(productId, movement_type, quantity);
}

async function updateStockQuick(productId, movementType, quantity) {
    try {
        await apiCall(`/products/${productId}/stock`, 'PUT', {
            movement_type: movementType,
            quantity: quantity,
            notes: 'Quick update from reports'
        });
        
        alert('✅ Stock updated successfully!');
        loadReportsData(); // Reload data
    } catch (error) {
        alert('Failed to update stock: ' + error.message);
    }
}

function goToEdit(productId) {
    // Store the product ID and redirect to inventory page
    sessionStorage.setItem('editProductId', productId);
    window.location.href = 'inventory.html';
}

// Export functions (admin-only)
function exportToCSV() {
    if (!isAdmin) return;
    
    // Create CSV content
    let csv = 'SKU,Product Name,Category,Supplier,Unit Price,In Stock,Stock Value,Status\n';
    
    allProducts.forEach(product => {
        const stockValue = (product.unit_price * product.quantity_in_stock).toFixed(2);
        let status = 'In Stock';
        if (product.quantity_in_stock === 0) status = 'Out of Stock';
        else if (product.is_low_stock) status = 'Low Stock';
        
        csv += `"${product.sku}","${product.product_name}","${product.category}","${product.supplier}",${product.unit_price},${product.quantity_in_stock},${stockValue},"${status}"\n`;
    });
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

function exportLowStockCSV() {
    if (!isAdmin) return;
    
    const lowStock = allProducts.filter(p => p.is_low_stock);
    
    if (lowStock.length === 0) {
        alert('No low stock items to export!');
        return;
    }
    
    let csv = 'SKU,Product Name,Category,In Stock,Required,Need to Restock,Status,Unit Price\n';
    
    lowStock.forEach(product => {
        const shortage = Math.max(0, product.min_stock_level - product.quantity_in_stock);
        let status = 'Low';
        if (product.quantity_in_stock === 0) status = 'Out of Stock';
        else if (shortage > product.min_stock_level * 0.5) status = 'Critical';
        
        csv += `"${product.sku}","${product.product_name}","${product.category}",${product.quantity_in_stock},${product.min_stock_level},${shortage},"${status}",${product.unit_price}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `low-stock-alert-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

function printReport() {
    if (!isAdmin) return;
    window.print();
}
