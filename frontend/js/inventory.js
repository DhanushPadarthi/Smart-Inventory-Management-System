// Protect the inventory page
protectPage();

// Global state
let allProducts = [];
const currentUser = getCurrentUser();
const isAdmin = currentUser && currentUser.role === 'admin';

document.addEventListener('DOMContentLoaded', () => {
    // Hide info if not admin
    if (!isAdmin) {
        const minLevelHeader = document.getElementById('min-level-header');
        if (minLevelHeader) minLevelHeader.style.display = 'none';
    }
    
    loadProducts();
    loadFiltersData();
    setupEventListeners();
});

function setupEventListeners() {
    const addBtn = document.getElementById('add-product-btn');
    if (addBtn) {
        if (!isAdmin) {
            addBtn.style.display = 'none';
        } else {
            addBtn.onclick = () => openProductModal();
        }
    }

    document.getElementById('product-form').onsubmit = handleProductSubmit;
    document.getElementById('stock-form').onsubmit = handleStockSubmit;

    document.getElementById('search-input').oninput = applyFilters;
    document.getElementById('category-filter').onchange = applyFilters;
    document.getElementById('supplier-filter').onchange = applyFilters;
    document.getElementById('low-stock-filter').onchange = applyFilters;
    document.getElementById('clear-filters-btn').onclick = clearFilters;

    // Close modals
    document.querySelectorAll('.close, #cancel-btn, #cancel-stock-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
        };
    });

    window.onclick = (e) => {
        if (e.target.classList.contains('modal')) e.target.style.display = 'none';
    };
}

async function loadProducts() {
    const tbody = document.getElementById('products-tbody');
    try {
        const data = await apiCall('/products', 'GET');
        allProducts = data.products || [];
        renderProducts(allProducts);
        updateSummary();
    } catch (error) {
        showError('Failed to load products');
        const colCount = isAdmin ? 9 : 8;
        tbody.innerHTML = `<tr><td colspan="${colCount}" style="text-align:center; padding:2rem; color:var(--accent-rose);">Error loading products.</td></tr>`;
    }
}

function renderProducts(products) {
    const tbody = document.getElementById('products-tbody');
    const colCount = isAdmin ? 9 : 8;
    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${colCount}" style="text-align:center; padding:2rem; color:var(--slate-500);">No products found.</td></tr>`;
        return;
    }

    tbody.innerHTML = products.map(p => {
        let statusBadge = '';
        if (p.quantity_in_stock === 0) statusBadge = '<span class="badge badge-danger">OUT OF STOCK</span>';
        else if (p.is_low_stock) statusBadge = '<span class="badge badge-warning">LOW STOCK</span>';
        else statusBadge = '<span class="badge badge-success">IN STOCK</span>';

        let minLevelCell = isAdmin ? `<td>${p.min_stock_level}</td>` : '';

        let actions = `
            <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="viewProduct(${p.product_id})">View</button>
        `;
        
        if (isAdmin) {
            actions += `
                <button class="btn btn-primary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="openStockModal(${p.product_id})">Stock</button>
                <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="editProduct(${p.product_id})">Edit</button>
                <button class="btn btn-danger" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="deleteProduct(${p.product_id}, '${p.product_name}')">Del</button>
            `;
        }
        actions += '</div>';

        return `
            <tr>
                <td><strong>${p.sku}</strong></td>
                <td>${p.product_name}</td>
                <td><span class="badge badge-secondary">${p.category}</span></td>
                <td>${p.supplier}</td>
                <td>$${parseFloat(p.unit_price).toFixed(2)}</td>
                <td><strong>${p.quantity_in_stock}</strong> <span style="font-size: 0.7rem; color: var(--slate-400);">${p.unit_of_measure}</span></td>
                ${minLevelCell}
                <td>${statusBadge}</td>
                <td>${actions}</td>
            </tr>
        `;
    }).join('');
}

