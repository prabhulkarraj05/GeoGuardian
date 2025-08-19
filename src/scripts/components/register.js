// Registration page functionality

let currentStep = 1;
const totalSteps = 3;

// Handle form submission
function handleRegistration(event) {
    event.preventDefault();
    
    if (!validateCurrentStep()) {
        return;
    }
    
    // Collect all form data
    const formData = collectFormData();
    
    // Validate all data
    if (!validateAllData(formData)) {
        return;
    }
    
    // Show loading state
    showLoading(true);
    
    // Simulate registration API call
    simulateRegistration(formData);
}

// Navigate to next step
function nextStep() {
    if (!validateCurrentStep()) {
        return;
    }
    
    if (currentStep < totalSteps) {
        currentStep++;
        updateStep();
    }
}

// Navigate to previous step
function previousStep() {
    if (currentStep > 1) {
        currentStep--;
        updateStep();
    }
}

// Update step display
function updateStep() {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show current step
    document.getElementById(`step-${currentStep}`).classList.add('active');
    
    // Update progress indicators
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index + 1 < currentStep) {
            step.classList.add('completed');
        } else if (index + 1 === currentStep) {
            step.classList.add('active');
        }
    });
    
    // Update navigation buttons
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    
    if (currentStep === 1) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'flex';
        submitBtn.style.display = 'none';
    } else if (currentStep === totalSteps) {
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'flex';
    } else {
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
        submitBtn.style.display = 'none';
    }
}

// Validate current step
function validateCurrentStep() {
    clearErrors();
    let isValid = true;
    
    switch (currentStep) {
        case 1:
            isValid = validateStep1();
            break;
        case 2:
            isValid = validateStep2();
            break;
        case 3:
            isValid = validateStep3();
            break;
    }
    
    return isValid;
}

// Validate Step 1: Personal Information
function validateStep1() {
    let isValid = true;
    
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const dateOfBirth = document.getElementById('dateOfBirth').value;
    
    if (!firstName) {
        showError('firstName-error', 'First name is required');
        isValid = false;
    }
    
    if (!lastName) {
        showError('lastName-error', 'Last name is required');
        isValid = false;
    }
    
    if (!email) {
        showError('email-error', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('email-error', 'Please enter a valid email address');
        isValid = false;
    }
    
    if (!phone) {
        showError('phone-error', 'Phone number is required');
        isValid = false;
    } else if (!isValidPhone(phone)) {
        showError('phone-error', 'Please enter a valid phone number');
        isValid = false;
    }
    
    if (!dateOfBirth) {
        showError('dob-error', 'Date of birth is required');
        isValid = false;
    } else if (!isValidAge(dateOfBirth)) {
        showError('dob-error', 'You must be at least 13 years old');
        isValid = false;
    }
    
    return isValid;
}

// Validate Step 2: Security Information
function validateStep2() {
    let isValid = true;
    
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!password) {
        showError('password-error', 'Password is required');
        isValid = false;
    } else if (!isValidPassword(password)) {
        showError('password-error', 'Password does not meet requirements');
        isValid = false;
    }
    
    if (!confirmPassword) {
        showError('confirm-password-error', 'Please confirm your password');
        isValid = false;
    } else if (password !== confirmPassword) {
        showError('confirm-password-error', 'Passwords do not match');
        isValid = false;
    }
    
    return isValid;
}

// Validate Step 3: Guardian Contact
function validateStep3() {
    let isValid = true;
    
    const guardianName = document.getElementById('guardianName').value.trim();
    const guardianPhone = document.getElementById('guardianPhone').value.trim();
    const relationship = document.getElementById('relationship').value;
    const emergencyConsent = document.getElementById('emergencyConsent').checked;
    const termsConsent = document.getElementById('termsConsent').checked;
    
    if (!guardianName) {
        showError('guardian-name-error', 'Guardian name is required');
        isValid = false;
    }
    
    if (!guardianPhone) {
        showError('guardian-phone-error', 'Guardian phone number is required');
        isValid = false;
    } else if (!isValidPhone(guardianPhone)) {
        showError('guardian-phone-error', 'Please enter a valid phone number');
        isValid = false;
    }
    
    if (!relationship) {
        showError('relationship-error', 'Please select your relationship');
        isValid = false;
    }
    
    if (!emergencyConsent) {
        showError('consent-error', 'Emergency consent is required');
        isValid = false;
    }
    
    if (!termsConsent) {
        showError('terms-error', 'You must agree to the terms and privacy policy');
        isValid = false;
    }
    
    return isValid;
}

