// Orders tracking for individual users
protectPage();

let userOrders = [];

document.addEventListener('DOMContentLoaded', () => {
    loadUserOrders();
});

async function loadUserOrders() {
    try {
        const data = await apiCall('/orders', 'GET');
        userOrders = data.orders;
        renderOrders(userOrders);
    } catch (error) {
        showError('Failed to load your orders');
    }
}

function renderOrders(orders) {
    const list = document.getElementById('orders-list');
    list.innerHTML = '';

    if (!orders || orders.length === 0) {
        list.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--slate-500);">You haven\'t placed any orders yet. <a href="shop.html" style="color:var(--primary-600);">Go to Shop →</a></td></tr>';
        return;
    }

    orders.forEach(order => {
        const tr = document.createElement('tr');
        const payColor = order.payment_status === 'Paid' ? 'var(--accent-emerald)' : 'var(--accent-amber)';
        const dateStr = order.created_at ? new Date(order.created_at).toLocaleDateString() : '—';
        tr.innerHTML =
            '<td style="font-weight:600;">#ORD-' + order.order_id + '</td>' +
            '<td>' + order.product_name + '</td>' +
            '<td>' + order.quantity + '</td>' +
            '<td style="font-weight:600;">' + formatCurrency(parseFloat(order.total_amount)) + '</td>' +
            '<td>' +
                '<div style="font-size:0.85rem;">' + (order.payment_method || '—') + '</div>' +
                '<div style="font-size:0.75rem;color:' + payColor + ';">' + (order.payment_status || '—') + '</div>' +
            '</td>' +
            '<td>' + getStatusBadge(order.status || 'Unknown') + '</td>' +
            '<td style="color:var(--slate-500);font-size:0.85rem;">' + dateStr + '</td>';
        list.appendChild(tr);
    });
}

function getStatusBadge(status) {
    let badgeClass = 'badge-blue';
    if (status === 'Delivered') badgeClass = 'badge-success';
    if (status === 'Cancelled') badgeClass = 'badge-danger';
    if (status === 'Shipped') badgeClass = 'badge-warning';
    if (status === 'Under Process') badgeClass = 'badge-info';
    
    return `<span class="badge ${badgeClass}">${status}</span>`;
}

function exportCSV() {
    if (!userOrders || userOrders.length === 0) {
        showInfo('No orders to export.');
        return;
    }

    let csv = 'Order ID,Product,Quantity,Total,Payment Method,Payment Status,Order Status,Date\n';
    userOrders.forEach(o => {
        const date = new Date(o.created_at).toLocaleDateString();
        csv += `"#ORD-${o.order_id}","${o.product_name}",${o.quantity},${parseFloat(o.total_amount).toFixed(2)},"${o.payment_method}","${o.payment_status}","${o.status}","${date}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
