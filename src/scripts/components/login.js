// Login page functionality

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    
    // Clear previous errors
    clearErrors();
    
    // Validate inputs
    if (!validateLogin(email, password)) {
        return;
    }
    
    // Show loading state
    showLoading(true);
    
    // Simulate API call (replace with actual authentication)
    simulateLogin(email, password, remember);
}

// Validate login inputs
function validateLogin(email, password) {
    let isValid = true;
    
    if (!email) {
        showError('email-error', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('email-error', 'Please enter a valid email');
        isValid = false;
    }
    
    if (!password) {
        showError('password-error', 'Password is required');
        isValid = false;
    } else if (password.length < 6) {
        showError('password-error', 'Password must be at least 6 characters');
        isValid = false;
    }
    
    return isValid;
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show error message
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
}

// Clear all errors
function clearErrors() {
    const errors = document.querySelectorAll('.error-message');
    errors.forEach(error => error.textContent = '');
    
    document.getElementById('form-error').classList.add('hidden');
    document.getElementById('form-success').classList.add('hidden');
}

// Show loading state
function showLoading(isLoading) {
    const btn = document.getElementById('login-btn');
    const btnText = document.querySelector('.btn-text');
    const btnLoading = document.querySelector('.btn-loading');
    
    if (isLoading) {
        btn.disabled = true;
        btnText.classList.add('hidden');
        btnLoading.classList.remove('hidden');
    } else {
        btn.disabled = false;
        btnText.classList.remove('hidden');
        btnLoading.classList.add('hidden');
    }
}

// Updated simulate login function
function simulateLogin(email, password, remember) {
    setTimeout(() => {
        // Demo credentials check - no fixed roles
        const demoAccounts = {
            'guardian@demo.com': { password: 'guardian123' },
            'user@demo.com': { password: 'user123' },
            'demo@geoguardian.com': { password: 'demo123' }
        };
        
        if (demoAccounts[email] && demoAccounts[email].password === password) {
            // Successful login - no role restriction
            const userData = {
                email: email,
                loginTime: new Date().toISOString()
            };
            
            // Store user data
            if (remember) {
                localStorage.setItem('geoguardian_user', JSON.stringify(userData));
            } else {
                sessionStorage.setItem('geoguardian_user', JSON.stringify(userData));
            }
            
            // Show success message
            document.getElementById('form-success').classList.remove('hidden');
            
            // Redirect to role selection or main dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html'; // Single dashboard with role options
            }, 1500);
            
        } else {
            // Failed login
            showLoading(false);
            document.getElementById('form-error').classList.remove('hidden');
            document.getElementById('error-text').textContent = 'Invalid email or password. Please try again.';
        }
    }, 2000);
}


// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('password-eye');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        eyeIcon.className = 'fas fa-eye';
    }
}

// Show forgot password modal
function showForgotPassword() {
    document.getElementById('forgot-password-modal').classList.remove('hidden');
}

// Close forgot password modal
function closeForgotPassword() {
    document.getElementById('forgot-password-modal').classList.add('hidden');
    document.getElementById('forgot-password-form').reset();
}

// Handle forgot password
function handleForgotPassword(event) {
    event.preventDefault();
    
    const email = document.getElementById('reset-email').value;
    
    if (!isValidEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Simulate sending reset email
    alert(`Password reset link sent to ${email}`);
    closeForgotPassword();
}

// Social login (placeholder)
function loginWithGoogle() {
    alert('Google login integration would be implemented here');
}

// Auto-fill demo credentials (for development)
document.addEventListener('DOMContentLoaded', function() {
    // Add click handlers for demo accounts
    const demoAccounts = document.querySelectorAll('.demo-account');
    demoAccounts.forEach(account => {
        account.style.cursor = 'pointer';
        account.addEventListener('click', function() {
            const text = this.textContent;
            if (text.includes('guardian@demo.com')) {
                document.getElementById('email').value = 'guardian@demo.com';
                document.getElementById('password').value = 'guardian123';
            } else if (text.includes('user@demo.com')) {
                document.getElementById('email').value = 'user@demo.com';
                document.getElementById('password').value = 'user123';
            }
        });
    });
});

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('forgot-password-modal');
    if (event.target === modal) {
        closeForgotPassword();
    }
});