// Validation helper functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10;
}

function isValidAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age >= 13;
}

function isValidPassword(password) {
    return password.length >= 8 &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /\d/.test(password) &&
           /[!@#$%^&*(),.?":{}|<>]/.test(password);
}

// Password strength checker
function checkPasswordStrength(password) {
    const strengthIndicator = document.getElementById('password-strength');
    const requirements = document.getElementById('password-requirements');
    
    let score = 0;
    
    // Check each requirement
    const checks = [
        { id: 'length-req', test: password.length >= 8 },
        { id: 'uppercase-req', test: /[A-Z]/.test(password) },
        { id: 'lowercase-req', test: /[a-z]/.test(password) },
        { id: 'number-req', test: /\d/.test(password) },
        { id: 'special-req', test: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
    ];
    
    checks.forEach(check => {
        const element = document.getElementById(check.id);
        if (check.test) {
            element.classList.add('valid');
            score++;
        } else {
            element.classList.remove('valid');
        }
    });
    
    // Update strength indicator
    strengthIndicator.className = 'password-strength';
    if (score < 3) {
        strengthIndicator.classList.add('weak');
    } else if (score < 5) {
        strengthIndicator.classList.add('medium');
    } else {
        strengthIndicator.classList.add('strong');
    }
}

// Toggle password visibility
function togglePassword(fieldId) {
    const passwordInput = document.getElementById(fieldId);
    const eyeIcon = document.getElementById(fieldId + '-eye');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        eyeIcon.className = 'fas fa-eye';
    }
}

// Collect all form data
function collectFormData() {
    return {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        dateOfBirth: document.getElementById('dateOfBirth').value,
        password: document.getElementById('password').value,
        guardianName: document.getElementById('guardianName').value.trim(),
        guardianPhone: document.getElementById('guardianPhone').value.trim(),
        guardianEmail: document.getElementById('guardianEmail').value.trim(),
        relationship: document.getElementById('relationship').value,
        emergencyConsent: document.getElementById('emergencyConsent').checked,
        termsConsent: document.getElementById('termsConsent').checked
    };
}

// Validate all data
function validateAllData(formData) {
    // Additional validation can be added here
    return true;
}

// Simulate registration API call
function simulateRegistration(formData) {
    setTimeout(() => {
        // Simulate successful registration
        document.getElementById('form-success').classList.remove('hidden');
        
        // Store user data (in real app, this would be handled by backend)
        const userData = {
            ...formData,
            id: 'user_' + Date.now(),
            createdAt: new Date().toISOString(),
            isVerified: false
        };
        
        delete userData.password; // Don't store password in frontend
        
        sessionStorage.setItem('pending_user', JSON.stringify(userData));
        
        // Redirect to login after success
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        
    }, 3000); // Simulate network delay
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
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    if (isLoading) {
        submitBtn.disabled = true;
        btnText.classList.add('hidden');
        btnLoading.classList.remove('hidden');
    } else {
        submitBtn.disabled = false;
        btnText.classList.remove('hidden');
        btnLoading.classList.add('hidden');
    }
}

// Placeholder functions for terms and privacy
function showTerms() {
    alert('Terms of Service modal would open here');
}

function showPrivacy() {
    alert('Privacy Policy modal would open here');
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Password strength checker
    document.getElementById('password').addEventListener('input', function() {
        checkPasswordStrength(this.value);
    });
    
    // Phone number formatting
    document.getElementById('phone').addEventListener('input', function() {
        formatPhoneInput(this);
    });
    
    document.getElementById('guardianPhone').addEventListener('input', function() {
        formatPhoneInput(this);
    });
});

// Format phone input
function formatPhoneInput(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 6) {
        value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    } else if (value.length >= 3) {
        value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
    }
    input.value = value;
}