function updateSummary() {
    const total = allProducts.length;
    const lowStock = allProducts.filter(p => p.is_low_stock).length;
    document.getElementById('total-products').textContent = total;
    document.getElementById('low-stock-count').textContent = lowStock;
}

async function loadFiltersData() {
    try {
        const [cats, sups] = await Promise.all([
            apiCall('/categories', 'GET'),
            apiCall('/suppliers', 'GET')
        ]);
        
        const catSelect = document.getElementById('category-filter');
        const supSelect = document.getElementById('supplier-filter');
        const catList = document.getElementById('categories-list');
        const supList = document.getElementById('suppliers-list');

        cats.categories.forEach(c => {
            const opt = new Option(c, c);
            catSelect.add(opt);
            const dopt = document.createElement('option');
            dopt.value = c;
            catList.appendChild(dopt);
        });

        sups.suppliers.forEach(s => {
            const opt = new Option(s, s);
            supSelect.add(opt);
            const dopt = document.createElement('option');
            dopt.value = s;
            supList.appendChild(dopt);
        });
    } catch (e) {
        console.error('Failed to load filter data');
    }
}

function applyFilters() {
    const search = document.getElementById('search-input').value.toLowerCase();
    const cat = document.getElementById('category-filter').value;
    const sup = document.getElementById('supplier-filter').value;
    const low = document.getElementById('low-stock-filter').checked;

    let filtered = allProducts.filter(p => {
        const matchesSearch = p.product_name.toLowerCase().includes(search) || p.sku.toLowerCase().includes(search);
        const matchesCat = !cat || p.category === cat;
        const matchesSup = !sup || p.supplier === sup;
        const matchesLow = !low || p.is_low_stock;
        return matchesSearch && matchesCat && matchesSup && matchesLow;
    });

    renderProducts(filtered);
}

function clearFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('category-filter').value = '';
    document.getElementById('supplier-filter').value = '';
    document.getElementById('low-stock-filter').checked = false;
    renderProducts(allProducts);
}

function openProductModal(product = null) {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    const title = document.getElementById('modal-title');
    
    form.reset();
    document.getElementById('product-id').value = '';
    
    if (product) {
        title.textContent = 'Edit Product';
        document.getElementById('product-id').value = product.product_id;
        document.getElementById('sku').value = product.sku;
        document.getElementById('sku').readOnly = true;
        document.getElementById('product-name').value = product.product_name;
        document.getElementById('description').value = product.description || '';
        document.getElementById('category').value = product.category;
        document.getElementById('supplier').value = product.supplier;
        document.getElementById('unit-price').value = product.unit_price;
        document.getElementById('quantity-in-stock').value = product.quantity_in_stock;
        document.getElementById('quantity-in-stock').readOnly = true;
        document.getElementById('min-stock-level').value = product.min_stock_level;
        document.getElementById('unit-of-measure').value = product.unit_of_measure;
    } else {
        title.textContent = 'Add New Product';
        document.getElementById('sku').readOnly = false;
        document.getElementById('quantity-in-stock').readOnly = false;
    }
    
    modal.style.display = 'block';
}

async function handleProductSubmit(e) {
    e.preventDefault();
    const pid = document.getElementById('product-id').value;
    const data = {
        sku: document.getElementById('sku').value.trim().toUpperCase(),
        product_name: document.getElementById('product-name').value.trim(),
        description: document.getElementById('description').value.trim(),
        category: document.getElementById('category').value.trim(),
        supplier: document.getElementById('supplier').value.trim(),
        unit_price: parseFloat(document.getElementById('unit-price').value),
        min_stock_level: parseInt(document.getElementById('min-stock-level').value),
        unit_of_measure: document.getElementById('unit-of-measure').value
    };

    if (!pid) data.quantity_in_stock = parseInt(document.getElementById('quantity-in-stock').value);

    try {
        if (pid) {
            await apiCall(`/products/${pid}`, 'PUT', data);
            showSuccess('Product updated!');
        } else {
            await apiCall('/products', 'POST', data);
            showSuccess('Product created!');
        }
        document.getElementById('product-modal').style.display = 'none';
        loadProducts();
    } catch (err) {
        showError(err.message);
    }
}

