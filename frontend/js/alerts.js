protectPage();

const currentUser = getCurrentUser();
const isAdmin = currentUser && currentUser.role === 'admin';

document.addEventListener('DOMContentLoaded', () => {
    if (isAdmin) {
        document.getElementById('admin-view').style.display = 'block';
        loadActiveAlerts();
        loadAlertHistory();
        document.getElementById('create-alert-form').addEventListener('submit', createAlert);
    } else {
        document.getElementById('user-view').style.display = 'block';
        loadUserNotifications();
    }
});

async function loadActiveAlerts() {
    const tbody = document.getElementById('active-alerts-table');
    try {
        const data = await apiCall('/alerts', 'GET');
        const alerts = data.alerts || [];
        if (alerts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="no-data">✅ No active alerts</td></tr>';
            return;
        }
        tbody.innerHTML = alerts.map(alert => `
            <tr>
                <td>${alert.product_name || 'System Broadcast'}</td>
                <td><span class="badge badge-warning">${alert.alert_type}</span></td>
                <td>${alert.alert_message}</td>
                <td>${new Date(alert.created_at).toLocaleString()}</td>
                <td>
                    <button class="btn btn-primary" style="font-size:.8rem;padding:.3rem .7rem;"
                        onclick="acknowledgeAlert(${alert.alert_id})">Acknowledge</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="5" class="no-data">Failed to load alerts. <button class="btn btn-primary" onclick="loadActiveAlerts()">Retry</button></td></tr>`;
    }
}

async function loadAlertHistory() {
    const tbody = document.getElementById('alert-history-table');
    try {
        const data = await apiCall('/alerts/history', 'GET');
        const alerts = data.alerts || [];
        if (alerts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="no-data">No alert history found.</td></tr>';
            return;
        }
        tbody.innerHTML = alerts.map(alert => `
            <tr>
                <td>${alert.product_name || 'System Broadcast'}</td>
                <td><span class="badge badge-blue">${alert.alert_type}</span></td>
                <td>${alert.alert_message}</td>
                <td>${new Date(alert.created_at).toLocaleString()}</td>
                <td>${alert.acknowledged_by_username || 'N/A'}</td>
                <td>${alert.acknowledged_at ? new Date(alert.acknowledged_at).toLocaleString() : 'N/A'}</td>
            </tr>
        `).join('');
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="6" class="no-data">Failed to load history. <button class="btn btn-primary" onclick="loadAlertHistory()">Retry</button></td></tr>`;
    }
}

async function acknowledgeAlert(alertId) {
    try {
        await apiCall(`/alerts/${alertId}/acknowledge`, 'PUT');
        showSuccess('Alert acknowledged.');
        loadActiveAlerts();
        loadAlertHistory();
    } catch (error) {
        showError('Failed to acknowledge alert: ' + error.message);
    }
}

async function createAlert(e) {
    e.preventDefault();
    const message = document.getElementById('alert-message-input').value.trim();
    const alertType = document.getElementById('alert-type-input').value;
    if (!message) { showError('Please enter a message.'); return; }
    try {
        await apiCall('/alerts/custom', 'POST', { message, alert_type: alertType });
        showSuccess('Alert broadcast sent successfully.');
        document.getElementById('create-alert-form').reset();
        loadActiveAlerts();
    } catch (error) {
        showError('Failed to create alert: ' + error.message);
    }
}

async function loadUserNotifications() {
    const container = document.getElementById('user-notifications-list');
    try {
        const data = await apiCall('/alerts', 'GET');
        const alerts = data.alerts || [];
        if (alerts.length === 0) {
            container.innerHTML = '<p class="no-data">✅ No new notifications!</p>';
            return;
        }
        container.innerHTML = alerts.map(alert => `
            <div style="display:flex;align-items:flex-start;gap:1rem;padding:1rem;border-radius:8px;
                background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);margin-bottom:0.75rem;">
                <span style="font-size:1.5rem;">🔔</span>
                <div>
                    <div style="font-weight:600;margin-bottom:.25rem;">
                        ${alert.product_name || 'System Broadcast'}
                        <span class="badge badge-warning" style="margin-left:.5rem;">${alert.alert_type}</span>
                    </div>
                    <div style="opacity:.85;">${alert.alert_message}</div>
                    <div style="font-size:.8rem;opacity:.6;margin-top:.25rem;">${new Date(alert.created_at).toLocaleString()}</div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<p class="no-data">Failed to load notifications.</p>';
    }
}
