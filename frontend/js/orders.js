// Orders tracking for individual users
protectPage();

document.addEventListener('DOMContentLoaded', () => {
    loadUserOrders();
});

async function loadUserOrders() {
    try {
        const data = await apiCall('/orders', 'GET');
        renderOrders(data.orders);
    } catch (error) {
        showError('Failed to load your orders');
    }
}

function renderOrders(orders) {
    const list = document.getElementById('orders-list');
    list.innerHTML = '';

    if (!orders || orders.length === 0) {
        list.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--slate-500);">You haven\'t placed any orders yet.</td></tr>';
        return;
    }

    orders.forEach(order => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-weight: 600;">#ORD-${order.order_id}</td>
            <td>${order.product_name}</td>
            <td>${order.quantity}</td>
            <td style="font-weight: 600;">$${order.total_amount.toFixed(2)}</td>
            <td>
                <div style="font-size: 0.85rem;">${order.payment_method}</div>
                <div style="font-size: 0.75rem; color: ${order.payment_status === 'Paid' ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">
                    ${order.payment_status}
                </div>
            </td>
            <td>${getStatusBadge(order.status)}</td>
            <td style="color: var(--slate-500); font-size: 0.85rem;">${new Date(order.created_at).toLocaleDateString()}</td>
        `;
        list.appendChild(tr);
    });
}

function getStatusBadge(status) {
    let badgeClass = 'badge-blue';
    if (status === 'Delivered') badgeClass = 'badge-success';
    if (status === 'Cancelled') badgeClass = 'badge-danger';
    if (status === 'Shipped') badgeClass = 'badge-warning';
    
    return `<span class="badge ${badgeClass}">${status}</span>`;
}
