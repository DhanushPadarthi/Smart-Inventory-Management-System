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

        if (response.status === 401) {
            // Token expired or invalid — clear credentials and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            const publicPages = ['login.html', 'register.html', ''];
            const currentPage = window.location.pathname.split('/').pop();
            if (!publicPages.includes(currentPage)) {
                window.location.href = 'login.html';
            }
            throw new Error(result.error || 'Session expired. Please log in again.');
        }

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
    const _navIcons = {
        'index.html':        '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>',
        'dashboard.html':    '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>',
        'inventory.html':    '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>',
        'admin-orders.html': '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>',
        'reports.html':      '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
        'alerts.html':       '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>',
        'admin.html':        '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>',
        'orders.html':       '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>',
        'profile.html':      '<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>'
    };

    let links = [
        { name: 'Store', href: 'index.html' }
    ];

    if (user) {
        if (user.role === 'admin') {
            links.push(
                { name: 'Dashboard', href: 'dashboard.html' },
                { name: 'Inventory', href: 'inventory.html' },
                { name: 'All Orders', href: 'admin-orders.html' },
                { name: 'Reports', href: 'reports.html' },
                { name: 'Alerts', href: 'alerts.html' },
                { name: 'Users', href: 'admin.html' }
            );
        } else {
            links.push(
                { name: 'My Orders', href: 'orders.html' },
                { name: 'My Reports', href: 'reports.html' },
                { name: 'Notifications', href: 'alerts.html' },
                { name: 'Profile', href: 'profile.html' }
            );
        }
    }

    // Render Nav Links
    const currentPath = window.location.pathname.split('/').pop();
    navLinksContainer.innerHTML = links.map(link => {
        const icon = _navIcons[link.href] || '';
        return `<a href="${link.href}" class="nav-item ${currentPath === link.href || (currentPath === '' && link.href === 'index.html') ? 'active' : ''}">${icon} ${link.name}</a>`;
    }).join('');

    // Render Auth Section
    if (user) {
        const initials = (user.first_name.charAt(0) + (user.last_name ? user.last_name.charAt(0) : '')).toUpperCase();
        const selectedCurrency = localStorage.getItem('selectedCurrency') || 'USD';
        const currencies = [
            { code: 'USD', label: '$ USD' },
            { code: 'EUR', label: '€ EUR' },
            { code: 'GBP', label: '£ GBP' },
            { code: 'INR', label: '₹ INR' },
            { code: 'JPY', label: '¥ JPY' },
        ];
        const currencyOptions = currencies.map(c =>
            `<option value="${c.code}" ${c.code === selectedCurrency ? 'selected' : ''}>${c.label}</option>`
        ).join('');
        authSection.innerHTML = `
            <div class="nav-user-profile">
                <select class="currency-selector" id="nav-currency-select" title="Switch Currency">
                    ${currencyOptions}
                </select>
                <div class="avatar" style="width:32px; height:32px; font-size:0.8rem;">${initials}</div>
                <div class="user-meta" style="font-size: 0.875rem;">
                    <div style="font-weight: 600; color: white;">${user.first_name}</div>
                    <div style="font-size: 0.7rem; color: var(--slate-400);">${user.role.toUpperCase()}</div>
                </div>
                <button id="logout-btn" class="btn btn-logout" style="padding: 0.4rem 0.8rem; font-size: 0.75rem; margin-left: 1rem; white-space: nowrap;">
                    Sign Out
                </button>
            </div>
        `;

        // Currency change handler
        const currSel = document.getElementById('nav-currency-select');
        if (currSel) {
            currSel.addEventListener('change', (e) => {
                localStorage.setItem('selectedCurrency', e.target.value);
                window.location.reload();
            });
        }

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

// Toast notification system — top-right stacking
const _toastConfig = {
    success: { icon: '✓', bg: 'linear-gradient(135deg,#10b981,#059669)', border: '#059669' },
    error:   { icon: '✕', bg: 'linear-gradient(135deg,#ef4444,#dc2626)', border: '#dc2626' },
    warning: { icon: '!', bg: 'linear-gradient(135deg,#f59e0b,#d97706)', border: '#d97706' },
    info:    { icon: 'i', bg: 'linear-gradient(135deg,#6366f1,#4f46e5)', border: '#4f46e5' }
};

function showNotification(message, type = 'success') {
    const cfg = _toastConfig[type] || _toastConfig.info;

    // offset existing toasts
    const existing = document.querySelectorAll('.toast-notification');
    const offset = existing.length * 76;

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.dataset.index = existing.length;
    toast.style.cssText = `
        position: fixed;
        top: calc(1.25rem + ${offset}px);
        right: 1.25rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background: white;
        color: #1e293b;
        padding: 0.875rem 1.25rem;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        z-index: 99999;
        font-family: 'Inter', sans-serif;
        font-size: 0.9rem;
        font-weight: 500;
        min-width: 280px;
        max-width: 380px;
        border-left: 4px solid ${cfg.border};
        opacity: 0;
        transform: translateX(20px);
        transition: opacity 0.25s ease, transform 0.25s ease;
    `;

    toast.innerHTML = `
        <span style="
            width:26px;height:26px;border-radius:50%;
            background:${cfg.bg};
            color:white;font-weight:700;font-size:0.85rem;
            display:flex;align-items:center;justify-content:center;flex-shrink:0;
        ">${cfg.icon}</span>
        <span style="flex:1;line-height:1.4;">${message}</span>
        <span onclick="this.parentElement.remove()" style="
            cursor:pointer;color:#94a3b8;font-size:1.1rem;
            line-height:1;padding:0 0.25rem;
            transition:color 0.15s;
        " onmouseover="this.style.color='#475569'" onmouseout="this.style.color='#94a3b8'">&times;</span>
    `;

    document.body.appendChild(toast);

    // slide in
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    });

    // auto-dismiss (success stays longer)
    const duration = type === 'success' ? 6000 : 4500;
    const timer = setTimeout(() => dismissToast(toast), duration);
    toast.addEventListener('mouseenter', () => clearTimeout(timer));
    toast.addEventListener('mouseleave', () => setTimeout(() => dismissToast(toast), 1500));
}

function dismissToast(toast) {
    if (!toast || !toast.parentElement) return;
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => {
        toast.remove();
        // re-stack remaining toasts
        document.querySelectorAll('.toast-notification').forEach((t, i) => {
            t.style.top = `calc(1.25rem + ${i * 76}px)`;
        });
    }, 250);
}

function showSuccess(message) { showNotification(message, 'success'); }
function showError(message)   { showNotification(message, 'error');   }
function showWarning(message) { showNotification(message, 'warning'); }
function showInfo(message)    { showNotification(message, 'info');    }

// Currency formatting
function formatCurrency(amount) {
    const currency = localStorage.getItem('selectedCurrency') || 'USD';
    const symbols = { USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥' };
    const rates   = { USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.5, JPY: 149.5 };
    const converted = amount * (rates[currency] || 1);
    const symbol = symbols[currency] || '$';
    if (currency === 'JPY') return `${symbol}${Math.round(converted).toLocaleString()}`;
    if (currency === 'INR') return `${symbol}${converted.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    return `${symbol}${converted.toFixed(2)}`;
}