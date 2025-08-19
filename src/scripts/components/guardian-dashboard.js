// Guardian Dashboard Functionality with Route Tracing

let map;
let markers = {};
let geofences = [];
let routingControls = {}; // Store routing controls for each user
let userRoutes = {}; // Store route information
let currentSection = 'overview';
let guardianLocation = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    initializeMap();
    loadUserData();
    loadMockData();
    setupEventListeners();
    setupGuardianLocation();
});

// Initialize dashboard
function initializeDashboard() {
    console.log('Guardian Dashboard initialized');
    
    // Check if user is logged in and has guardian role
    const selectedRole = localStorage.getItem('selected_role');
    if (selectedRole !== 'guardian') {
        window.location.href = 'role-selection.html';
        return;
    }
    
    // Load user info
    const userData = getUserData();
    if (userData) {
        const name = userData.firstName || userData.email.split('@')[0];
        document.getElementById('guardian-name').textContent = name;
        document.getElementById('welcome-name').textContent = name;
        document.getElementById('profile-name').textContent = name;
    }
}

// Initialize map with routing capability
function initializeMap() {
    map = L.map('guardian-map').setView([40.7128, -74.0060], 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Add sample markers
    addSampleMarkers();
    
    // Add guardian marker
    addGuardianMarker();
}

// Setup guardian location tracking
function setupGuardianLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                guardianLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                updateGuardianMarker();
            },
            function(error) {
                console.warn('Guardian location not available:', error);
                // Use default location for demo
                guardianLocation = { lat: 40.7128, lng: -74.0060 };
                updateGuardianMarker();
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
        );
    } else {
        // Use default location
        guardianLocation = { lat: 40.7128, lng: -74.0060 };
        updateGuardianMarker();
    }
}

// Add guardian marker to map
function addGuardianMarker() {
    if (guardianLocation) {
        const guardianMarker = L.marker([guardianLocation.lat, guardianLocation.lng], {
            icon: L.divIcon({
                className: 'guardian-location-marker',
                html: '<div class="guardian-marker-inner"><i class="fas fa-user-shield"></i></div>',
                iconSize: [35, 35],
                iconAnchor: [17, 17]
            })
        }).addTo(map);
        
        guardianMarker.bindPopup('Your Location (Guardian)');
    }
}

// Update guardian marker position
function updateGuardianMarker() {
    // Remove existing guardian marker
    map.eachLayer(function(layer) {
        if (layer.options && layer.options.icon && 
            layer.options.icon.options.className === 'guardian-location-marker') {
            map.removeLayer(layer);
        }
    });
    
    // Add updated guardian marker
    addGuardianMarker();
}