async function deleteProduct(id, name) {
    if (!confirm(`Delete ${name}?`)) return;
    try {
        await apiCall(`/products/${id}`, 'DELETE');
        showSuccess('Product deleted');
        loadProducts();
    } catch (e) {
        showError('Delete failed');
    }
}

async function editProduct(id) {
    try {
        const data = await apiCall(`/products/${id}`, 'GET');
        openProductModal(data.product);
    } catch (e) {
        showError('Load failed');
    }
}

async function openStockModal(id) {
    try {
        const data = await apiCall(`/products/${id}`, 'GET');
        const p = data.product;
        document.getElementById('stock-product-id').value = p.product_id;
        document.getElementById('stock-product-name').textContent = p.product_name;
        document.getElementById('stock-current-qty').textContent = `${p.quantity_in_stock} ${p.unit_of_measure}`;
        document.getElementById('stock-form').reset();
        document.getElementById('stock-modal').style.display = 'block';
    } catch (e) {
        showError('Load failed');
    }
}

async function handleStockSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('stock-product-id').value;
    const data = {
        movement_type: document.getElementById('movement-type').value,
        quantity: parseInt(document.getElementById('quantity').value),
        reference_number: document.getElementById('reference-number').value.trim(),
        notes: document.getElementById('notes').value.trim()
    };

    try {
        await apiCall(`/products/${id}/stock`, 'PUT', data);
        showSuccess('Stock updated!');
        document.getElementById('stock-modal').style.display = 'none';
        loadProducts();
    } catch (err) {
        showError(err.message);
    }
}

async function viewProduct(id) {
    try {
        const data = await apiCall(`/products/${id}`, 'GET');
        const mdata = await apiCall(`/products/${id}/movements`, 'GET');
        const p = data.product;
        
        document.getElementById('product-details').innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding: 1rem;">
                <div><span style="color:var(--slate-400)">Name:</span> <strong>${p.product_name}</strong></div>
                <div><span style="color:var(--slate-400)">SKU:</span> <strong>${p.sku}</strong></div>
                <div><span style="color:var(--slate-400)">Category:</span> ${p.category}</div>
                <div><span style="color:var(--slate-400)">Supplier:</span> ${p.supplier}</div>
                <div><span style="color:var(--slate-400)">Price:</span> $${parseFloat(p.unit_price).toFixed(2)}</div>
                <div><span style="color:var(--slate-400)">Stock:</span> ${p.quantity_in_stock} ${p.unit_of_measure}</div>
            </div>
            <div style="padding: 1rem; border-top: 1px solid var(--slate-200);">
                <span style="color:var(--slate-400)">Description:</span><br>${p.description || 'No description'}
            </div>
        `;
        
        const mcont = document.getElementById('movements-container');
        if (!mdata.movements || mdata.movements.length === 0) {
            mcont.innerHTML = '<div style="text-align:center; color:var(--slate-400);">No movement history</div>';
        } else {
            mcont.innerHTML = mdata.movements.map(m => `
                <div style="padding: 0.75rem; border-radius: 8px; background: white; border: 1px solid var(--slate-100);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span class="badge ${m.movement_type === 'stock-in' ? 'badge-success' : 'badge-danger'}">${m.movement_type.toUpperCase()}</span>
                        <span style="font-size: 0.75rem; color: var(--slate-400);">${new Date(m.created_at).toLocaleString()}</span>
                    </div>
                    <div style="font-size: 0.875rem;">
                        <strong>Qty: ${m.quantity}</strong> (${m.previous_quantity} → ${m.new_quantity})
                        ${m.notes ? `<p style="margin-top: 0.25rem; font-style: italic;">Note: ${m.notes}</p>` : ''}
                    </div>
                </div>
            `).join('');
        }
        document.getElementById('details-modal').style.display = 'block';
    } catch (e) {
        showError('Load failed');
    }
}
