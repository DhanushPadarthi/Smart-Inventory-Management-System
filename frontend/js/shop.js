// Shop functionality
protectPage();

document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
    setupEventListeners();
    
    // Check for product ID in URL (coming from landing page)
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    if (productId) {
        setTimeout(() => openBuyModal(parseInt(productId)), 500);
    }
});

let currentProducts = [];

async function loadProducts() {
    try {
        const data = await apiCall('/products', 'GET');
        currentProducts = data.products.filter(p => p.is_active);
        renderProducts(currentProducts);
        document.getElementById('shop-loading').style.display = 'none';
        document.getElementById('product-list').style.display = 'grid';
    } catch (error) {
        showError('Failed to load products');
    }
}

function renderProducts(products) {
    const list = document.getElementById('product-list');
    list.innerHTML = '';

    if (products.length === 0) {
        list.innerHTML = '<div class="card" style="grid-column: 1/-1; text-align: center;">No products available at the moment.</div>';
        return;
    }

    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'card product-card';
        const imgHtml = p.image_url
            ? `<img src="${p.image_url}" alt="${p.product_name}" style="width:100%;height:180px;object-fit:cover;border-radius:8px;margin-bottom:0.75rem;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
               <div class="product-image" style="display:none;">${getEmojiByCategory(p.category)}</div>`
            : `<div class="product-image">${getEmojiByCategory(p.category)}</div>`;

        card.innerHTML = `
            ${imgHtml}
            <h3 style="margin-bottom: 0.5rem; height: 3rem; overflow: hidden;">${p.product_name}</h3>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <span style="font-size: 1.25rem; font-weight: 700; color: var(--primary-600);">${formatCurrency(p.unit_price)}</span>
                <span class="badge ${p.quantity_in_stock > 0 ? 'badge-success' : 'badge-danger'}">
                    ${p.quantity_in_stock > 0 ? p.quantity_in_stock + ' in stock' : 'Out of Stock'}
                </span>
            </div>
            <p style="font-size: 0.85rem; color: var(--slate-500); margin-bottom: 1.5rem; height: 3rem; overflow: hidden;">
                ${p.description || 'No description available.'}
            </p>
            <button class="btn btn-primary" style="width: 100%;" 
                onclick="openBuyModal(${p.product_id})" 
                ${p.quantity_in_stock <= 0 ? 'disabled' : ''}>
                ${p.quantity_in_stock > 0 ? 'Buy Now' : 'Wait for Stock'}
            </button>
        `;
        list.appendChild(card);
    });
}

function getEmojiByCategory(cat) {
    const map = {
        'Electronics': '💻',
        'Furniture': '🛋️',
        'Clothing': '👕',
        'Food': '🍏',
        'Groceries': '🛒',
        'Hardware': '🔨',
        'Office': '📎'
    };
    return map[cat] || '📦';
}

function openBuyModal(productId) {
    const p = currentProducts.find(item => item.product_id === productId);
    if (!p) return;

    document.getElementById('order-product-id').value = p.product_id;
    document.getElementById('checkout-name').textContent = p.product_name;
    document.getElementById('checkout-price').textContent = formatCurrency(p.unit_price);
    document.getElementById('stock-hint').textContent = `Available stock: ${p.quantity_in_stock} ${p.unit_of_measure}`;
    
    const qtyInput = document.getElementById('order-quantity');
    qtyInput.value = 1;
    qtyInput.max = p.quantity_in_stock;
    
    updateTotals(p.unit_price, 1);
    
    document.getElementById('buy-modal').style.display = 'block';
}

function updateTotals(price, qty) {
    const total = price * qty;
    document.getElementById('order-subtotal').textContent = formatCurrency(total);
    document.getElementById('order-total').textContent = formatCurrency(total);
}

document.getElementById('order-quantity').addEventListener('input', (e) => {
    const id = document.getElementById('order-product-id').value;
    const p = currentProducts.find(item => item.product_id == id);
    if (p) {
        updateTotals(p.unit_price, e.target.value);
    }
});

function setupEventListeners() {
    const modal = document.getElementById('buy-modal');
    const closeBtn = document.querySelector('.close-modal');
    const paymentMethod = document.getElementById('payment-method');
    const upiSection = document.getElementById('upi-section');
    const confirmBtn = document.getElementById('confirm-order-btn');
    const payNowBtn = document.getElementById('pay-now-btn');
    
    let upiPaid = false;

    // Handle Payment Selection
    paymentMethod.addEventListener('change', (e) => {
        if (e.target.value === 'UPI') {
            upiSection.style.display = 'block';
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Wait for UPI Payment...';
        } else {
            upiSection.style.display = 'none';
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirm & Place Order';
            upiPaid = false;
        }
    });

    // UPI Payment Simulation
    payNowBtn.onclick = () => {
        payNowBtn.disabled = true;
        payNowBtn.textContent = 'Processing...';
        
        setTimeout(() => {
            upiPaid = true;
            payNowBtn.style.display = 'none';
            upiSection.innerHTML = '<div style="color: var(--accent-emerald); font-weight: 700;">✅ UPI Payment Success!</div>';
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Complete Order';
        }, 1500);
    };

    closeBtn.onclick = () => {
        modal.style.display = 'none';
        resetOrderForm();
    };

    window.onclick = (e) => { 
        if (e.target == modal) {
            modal.style.display = 'none';
            resetOrderForm();
        }
    };

    function resetOrderForm() {
        upiPaid = false;
        upiSection.style.display = 'none';
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Confirm & Place Order';
        payNowBtn.style.display = 'inline-block';
        payNowBtn.disabled = false;
        payNowBtn.textContent = 'Pay Now';
        upiSection.innerHTML = `
            <p style="font-size: 0.9rem; margin-bottom: 0.5rem;">Scan QR or use UPI ID: <b>smartinv@upi</b></p>
            <button type="button" id="pay-now-btn" class="btn btn-primary" style="background: var(--accent-emerald); border-color: var(--accent-emerald);">Pay Now</button>
        `;
        // Re-attach event to the new button since innerHTML replaced it
        document.getElementById('pay-now-btn').onclick = payNowBtn.onclick;
        document.getElementById('order-form').reset();
    }

    document.getElementById('order-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const method = document.getElementById('payment-method').value;
        if (method === 'UPI' && !upiPaid) {
            showError('Please complete UPI payment first');
            return;
        }

        const payload = {
            product_id: parseInt(document.getElementById('order-product-id').value),
            quantity: parseInt(document.getElementById('order-quantity').value),
            shipping_address: document.getElementById('order-address').value,
            payment_method: method
        };

        const submitBtn = document.getElementById('confirm-order-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Finalizing Order...';

        try {
            await apiCall('/orders', 'POST', payload);
            // Close modal first so the toast is clearly visible
            modal.style.display = 'none';
            resetOrderForm();
            loadProducts();
            showSuccess('Order placed! <a href="orders.html" style="color:#fff;text-decoration:underline;font-weight:700;">View My Orders →</a>');
        } catch (error) {
            showError(error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Confirm & Place Order';
        }
    });
}