// Add sample markers to map with enhanced functionality
function addSampleMarkers() {
    const users = [
        { id: 'user1', name: 'Sarah Johnson', lat: 40.7589, lng: -73.9851, status: 'online' },
        { id: 'user2', name: 'Mike Wilson', lat: 40.7505, lng: -73.9934, status: 'online' },
        { id: 'user3', name: 'Emma Davis', lat: 40.7282, lng: -74.0776, status: 'away' }
    ];
    
    users.forEach(user => {
        const marker = L.marker([user.lat, user.lng], {
            icon: L.divIcon({
                className: 'user-location-marker',
                html: `<div class="user-marker-inner ${user.status}"><i class="fas fa-user"></i></div>`,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        }).addTo(map);
        
        marker.bindPopup(`
            <div class="marker-popup">
                <h4>${user.name}</h4>
                <p>Status: <span class="status-${user.status}">${user.status}</span></p>
                <div class="popup-actions">
                    <button onclick="focusOnUser('${user.id}')" class="btn-sm">View Details</button>
                    <button onclick="drawRouteToUser('${user.id}', ${user.lat}, ${user.lng})" class="btn-sm route-btn">Show Route</button>
                </div>
            </div>
        `);
        
        markers[user.id] = marker;
    });
    
    // Add sample geofence
    const homeGeofence = L.circle([40.7128, -74.0060], {
        color: 'green',
        fillColor: '#90EE90',
        fillOpacity: 0.3,
        radius: 500
    }).addTo(map);
    
    homeGeofence.bindPopup('Home Safe Zone');
}

// Function to draw route between guardian and user
function drawRouteToUser(userId, userLat, userLng) {
    if (!guardianLocation) {
        alert('Guardian location not available. Please enable location services.');
        return;
    }
    
    // Remove existing route for this user
    if (routingControls[userId]) {
        map.removeControl(routingControls[userId]);
        delete routingControls[userId];
        delete userRoutes[userId];
        
        // Update UI
        updateRouteButton(userId, false);
        updateUserRouteInfo(userId);
        return;
    }
    
    // Show loading state
    showRouteLoading(userId, true);
    
    // Create new route using Leaflet Routing Machine
    const routingControl = L.Routing.control({
        waypoints: [
            L.latLng(guardianLocation.lat, guardianLocation.lng), // Guardian location
            L.latLng(userLat, userLng) // User location
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        lineOptions: {
            styles: [
                { color: '#2563EB', weight: 6, opacity: 0.8 },
                { color: '#ffffff', weight: 2, opacity: 1 }
            ]
        },
        createMarker: function() { return null; }, // Don't create default markers
        show: false, // Hide the directions panel initially
        collapsible: true,
        router: L.Routing.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1'
        })
    }).on('routesfound', function(e) {
        const routes = e.routes;
        const summary = routes[0].summary;
        
        // Store route information
        userRoutes[userId] = {
            distance: (summary.totalDistance / 1000).toFixed(1) + ' km',
            duration: Math.round(summary.totalTime / 60) + ' min',
            route: routes[0],
            coordinates: routes[0].coordinates
        };
        
        // Update UI with route info
        updateUserRouteInfo(userId);
        updateRouteButton(userId, true);
        showRouteLoading(userId, false);
        
        // Show route instructions in console (can be displayed in UI)
        console.log(`Route to ${getUserName(userId)}:`, userRoutes[userId]);
        
    }).on('routingerror', function(e) {
        console.error('Routing error:', e);
        showRouteLoading(userId, false);
        alert('Could not find route. Showing direct line instead.');
        
        // Fallback to straight line
        drawStraightLineToUser(userId, userLat, userLng);
    });
    
    try {
        routingControl.addTo(map);
        routingControls[userId] = routingControl;
    } catch (error) {
        console.error('Error adding route control:', error);
        showRouteLoading(userId, false);
        // Fallback to straight line
        drawStraightLineToUser(userId, userLat, userLng);
    }
}

// Fallback function to draw straight line
function drawStraightLineToUser(userId, userLat, userLng) {
    if (!guardianLocation) return;
    
    const line = L.polyline([
        [guardianLocation.lat, guardianLocation.lng],
        [userLat, userLng]
    ], {
        color: '#2563EB',
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 10'
    }).addTo(map);
    
    // Calculate straight-line distance
    const distance = map.distance(
        [guardianLocation.lat, guardianLocation.lng], 
        [userLat, userLng]
    );
    
    // Store route information
    userRoutes[userId] = {
        distance: (distance / 1000).toFixed(1) + ' km',
        duration: 'Direct line',
        route: null,
        polyline: line
    };
    
    line.bindPopup(`Direct distance to ${getUserName(userId)}: ${(distance / 1000).toFixed(1)} km`);
    
    // Update UI
    updateUserRouteInfo(userId);
    updateRouteButton(userId, true);
}

// Toggle route for specific user
function toggleRouteToUser(userId) {
    const userMarker = markers[userId];
    if (!userMarker) return;
    
    const userLatLng = userMarker.getLatLng();
    
    if (routingControls[userId] || (userRoutes[userId] && userRoutes[userId].polyline)) {
        // Route exists, remove it
        if (routingControls[userId]) {
            map.removeControl(routingControls[userId]);
            delete routingControls[userId];
        }
        
        if (userRoutes[userId] && userRoutes[userId].polyline) {
            map.removeLayer(userRoutes[userId].polyline);
        }
        
        delete userRoutes[userId];
        
        updateRouteButton(userId, false);
        updateUserRouteInfo(userId);
    } else {
        // Create route
        drawRouteToUser(userId, userLatLng.lat, userLatLng.lng);
    }
}

// Update route button appearance
function updateRouteButton(userId, isActive) {
    const button = document.querySelector(`[data-user="${userId}"] .route-btn`);
    if (button) {
        if (isActive) {
            button.innerHTML = '<i class="fas fa-times"></i>';
            button.classList.add('active');
            button.title = 'Hide route';
        } else {
            button.innerHTML = '<i class="fas fa-route"></i>';
            button.classList.remove('active');
            button.title = 'Show route';
        }
    }
}

// Show/hide route loading state
function showRouteLoading(userId, isLoading) {
    const button = document.querySelector(`[data-user="${userId}"] .route-btn`);
    if (button) {
        if (isLoading) {
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            button.disabled = true;
        } else {
            button.disabled = false;
        }
    }
}

// Update user route information in the UI
function updateUserRouteInfo(userId) {
    const routeInfo = userRoutes[userId];
    const userElement = document.querySelector(`[data-user="${userId}"] .user-info`);
    
    if (!userElement) return;
    
    let routeInfoElement = userElement.querySelector('.route-info');
    
    if (routeInfo) {
        if (!routeInfoElement) {
            routeInfoElement = document.createElement('div');
            routeInfoElement.className = 'route-info';
            userElement.appendChild(routeInfoElement);
        }
        
        routeInfoElement.innerHTML = `
            <small style="color: var(--primary-blue); display: flex; align-items: center; gap: 4px; margin-top: 4px;">
                <i class="fas fa-route"></i> 
                ${routeInfo.distance} • ${routeInfo.duration}
            </small>
        `;
    } else {
        if (routeInfoElement) {
            routeInfoElement.remove();
        }
    }
}

// Get user name by ID
function getUserName(userId) {
    const userNames = {
        'user1': 'Sarah Johnson',
        'user2': 'Mike Wilson',
        'user3': 'Emma Davis'
    };
    return userNames[userId] || 'Unknown User';
}

// Show all routes to all users
function showAllRoutes() {
    Object.keys(markers).forEach(userId => {
        const marker = markers[userId];
        const latLng = marker.getLatLng();
        
        if (!routingControls[userId] && !userRoutes[userId]) {
            drawRouteToUser(userId, latLng.lat, latLng.lng);
        }
    });
}

// Hide all routes
function hideAllRoutes() {
    Object.keys(routingControls).forEach(userId => {
        if (routingControls[userId]) {
            map.removeControl(routingControls[userId]);
            delete routingControls[userId];
        }
    });
    
    Object.keys(userRoutes).forEach(userId => {
        if (userRoutes[userId] && userRoutes[userId].polyline) {
            map.removeLayer(userRoutes[userId].polyline);
        }
        delete userRoutes[userId];
        updateRouteButton(userId, false);
        updateUserRouteInfo(userId);
    });
}

// Load mock data
function loadMockData() {
    // Update statistics
    document.getElementById('active-users').textContent = '3';
    document.getElementById('active-alerts').textContent = '1';
    document.getElementById('notification-count').textContent = '2';
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

// Navigation functions
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionName + '-section').classList.add('active');
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    event.target.closest('.nav-item').classList.add('active');
    
    currentSection = sectionName;
}

