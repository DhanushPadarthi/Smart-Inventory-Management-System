// Admin order management
protectPage();

document.addEventListener('DOMContentLoaded', () => {
    // Basic verification: user must be admin
    const user = getCurrentUser();
    if (user && user.role !== 'admin') {
        window.location.href = 'dashboard.html';
        return;
    }
    
    loadAllOrders();
    setupSearch();
});

let allOrders = [];

async function loadAllOrders() {
    try {
        const data = await apiCall('/admin/orders', 'GET');
        allOrders = data.orders;
        renderAllOrders(allOrders);
    } catch (error) {
        showError('Fail to load system orders');
    }
}

function renderAllOrders(orders) {
    const list = document.getElementById('admin-orders-list');
    list.innerHTML = '';

    if (!orders || orders.length === 0) {
        list.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--slate-500);">No orders found in the system.</td></tr>';
        return;
    }

    orders.forEach(order => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#ORD-${order.order_id}</td>
            <td style="font-weight: 600;">${order.customer_name}</td>
            <td>${order.product_name}</td>
            <td>${order.quantity}</td>
            <td style="font-weight: 600;">${formatCurrency(order.total_amount)}</td>
            <td>
                <div style="font-size: 0.85rem;">${order.payment_method}</div>
                <div style="font-size: 0.75rem; color: ${order.payment_status === 'Paid' ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">
                    ${order.payment_status}
                </div>
            </td>
            <td>${getStatusBadge(order.status)}</td>
            <td>
                <select class="status-select" onchange="updateStatus(${order.order_id}, this.value)">
                    <option value="Under Process" ${order.status === 'Under Process' ? 'selected' : ''}>Under Process</option>
                    <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
            <td style="color: var(--slate-500); font-size: 0.85rem;">${new Date(order.created_at).toLocaleDateString()}</td>
        `;
        list.appendChild(tr);
    });
}

async function updateStatus(orderId, newStatus) {
    try {
        await apiCall(`/admin/orders/${orderId}/status`, 'PUT', { status: newStatus });
        showSuccess(`Order #${orderId} set to ${newStatus}`);
        
        // If delivered, notify stock changes occurred
        if (newStatus === 'Delivered') {
            showSuccess('Stock levels updated automatically.');
        }
        
        loadAllOrders(); // Refresh table
    } catch (error) {
        showError('Update failed: ' + error.message);
        loadAllOrders(); // Revert on failure
    }
}

function getStatusBadge(status) {
    let badgeClass = 'badge-blue';
    if (status === 'Delivered') badgeClass = 'badge-success';
    if (status === 'Cancelled') badgeClass = 'badge-danger';
    if (status === 'Shipped') badgeClass = 'badge-warning';
    return `<span class="badge ${badgeClass}">${status}</span>`;
}

function setupSearch() {
    document.getElementById('order-search').addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        const filtered = allOrders.filter(o => 
            o.customer_name.toLowerCase().includes(q) || 
            o.product_name.toLowerCase().includes(q) ||
            o.order_id.toString().includes(q)
        );
        renderAllOrders(filtered);
    });
}

function exportCSV() {
    if (!allOrders || allOrders.length === 0) {
        showError('No orders to export');
        return;
    }
    const headers = ['Order ID', 'Customer', 'Product', 'Quantity', 'Total (USD)', 'Payment Method', 'Payment Status', 'Status', 'Date'];
    const rows = allOrders.map(o => [
        `ORD-${o.order_id}`,
        o.customer_name,
        o.product_name,
        o.quantity,
        o.total_amount.toFixed(2),
        o.payment_method,
        o.payment_status,
        o.status,
        new Date(o.created_at).toLocaleDateString()
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
