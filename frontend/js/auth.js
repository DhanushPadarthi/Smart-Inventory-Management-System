// Login Page
if (document.getElementById('login-form')) {
    // Redirect if already logged in
    redirectIfLoggedIn();
    
    const loginForm = document.getElementById('login-form');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            showError('Please enter both email and password');
            return;
        }
        
        // Disable submit button
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';
        
        try {
            const data = await apiCall('/auth/login', 'POST', {
                email: email,
                password: password
            });
            
            // Save token and user data
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            showSuccess('Login successful! Redirecting...');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
            
        } catch (error) {
            showError(error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
        }
    });
}

// Register Page
if (document.getElementById('register-form')) {
    // Redirect if already logged in
    redirectIfLoggedIn();
    
    const registerForm = document.getElementById('register-form');
    
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            first_name: document.getElementById('first_name').value.trim(),
            last_name: document.getElementById('last_name').value.trim(),
            username: document.getElementById('username').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            role: document.getElementById('role').value,
            password: document.getElementById('password').value,
        };
        
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validate passwords match
        if (formData.password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }
        
        // Validate password strength
        const passwordError = validatePassword(formData.password);
        if (passwordError) {
            showError(passwordError);
            return;
        }
        
        // Validate username length
        if (formData.username.length < 3) {
            showError('Username must be at least 3 characters long');
            return;
        }
        
        // Disable submit button
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Registering...';
        
        try {
            const data = await apiCall('/auth/register', 'POST', formData);
            
            showSuccess('Registration successful! Redirecting to login...');
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            
        } catch (error) {
            showError(error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Register';
        }
    });
}