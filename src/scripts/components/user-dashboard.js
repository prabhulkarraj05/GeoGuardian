// User Dashboard Functionality

let map;
let userMarker;
let routePath;
let geofenceCircles = [];
let currentLocation = null;
let watchId;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    initializeMap();
    loadUserData();
    setupLocationTracking();
    setupEventListeners();
});

// Initialize dashboard
function initializeDashboard() {
    console.log('User Dashboard initialized');
    
    // Check if user is logged in and has user role
    const selectedRole = localStorage.getItem('selected_role');
    if (selectedRole !== 'user') {
        window.location.href = 'role-selection.html';
        return;
    }
    
    // Load user info
    const userData = getUserData();
    if (userData) {
        const name = userData.firstName || userData.email.split('@')[0];
        document.getElementById('user-name').textContent = name;
        document.getElementById('welcome-name').textContent = name;
        document.getElementById('profile-name').textContent = name;
    }
}

// Initialize map
function initializeMap() {
    // Default location (will be updated when user location is available)
    map = L.map('user-map').setView([40.7128, -74.0060], 15);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Add sample geofences
    addSampleGeofences();
}

// Setup location tracking
function setupLocationTracking() {
    if (navigator.geolocation) {
        // Get initial position
        navigator.geolocation.getCurrentPosition(
            updateUserLocation,
            handleLocationError,
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
        
        // Watch position changes
        watchId = navigator.geolocation.watchPosition(
            updateUserLocation,
            handleLocationError,
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 30000 }
        );
    } else {
        handleLocationError({ code: 0, message: 'Geolocation not supported' });
    }
}

// Update user location
function updateUserLocation(position) {
    currentLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date()
    };
    
    // Update map
    if (userMarker) {
        userMarker.setLatLng([currentLocation.lat, currentLocation.lng]);
    } else {
        userMarker = L.marker([currentLocation.lat, currentLocation.lng], {
            icon: L.divIcon({
                className: 'user-location-marker',
                html: '<div class="user-marker-inner"><i class="fas fa-user"></i></div>',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        }).addTo(map);
        
        userMarker.bindPopup('Your Location');
    }
    
    // Center map on user location
    map.setView([currentLocation.lat, currentLocation.lng], 15);
    
    // Update location display
    updateLocationDisplay();
    
    // Check geofences
    checkGeofences();
    
    // Send location to guardians (simulate)
    sendLocationToGuardians();
}

// Handle location errors
function handleLocationError(error) {
    console.error('Location error:', error);
    
    let message = 'Unable to get your location.';
    switch(error.code) {
        case error.PERMISSION_DENIED:
            message = 'Location access denied. Please enable location services.';
            break;
        case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable.';
            break;
        case error.TIMEOUT:
            message = 'Location request timed out.';
            break;
    }
    
    document.getElementById('current-address').textContent = message;
    document.getElementById('sharing-status').textContent = 'Disabled';
    document.querySelector('.status-indicator').classList.remove('online');
}

// Update location display
function updateLocationDisplay() {
    if (!currentLocation) return;
    
    // Reverse geocoding (simulate)
    const address = `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`;
    document.getElementById('current-address').textContent = 'Current Location';
    document.getElementById('current-coords').textContent = 
        `Lat: ${currentLocation.lat.toFixed(6)}, Lng: ${currentLocation.lng.toFixed(6)}`;
    document.getElementById('location-accuracy').textContent = 
        Math.round(currentLocation.accuracy);
}

// Add sample geofences
function addSampleGeofences() {
    const geofences = [
        { name: 'Home', center: [40.7128, -74.0060], radius: 200, color: 'green' },
        { name: 'School', center: [40.7589, -73.9851], radius: 150, color: 'blue' }
    ];
    
    geofences.forEach(geofence => {
        const circle = L.circle(geofence.center, {
            color: geofence.color,
            fillColor: geofence.color,
            fillOpacity: 0.2,
            radius: geofence.radius
        }).addTo(map);
        
        circle.bindPopup(`${geofence.name} Safe Zone`);
        geofenceCircles.push({ ...geofence, circle });
    });
}

// Check geofences
function checkGeofences() {
    if (!currentLocation) return;
    
    geofenceCircles.forEach(geofence => {
        const distance = calculateDistance(
            currentLocation.lat, currentLocation.lng,
            geofence.center[0], geofence.center[1]
        );
        
        const isInside = distance <= geofence.radius;
        
        // Update UI based on geofence status
        // This would trigger notifications to guardians in a real implementation
        console.log(`${geofence.name}: ${isInside ? 'Inside' : 'Outside'} (${Math.round(distance)}m)`);
    });
}

// Calculate distance between two points
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng1-lng2) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}

