// Protect page
protectPage();

const currentUser = getCurrentUser();

document.addEventListener('DOMContentLoaded', () => {
    if (currentUser) {
        document.getElementById('welcome-name').textContent = currentUser.first_name || currentUser.username;
        loadDashboardStats();
        // setupNavbar is called automatically by protectPage() in utils.js
        // so we don't strictly need to call it again here if protectPage is at the top.
    }
});

async function loadDashboardStats() {
    try {
        const data = await apiCall('/stats', 'GET');
        
        // Update Title and Welcome based on role
        const titleEl = document.getElementById('dashboard-title');
        if (data.role === 'admin') {
            titleEl.textContent = 'Command Center';
        } else {
            titleEl.textContent = 'Inventory Workspace';
        }

        // Update basic counts
        document.getElementById('total-products').textContent = data.total_products || 0;
        document.getElementById('low-stock-count').textContent = data.low_stock_count || 0;
        document.getElementById('total-transactions').textContent = data.total_transactions || 0;
        document.getElementById('active-users').textContent = data.active_users || 0;

        // Render Quick Actions
        renderQuickActions(data.role);

        // Render Recent Activity
        renderRecentMovements(data.recent_movements);

        // Render Top Products (if admin)
        if (data.role === 'admin' && data.top_products) {
            document.getElementById('top-products-card').style.display = 'block';
            renderTopProducts(data.top_products);
        }

        // Show/Hide Administrative Stats
        const statusCard = document.getElementById('system-status-card');
        const usersCard = document.getElementById('active-users-card');
        const isAdmin = data.role === 'admin';
        
        if (statusCard) statusCard.style.display = isAdmin ? 'block' : 'none';
        if (usersCard) usersCard.style.display = isAdmin ? 'block' : 'none';

        // Show/Hide Broadcast Banner
        const banner = document.getElementById('broadcast-banner');
        if (data.latest_broadcast) {
            document.getElementById('banner-message').textContent = data.latest_broadcast;
            banner.style.display = 'flex';
        } else {
            banner.style.display = 'none';
        }

        document.getElementById('last-sync-time').textContent = new Date().toLocaleTimeString();

    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
    }
}

function renderQuickActions(role) {
    const container = document.getElementById('quick-actions-grid');
    let actions = [];

    if (role === 'admin') {
        actions = [
            { icon: '➕', label: 'Add Product', link: 'inventory.html' },
            { icon: '🛒', label: 'Manage Orders', link: 'admin-orders.html' },
            { icon: '📢', label: 'Broadcast', link: 'alerts.html' },
            { icon: '📊', label: 'Full Report', link: 'reports.html' }
        ];
    } else {
        actions = [
            { icon: '🏪', label: 'Shop Now', link: 'shop.html' },
            { icon: '📦', label: 'My Orders', link: 'orders.html' },
            { icon: '🔔', label: 'View Alerts', link: 'alerts.html' },
            { icon: '👤', label: 'My Profile', link: 'profile.html' }
        ];
    }

    container.innerHTML = actions.map(act => `
        <div class="card action-card" onclick="window.location.href='${act.link}'">
            <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">${act.icon}</div>
            <div style="font-size: 0.85rem; font-weight: 600;">${act.label}</div>
        </div>
    `).join('');
}

function renderRecentMovements(movements) {
    const container = document.getElementById('recent-movements-list');
    if (!movements || movements.length === 0) {
        container.innerHTML = '<div style="text-align:center; color: var(--slate-400); padding: 1rem;">No recent activities found.</div>';
        return;
    }

    container.innerHTML = movements.map(m => {
        const isStockIn = m.movement_type === 'stock-in';
        const color = isStockIn ? 'var(--accent-emerald)' : 'var(--accent-rose)';
        const arrow = isStockIn ? '↙️' : '↗️';
        const userLabel = m.username ? `<span style="color:var(--slate-400); font-size: 0.75rem;">by ${m.username}</span>` : '';

        return `
            <div class="movement-item">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="font-size: 1.2rem;">${arrow}</div>
                    <div>
                        <div style="font-weight: 600; font-size: 0.9rem;">${m.product_name}</div>
                        ${userLabel}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 700; color: ${color};">${isStockIn ? '+' : '-'}${m.quantity}</div>
                    <div style="font-size: 0.75rem; color: var(--slate-400);">${new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
            </div>
        `;
    }).join('');
}

function renderTopProducts(products) {
    const container = document.getElementById('top-products-list');
    container.innerHTML = products.map((p, index) => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: var(--slate-50); border-radius: 8px; margin-bottom: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span class="badge badge-blue" style="min-width: 24px; padding: 0.2rem;">${index + 1}</span>
                <span style="font-size: 0.9rem; font-weight: 500;">${p.product_name}</span>
            </div>
            <div style="font-weight: 600;">${p.quantity_in_stock} <span style="font-size: 0.7rem; font-weight: 400; color: var(--slate-500);">${p.unit_of_measure}</span></div>
        </div>
    `).join('');
}