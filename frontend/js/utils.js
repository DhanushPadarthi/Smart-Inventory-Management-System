// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Utility for API calls
async function apiCall(endpoint, method = 'GET', data = null) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers
    };

    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || result.message || 'Something went wrong');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Auth utilities
function login(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
}

function redirectIfLoggedIn() {
    if (isLoggedIn()) {
        window.location.href = 'index.html';
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

function isLoggedIn() {
    return !!localStorage.getItem('token');
}

function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Password validation
function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
        isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar,
        errors: {
            length: password.length >= minLength,
            upper: hasUpperCase,
            lower: hasLowerCase,
            number: hasNumber,
            special: hasSpecialChar
        }
    };
}

// Protect page - redirect to login if not authenticated
function protectPage() {
    const publicPages = ['index.html', 'login.html', 'register.html', ''];
    const currentPage = window.location.pathname.split('/').pop();

    if (!isLoggedIn() && !publicPages.includes(currentPage)) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize navigation
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupNavbar);
    } else {
        setupNavbar();
    }
}

// Global navbar initialization
function setupNavbar() {
    const user = getCurrentUser();
    const navLinksContainer = document.getElementById('main-nav-links');
    const authSection = document.getElementById('nav-auth-section');

    if (!navLinksContainer || !authSection) return;

    // Define links based on role
    let links = [
        { name: '🏠 Store', href: 'index.html' }
    ];

    if (user) {
        if (user.role === 'admin') {
            links.push(
                { name: '📊 Dashboard', href: 'dashboard.html' },
                { name: '📦 Inventory', href: 'inventory.html' },
                { name: '🛒 All Orders', href: 'admin-orders.html' },
                { name: '📜 Reports', href: 'reports.html' },
                { name: '🔔 Alerts', href: 'alerts.html' }
            );
        } else {
            links.push(
                { name: '📦 My Orders', href: 'orders.html' },
                { name: '📜 My Reports', href: 'reports.html' },
                { name: '� Notifications', href: 'alerts.html' },
                { name: '�👤 Profile', href: 'profile.html' }
            );
        }
    }

    // Render Nav Links
    const currentPath = window.location.pathname.split('/').pop();
    navLinksContainer.innerHTML = links.map(link => `
        <a href="${link.href}" class="nav-item ${currentPath === link.href || (currentPath === '' && link.href === 'index.html') ? 'active' : ''}">
            ${link.name}
        </a>
    `).join('');

    // Render Auth Section
    if (user) {
        const initials = (user.first_name.charAt(0) + (user.last_name ? user.last_name.charAt(0) : '')).toUpperCase();
        authSection.innerHTML = `
            <div class="nav-user-profile">
                <div class="avatar" style="width:32px; height:32px; font-size:0.8rem;">${initials}</div>
                <div class="user-meta" style="font-size: 0.875rem;">
                    <div style="font-weight: 600; color: white;">${user.first_name}</div>
                    <div style="font-size: 0.7rem; color: var(--slate-400);">${user.role.toUpperCase()}</div>
                </div>
                <button id="logout-btn" class="btn btn-logout" style="padding: 0.4rem 0.8rem; font-size: 0.75rem; margin-left: 1rem;">
                    Sign Out
                </button>
            </div>
        `;

        // Setup logout listener
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.onclick = (e) => {
                e.preventDefault();
                if (confirm('Are you sure you want to logout?')) logout();
            };
        }
    } else {
        authSection.innerHTML = `
            <div style="display: flex; gap: 0.75rem;">
                <a href="login.html" class="btn btn-secondary" style="background: transparent; border-color: rgba(255,255,255,0.2); color:white;">Login</a>
                <a href="register.html" class="btn btn-primary">Create Account</a>
            </div>
        `;
    }
}

// Toast notification system
function showNotification(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} fade-in`;

    const icon = type === 'success' ? '✅' : '❌';

    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem;">
            <span>${icon}</span>
            <span>${message}</span>
        </div>
    `;

    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: ${type === 'success' ? 'white' : 'var(--accent-rose)'};
        color: ${type === 'success' ? 'var(--slate-900)' : 'white'};
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        border-left: 4px solid ${type === 'success' ? '#10b981' : 'rgba(255,255,255,0.2)'};
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'error');
}