// Send location to guardians
function sendLocationToGuardians() {
    if (!currentLocation) return;
    
    // In a real implementation, this would send data to the server
    const locationData = {
        userId: getCurrentUserId(),
        location: currentLocation,
        timestamp: new Date().toISOString()
    };
    
    console.log('Sending location to guardians:', locationData);
    
    // Simulate API call
    // fetch('/api/location/update', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(locationData)
    // });
}

// Setup event listeners
function setupEventListeners() {
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(event) {
        const notificationPanel = document.getElementById('notification-panel');
        const profileMenu = document.getElementById('profile-menu');
        const notificationIcon = document.querySelector('.notification-icon');
        const userProfile = document.querySelector('.user-profile');
        
        if (!notificationIcon.contains(event.target)) {
            notificationPanel.classList.add('hidden');
        }
        
        if (!userProfile.contains(event.target)) {
            profileMenu.classList.add('hidden');
        }
    });
}

// SOS Functions
function triggerSOS() {
    // Show SOS modal
    document.getElementById('sos-modal').classList.remove('hidden');
    
    // Start countdown
    startSOSCountdown();
    
    // Immediately send SOS alert to guardians
    sendSOSAlert();
}

let sosCountdown;
function startSOSCountdown() {
    let count = 10;
    const countdownElement = document.getElementById('sos-countdown');
    
    sosCountdown = setInterval(() => {
        count--;
        countdownElement.textContent = count;
        
        if (count <= 0) {
            clearInterval(sosCountdown);
            confirmSOS();
        }
    }, 1000);
}

function confirmSOS() {
    // Clear countdown
    if (sosCountdown) {
        clearInterval(sosCountdown);
    }
    
    // Get guardian data and make call
    const guardianPhone = getGuardianPhone();
    if (guardianPhone) {
        // Use the phone calling functionality we discussed
        window.location.href = `tel:${guardianPhone}`;
    }
    
    // Close modal
    cancelSOS();
    
    // Show confirmation
    alert('Emergency call initiated. Your guardians have been notified.');
}

function cancelSOS() {
    // Clear countdown
    if (sosCountdown) {
        clearInterval(sosCountdown);
    }
    
    // Hide modal
    document.getElementById('sos-modal').classList.add('hidden');
}

function sendSOSAlert() {
    if (!currentLocation) return;
    
    const sosData = {
        userId: getCurrentUserId(),
        location: currentLocation,
        timestamp: new Date().toISOString(),
        alertType: 'SOS',
        guardians: getConnectedGuardians()
    };
    
    console.log('SOS Alert sent:', sosData);
    
    // In a real implementation, this would send to server and notify guardians
}

// Navigation and utility functions
function toggleNotifications() {
    const panel = document.getElementById('notification-panel');
    panel.classList.toggle('hidden');
}

function toggleProfileMenu() {
    const menu = document.getElementById('profile-menu');
    menu.classList.toggle('hidden');
}

function clearAllNotifications() {
    const notificationList = document.querySelector('.notification-list');
    notificationList.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 20px;">No notifications</p>';
    document.getElementById('notification-count').textContent = '0';
}

// Map control functions
function centerOnUser() {
    if (currentLocation) {
        map.setView([currentLocation.lat, currentLocation.lng], 15);
    }
}