// Toggle notifications panel
function toggleNotifications() {
    const panel = document.getElementById('notification-panel');
    panel.classList.toggle('hidden');
}

// Toggle profile menu
function toggleProfileMenu() {
    const menu = document.getElementById('profile-menu');
    menu.classList.toggle('hidden');
}

// Clear all notifications
function clearAllNotifications() {
    const notificationList = document.querySelector('.notification-list');
    notificationList.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 20px;">No notifications</p>';
    document.getElementById('notification-count').textContent = '0';
}

// Map control functions
function centerMap() {
    if (guardianLocation) {
        map.setView([guardianLocation.lat, guardianLocation.lng], 12);
    } else {
        map.setView([40.7128, -74.0060], 12);
    }
}

function toggleMapLayers() {
    // Toggle between different map layers
    alert('Map layers feature will be implemented');
}

function fullscreenMap() {
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer.requestFullscreen) {
        mapContainer.requestFullscreen();
    }
}

// User management functions
function focusOnUser(userId) {
    if (markers[userId]) {
        const marker = markers[userId];
        map.setView(marker.getLatLng(), 15);
        marker.openPopup();
    }
}

function messageUser(userId) {
    alert(`Opening message dialog for user: ${getUserName(userId)}`);
}

function callUser(userId) {
    // Get user data and initiate call
    const confirmation = confirm(`Are you sure you want to call ${getUserName(userId)}?`);
    if (confirmation) {
        // This would integrate with the SOS calling system we discussed earlier
        const userPhone = getUserPhone(userId);
        if (userPhone) {
            window.location.href = `tel:${userPhone}`;
        } else {
            alert('Phone number not available for this user.');
        }
    }
}

