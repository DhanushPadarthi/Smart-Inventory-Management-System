// Protect the transactions page
protectPage();

let currentUser = getCurrentUser();
let isAdmin = currentUser && currentUser.role === 'admin';

document.addEventListener('DOMContentLoaded', () => {
    setupRoleBasedUI();
    loadTransactions();
});

function setupRoleBasedUI() {
    document.getElementById('logout-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            logout();
        }
    });
}

async function loadTransactions() {
    try {
        const data = await apiCall('/transactions', 'GET');
        const transactions = data.transactions || [];
        const tbody = document.getElementById('transactions-table');
        if (transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="no-data">No transactions found.</td></tr>';
            return;
        }
        tbody.innerHTML = transactions.map(tx => {
            return `
                <tr>
                    <td>${tx.id}</td>
                    <td>${tx.user_username || 'N/A'}</td>
                    <td>${tx.product_name || 'N/A'}</td>
                    <td>${tx.transaction_type}</td>
                    <td>${tx.quantity}</td>
                    <td>${new Date(tx.timestamp).toLocaleString()}</td>
                    <td>${tx.notes || ''}</td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        showErrorToast('Failed to load transactions: ' + error.message);
        document.getElementById('transactions-table').innerHTML = `<tr><td colspan="7" class="no-data">Failed to load transactions.<br><button class='btn-primary' onclick='loadTransactions()'>Retry</button></td></tr>`;
    }
}

// Toast error notification
function showErrorToast(message) {
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
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