function toggleLocationSharing() {
    const status = document.getElementById('sharing-status');
    const indicator = document.querySelector('.status-indicator');
    
    if (status.textContent === 'Active') {
        status.textContent = 'Paused';
        indicator.classList.remove('online');
        
        // Stop location tracking
        if (watchId) {
            navigator.geolocation.clearWatch(watchId);
        }
    } else {
        status.textContent = 'Active';
        indicator.classList.add('online');
        
        // Resume location tracking
        setupLocationTracking();
    }
}

function fullscreenMap() {
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer.requestFullscreen) {
        mapContainer.requestFullscreen();
    }
}

// Communication functions
function contactGuardian(guardianId) {
    const guardianPhone = getGuardianPhoneById(guardianId);
    if (guardianPhone) {
        const confirmation = confirm(`Call ${guardianId}?`);
        if (confirmation) {
            window.location.href = `tel:${guardianPhone}`;
        }
    }
}

function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    
    if (message) {
        // Add message to UI (simulate)
        addMessageToList('You', message, 'now');
        input.value = '';
        
        // Send to guardians (simulate)
        console.log('Sending message:', message);
    }
}

function addMessageToList(sender, message, time) {
    const messagesList = document.querySelector('.messages-list');
    const messageItem = document.createElement('div');
    messageItem.className = 'message-item';
    messageItem.innerHTML = `
        <div class="message-avatar">
            <img src="https://via.placeholder.com/30" alt="${sender}">
        </div>
        <div class="message-content">
            <div class="message-header">
                <span class="sender-name">${sender}</span>
                <span class="message-time">${time}</span>
            </div>
            <p class="message-text">${message}</p>
        </div>
    `;
    
    messagesList.appendChild(messageItem);
    messagesList.scrollTop = messagesList.scrollHeight;
}

// Profile and settings functions
function editProfile() {
    alert('Profile editing will be implemented');
}

function privacySettings() {
    alert('Privacy settings will be implemented');
}

function showSettings() {
    alert('Settings will be implemented');
}

function showMessages() {
    // Focus on messages panel or open messages modal
    document.querySelector('.messages-panel').scrollIntoView();
}

function switchRole() {
    const confirmation = confirm('Switch to Guardian mode? You can switch back anytime.');
    if (confirmation) {
        localStorage.setItem('selected_role', 'guardian');
        window.location.href = 'guardian-dashboard.html';
    }
}

function logout() {
    const confirmation = confirm('Are you sure you want to logout?');
    if (confirmation) {
        // Stop location tracking
        if (watchId) {
            navigator.geolocation.clearWatch(watchId);
        }
        
        // Clear stored data
        localStorage.removeItem('geoguardian_user');
        sessionStorage.removeItem('geoguardian_user');
        localStorage.removeItem('selected_role');
        
        // Redirect to login
        window.location.href = 'login.html';
    }
}

// Helper functions
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

function getCurrentUserId() {
    const userData = getUserData();
    return userData ? userData.id || userData.email : 'demo_user';
}

function getGuardianPhone() {
    // Return primary guardian's phone (from registration)
    const guardianData = localStorage.getItem('guardian_contact');
    if (guardianData) {
        const guardian = JSON.parse(guardianData);
        return guardian.phone;
    }
    return '+1-555-123-4567'; // Demo number
}

function getGuardianPhoneById(guardianId) {
    // Return specific guardian's phone
    const phones = {
        'dad': '+1-555-123-4567',
        'mom': '+1-555-987-6543'
    };
    return phones[guardianId];
}

function getConnectedGuardians() {
    // Return list of connected guardians
    return [
        { id: 'dad', name: 'Dad', phone: '+1-555-123-4567' },
        { id: 'mom', name: 'Mom', phone: '+1-555-987-6543' }
    ];
}

// Load user data and mock data
function loadUserData() {
    // Load any additional user-specific data
    console.log('Loading user dashboard data...');
}

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
    }
});

// Resize map when window resizes
window.addEventListener('resize', function() {
    if (map) {
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }
});