function getUserPhone(userId) {
    // Demo phone numbers
    const phones = {
        'user1': '+1-555-0101',
        'user2': '+1-555-0102',
        'user3': '+1-555-0103'
    };
    return phones[userId];
}

function showAddUserModal() {
    document.getElementById('add-user-modal').classList.remove('hidden');
}

function closeAddUserModal() {
    document.getElementById('add-user-modal').classList.add('hidden');
    document.getElementById('add-user-form').reset();
}

function addNewUser(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const userData = {
        name: formData.get('userName'),
        email: formData.get('userEmail'),
        phone: formData.get('userPhone'),
        relationship: formData.get('relationship')
    };
    
    // Simulate adding user
    console.log('Adding new user:', userData);
    
    // Show success message
    alert('Invitation sent successfully!');
    
    // Close modal
    closeAddUserModal();
    
    // In real implementation, this would:
    // 1. Send invitation email to user
    // 2. Add pending user to database
    // 3. Update the users list when they accept
}

// Quick action functions
function createGeofence() {
    alert('Geofence creation tool will be implemented');
}

function sendBroadcast() {
    const message = prompt('Enter broadcast message:');
    if (message) {
        alert(`Broadcast sent: "${message}"`);
    }
}

function emergencyMode() {
    const confirmation = confirm('Are you sure you want to activate emergency mode? This will alert all connected users.');
    if (confirmation) {
        alert('Emergency mode activated! All users have been notified.');
        
        // Show routes to all users in emergency mode
        showAllRoutes();
    }
}

function viewReports() {
    alert('Reports view will be implemented');
}

// Alert functions
function viewAlert(alertId) {
    alert(`Viewing alert details: ${alertId}`);
}

// Profile functions
function editProfile() {
    alert('Profile editing will be implemented');
}

function accountSettings() {
    alert('Account settings will be implemented');
}

function switchRole() {
    const confirmation = confirm('Switch to User mode? You can switch back anytime.');
    if (confirmation) {
        localStorage.setItem('selected_role', 'user');
        window.location.href = 'user-dashboard.html';
    }
}

function logout() {
    const confirmation = confirm('Are you sure you want to logout?');
    if (confirmation) {
        localStorage.removeItem('geoguardian_user');
        sessionStorage.removeItem('geoguardian_user');
        localStorage.removeItem('selected_role');
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

// Load user data
function loadUserData() {
    const userData = getUserData();
    if (userData) {
        console.log('Guardian dashboard loaded for:', userData.email);
    }
}

// Resize map when window resizes
window.addEventListener('resize', function() {
    if (map) {
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }
});

// Cleanup routes on page unload
window.addEventListener('beforeunload', function() {
    hideAllRoutes();
});

// Auto-refresh user locations (simulate real-time updates)
setInterval(function() {
    // In a real app, this would fetch updated locations from the server
    console.log('Checking for user location updates...');
    
    // Update routes if they exist
    Object.keys(routingControls).forEach(userId => {
        if (markers[userId]) {
            const latLng = markers[userId].getLatLng();
            // Refresh route if user moved significantly
            // This would be based on actual location changes
        }
    });
}, 30000); // Check every 30 seconds
