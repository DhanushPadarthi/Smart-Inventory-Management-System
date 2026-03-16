// Protect the profile page
protectPage();

document.addEventListener('DOMContentLoaded', () => {
    loadProfileData();
    loadProfileStats();
    setupEventListeners();
});

async function loadProfileData() {
    try {
        // Fetch fresh user data from server
        const data = await apiCall('/auth/me', 'GET');
        const user = data.user;
        if (!user) return;

        // Populate header and visuals
        const fullName = `${user.first_name} ${user.last_name}`;
        document.getElementById('user-fullname-header').textContent = fullName;
        document.getElementById('user-joined-date').textContent = new Date(user.created_at).toLocaleDateString();
        
        const avatarInitials = (user.first_name.charAt(0) + (user.last_name ? user.last_name.charAt(0) : '')).toUpperCase();
        document.getElementById('profile-avatar').textContent = avatarInitials;
        
        const roleBadge = document.getElementById('user-role-badge');
        const badgeClass = user.role === 'admin' ? 'badge-blue' : 'badge-warning';
        roleBadge.innerHTML = `<span class="badge ${badgeClass}">${user.role.toUpperCase()}</span>`;

        // Populate Form Fields
        document.getElementById('edit-first-name').value = user.first_name || '';
        document.getElementById('edit-last-name').value = user.last_name || '';
        document.getElementById('edit-email').value = user.email || '';
        document.getElementById('edit-phone').value = user.phone || '';
    } catch (error) {
        console.error('Failed to load profile details:', error);
    }
}

async function loadProfileStats() {
    try {
        const stats = await apiCall('/auth/profile/stats', 'GET');
        
        document.getElementById('stat-total-trans').textContent = stats.total_transactions || 0;
        
        const lastActEl = document.getElementById('stat-last-activity');
        if (stats.last_activity) {
            const date = new Date(stats.last_activity.date).toLocaleDateString();
            const type = stats.last_activity.type.replace('-', ' ').toUpperCase();
            lastActEl.textContent = `${type} on ${date}`;
        } else {
            lastActEl.textContent = 'None yet';
        }
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

function setupEventListeners() {
    const editForm = document.getElementById('edit-profile-form');
    if (editForm) {
        editForm.addEventListener('submit', handleProfileUpdate);
    }

    const passwordForm = document.getElementById('change-password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordChange);
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    const saveBtn = document.getElementById('save-profile-btn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    const payload = {
        first_name: document.getElementById('edit-first-name').value.trim(),
        last_name: document.getElementById('edit-last-name').value.trim(),
        email: document.getElementById('edit-email').value.trim(),
        phone: document.getElementById('edit-phone').value.trim()
    };

    try {
        await apiCall('/auth/profile', 'PUT', payload);
        showSuccess('Profile updated successfully!');
        
        // Refresh local storage if needed, or just reload page data
        // For simplicity, we re-fetch data to reflect changes
        loadProfileData();
        
        // Update sidebar if it exists
        if (typeof setupSidebar === 'function') setupSidebar();
    } catch (error) {
        showError(error.message);
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Profile Changes';
    }
}

async function handlePasswordChange(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-new-password').value;
    
    if (newPassword !== confirmPassword) {
        showError('New passwords do not match');
        return;
    }
    
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
        showError(validation.message || 'Password does not meet requirements');
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating...';
    
    try {
        await apiCall('/auth/change-password', 'PUT', {
            current_password: currentPassword,
            new_password: newPassword
        });
        
        showSuccess('Password updated successfully!');
        e.target.reset();
    } catch (error) {
        showError(error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Update Password';
    }
}
