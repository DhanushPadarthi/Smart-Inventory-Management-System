// Protect the dashboard page
protectPage();

// Load user data
const user = getCurrentUser();

if (user) {
    // Display user information
    document.getElementById('user-name').textContent = `${user.first_name} ${user.last_name}`;
    document.getElementById('user-username').textContent = user.username;
    document.getElementById('user-email').textContent = user.email;
    
    const roleBadge = document.getElementById('user-role');
    roleBadge.textContent = user.role.toUpperCase();
    roleBadge.classList.add(user.role);
}

// Logout button
document.getElementById('logout-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        logout();
    }
});