// Protect the profile page
protectPage();

// Load user data
const user = getCurrentUser();

if (user) {
    // Display user information
    document.getElementById('user-fullname').textContent = `${user.first_name} ${user.last_name}`;
    document.getElementById('user-username').textContent = user.username;
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('user-phone').textContent = user.phone || 'Not provided';
    
    const roleBadge = document.getElementById('user-role');
    roleBadge.textContent = user.role.toUpperCase();
    roleBadge.classList.add(user.role);
    
    // Format created date
    if (user.created_at) {
        const createdDate = new Date(user.created_at);
        document.getElementById('user-created').textContent = createdDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// Show error in password section
function showPasswordError(message) {
    const errorDiv = document.getElementById('password-error');
    const successDiv = document.getElementById('password-success');
    
    successDiv.style.display = 'none';
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Show success in password section
function showPasswordSuccess(message) {
    const errorDiv = document.getElementById('password-error');
    const successDiv = document.getElementById('password-success');
    
    errorDiv.style.display = 'none';
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 5000);
}

// Change password form
const passwordForm = document.getElementById('change-password-form');

passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-new-password').value;
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
        showPasswordError('New passwords do not match');
        return;
    }
    
    // Validate password strength
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
        showPasswordError(passwordError);
        return;
    }
    
    // Check if new password is same as current
    if (currentPassword === newPassword) {
        showPasswordError('New password must be different from current password');
        return;
    }
    
    // Disable submit button
    const submitBtn = passwordForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Changing Password...';
    
    try {
        await apiCall('/auth/change-password', 'PUT', {
            current_password: currentPassword,
            new_password: newPassword
        });
        
        showPasswordSuccess('Password changed successfully!');
        
        // Clear form
        passwordForm.reset();
        
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Change Password';
        
    } catch (error) {
        showPasswordError(error.message);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Change Password';
    }
});

// Logout button
document.getElementById('logout-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        logout();
    }
});
