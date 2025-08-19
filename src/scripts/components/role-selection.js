// Role Selection Page Functionality

let selectedRole = null;

// Role configuration
const roleConfig = {
    guardian: {
        name: 'Guardian Mode',
        description: 'You\'ll be able to monitor and protect your loved ones',
        icon: 'fas fa-user-shield',
        permissions: [
            'Track multiple users in real-time',
            'Create and manage geofences',
            'Receive emergency SOS alerts',
            'View detailed location history',
            'Send messages to tracked users',
            'Set safe routes and destinations'
        ],
        redirectUrl: 'guardian-dashboard.html'
    },
    user: {
        name: 'User Mode',
        description: 'You\'ll share your location with trusted guardians',
        icon: 'fas fa-user-check',
        permissions: [
            'Share location with guardians',
            'Use emergency SOS button',
            'Connect with multiple guardians',
            'Follow guardian-defined routes',
            'Control privacy settings',
            'Receive safety notifications'
        ],
        redirectUrl: 'user-dashboard.html'
    }
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    checkRecentActivity();
});

// Load user information
function loadUserInfo() {
    // Get user data from storage (from login)
    const userData = getUserData();
    
    if (userData && userData.email) {
        // Extract name from email or use stored name
        const displayName = userData.name || userData.email.split('@')[0];
        document.getElementById('user-name').textContent = 
            displayName.charAt(0).toUpperCase() + displayName.slice(1);
    }
}

// Check for recent activity
function checkRecentActivity() {
    // Check if user has previous role selections
    const lastRole = localStorage.getItem('last_selected_role');
    const lastActivity = localStorage.getItem('last_activity_time');
    
    if (lastRole && lastActivity) {
        showRecentActivity(lastRole, lastActivity);
    }
}

// Show recent activity section
function showRecentActivity(role, activityTime) {
    const activitySection = document.getElementById('recent-activity');
    const activityList = activitySection.querySelector('.activity-list');
    
    const timeAgo = getTimeAgo(new Date(activityTime));
    
    activityList.innerHTML = `
        <div class="activity-item">
            <i class="fas fa-clock"></i>
            <span>Last used as ${role === 'guardian' ? 'Guardian' : 'User'} - ${timeAgo}</span>
        </div>
        <div class="activity-item">
            <i class="fas fa-sync-alt"></i>
            <span>Click on a role card to continue</span>
        </div>
    `;
    
    activitySection.style.display = 'block';
}

// Select role function
function selectRole(role) {
    selectedRole = role;
    
    const config = roleConfig[role];
    
    // Update modal content
    document.getElementById('modal-title').textContent = 'Confirm Role Selection';
    document.getElementById('selected-role-name').textContent = config.name;
    document.getElementById('selected-role-desc').textContent = config.description;
    
    // Update icon
    const iconElement = document.getElementById('selected-role-icon');
    iconElement.innerHTML = `<i class="${config.icon}"></i>`;
    
    // Set icon background color
    if (role === 'guardian') {
        iconElement.style.background = 'linear-gradient(135deg, var(--primary-blue), var(--secondary-blue))';
    } else {
        iconElement.style.background = 'linear-gradient(135deg, var(--success-green), #059669)';
    }
    
    // Update permissions list
    const permissionsList = document.getElementById('permission-list');
    permissionsList.innerHTML = config.permissions
        .map(permission => `<li><i class="fas fa-check"></i> ${permission}</li>`)
        .join('');
    
    // Update confirm button
    const confirmBtn = document.getElementById('confirm-btn');
    confirmBtn.innerHTML = `<i class="fas fa-check"></i> Continue as ${role === 'guardian' ? 'Guardian' : 'User'}`;
    
    // Show modal
    document.getElementById('role-modal').classList.remove('hidden');
}

// Close role modal
function closeRoleModal() {
    document.getElementById('role-modal').classList.add('hidden');
    selectedRole = null;
}

// Confirm role selection
function confirmRoleSelection() {
    if (!selectedRole) return;
    
    const config = roleConfig[selectedRole];
    
    // Store role selection
    localStorage.setItem('selected_role', selectedRole);
    localStorage.setItem('last_selected_role', selectedRole);
    localStorage.setItem('last_activity_time', new Date().toISOString());
    
    // Show loading overlay
    document.getElementById('loading-overlay').classList.remove('hidden');
    
    // Close modal
    closeRoleModal();
    
    // Simulate setup time and redirect
    setTimeout(() => {
        window.location.href = config.redirectUrl;
    }, 2000);
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear all stored data
        localStorage.removeItem('geoguardian_user');
        sessionStorage.removeItem('geoguardian_user');
        localStorage.removeItem('selected_role');
        localStorage.removeItem('last_selected_role');
        localStorage.removeItem('guardian_contact');
        
        // Redirect to login
        window.location.href = 'login.html';
    }
}

// Get user data helper
function getUserData() {
    const userData = localStorage.getItem('geoguardian_user') || 
                    sessionStorage.getItem('geoguardian_user');
    
    if (userData) {
        try {
            return JSON.parse(userData);
        } catch (e) {
            console.error('Error parsing user data:', e);
        }
    }
    return null;
}

// Time ago helper function
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('role-modal');
    if (event.target === modal) {
        closeRoleModal();
    }
});

// Keyboard navigation
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeRoleModal();
    }
});
