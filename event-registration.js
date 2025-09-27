// Event Registration System JavaScript
// This replaces the skill swap functionality with event registration

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Global state
let currentUser = null;
let events = [];
let currentPage = 1;
const eventsPerPage = 6;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    loadEvents();
    setupEventListeners();
    setupAnimations();
});

// Check if user is logged in
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('currentUser');
    
    if (token && userData) {
        currentUser = JSON.parse(userData);
        updateNavigation();
    } else {
        showLoginPrompt();
    }
}

// Update navigation based on auth status
function updateNavigation() {
    const navAuth = document.getElementById('navAuth');
    if (!navAuth) return;
    
    if (currentUser) {
        navAuth.innerHTML = `
            <div class="flex items-center space-x-4">
                <div class="relative group">
                    <button onclick="toggleProfileMenu()" class="flex items-center space-x-2 text-white hover:text-cyan-400 transition-colors">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
                            ${currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span class="hidden md:block">${currentUser.name || 'User'}</span>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>
                    <div id="profileMenu" class="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                        <a href="my-profile.html" class="block px-4 py-2 text-white hover:bg-white/10 transition-colors">My Profile</a>
                        <a href="#" onclick="showMyEvents()" class="block px-4 py-2 text-white hover:bg-white/10 transition-colors">My Events</a>
                        ${currentUser.isAdmin ? `
                        <a href="admin-panel.html" class="block px-4 py-2 text-white hover:bg-white/10 transition-colors">
                            <i class="fas fa-cog mr-2"></i>Admin Panel
                        </a>
                        ` : ''}
                        <hr class="border-white/20">
                        <button onclick="logout()" class="block w-full text-left px-4 py-2 text-red-400 hover:bg-white/10 transition-colors">Logout</button>
                    </div>
                </div>
            </div>
        `;
    } else {
        navAuth.innerHTML = `
            <a href="login.html" class="cyber-button">
                <i class="fas fa-sign-in-alt mr-2"></i>Login
            </a>
            <a href="register.html" class="cyber-button success">
                <i class="fas fa-user-plus mr-2"></i>Register
            </a>
        `;
    }
}

// Show login prompt
function showLoginPrompt() {
    const userGrid = document.getElementById('userGrid');
    if (userGrid) {
        userGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="glass rounded-3xl p-8 max-w-md mx-auto">
                    <h3 class="text-2xl font-bold text-white mb-4">Welcome to Event Registration</h3>
                    <p class="text-white/80 mb-6">Please login or register to view and register for events.</p>
                    <div class="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="login.html" class="cyber-button">Login</a>
                        <a href="register.html" class="glass px-6 py-3 rounded-full text-white hover:bg-white hover:text-black transition-all duration-300">Register</a>
                    </div>
                </div>
            </div>
        `;
    }
}

// Load events from API
async function loadEvents() {
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE_URL}/events?page=${currentPage}&limit=${eventsPerPage}`);
        const data = await response.json();
        
        if (data.success) {
            events = data.data.events;
            renderEvents();
        } else {
            showToast('Failed to load events', 'error');
        }
    } catch (error) {
        console.error('Error loading events:', error);
        showToast('Error loading events', 'error');
    } finally {
        showLoading(false);
    }
}

// Render events
function renderEvents() {
    const userGrid = document.getElementById('userGrid');
    if (!userGrid) return;
    
    if (events.length === 0) {
        userGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="glass rounded-3xl p-8">
                    <h3 class="text-2xl font-bold text-white mb-4">No Events Available</h3>
                    <p class="text-white/80">Check back later for new events!</p>
                </div>
            </div>
        `;
        return;
    }
    
    userGrid.innerHTML = '';
    
    events.forEach((event, index) => {
        const eventCard = createEventCard(event, index);
        userGrid.appendChild(eventCard);
        
        // Staggered animation
        setTimeout(() => {
            eventCard.style.opacity = '1';
            eventCard.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Create event card
function createEventCard(event, index) {
    const card = document.createElement('div');
    card.className = 'user-card float';
    card.style.animationDelay = `${index * 0.5}s`;
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease';
    
    const eventDate = new Date(event.date);
    const isPast = eventDate < new Date();
    const isFull = event.availableSeats <= 0;
    const canRegister = !isPast && !isFull && event.registrationStatus === 'open';
    
    card.innerHTML = `
        <div class="flex items-center mb-6">
            <div class="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-400 to-pink-400 flex items-center justify-center text-white font-bold text-xl mr-4">
                ${event.eventName.charAt(0).toUpperCase()}
            </div>
            <div>
                <h3 class="text-xl font-bold text-white">${event.eventName}</h3>
                <p class="text-cyan-400">${event.organizer}</p>
            </div>
        </div>
        
        <div class="mb-6">
            <p class="text-white/80 mb-4">${event.description || 'No description available'}</p>
            <div class="flex flex-wrap gap-2 mb-4">
                ${event.tags ? event.tags.map(tag => `<span class="skill-tag">${tag}</span>`).join('') : ''}
            </div>
        </div>
        
        <div class="mb-6">
            <div class="flex items-center text-white/80 mb-2">
                <i class="fas fa-calendar-alt mr-2"></i>
                <span>${eventDate.toLocaleDateString()} at ${eventDate.toLocaleTimeString()}</span>
            </div>
            ${event.location ? `
                <div class="flex items-center text-white/80 mb-2">
                    <i class="fas fa-map-marker-alt mr-2"></i>
                    <span>${event.location}</span>
                </div>
            ` : ''}
            <div class="flex items-center text-white/80">
                <i class="fas fa-users mr-2"></i>
                <span>${event.participantCount || 0} / ${event.capacity} registered</span>
            </div>
        </div>
        
        <div class="flex justify-between items-center">
            <div class="flex items-center space-x-4">
                <span class="${getStatusColor(event.registrationStatus)} text-sm font-semibold">
                    ${getStatusText(event.registrationStatus, event.availableSeats)}
                </span>
                ${event.waitingListCount > 0 ? `
                    <span class="text-yellow-400 text-sm">
                        <i class="fas fa-clock mr-1"></i>
                        ${event.waitingListCount} waiting
                    </span>
                ` : ''}
            </div>
            <div class="flex space-x-2">
                <button onclick="viewEventDetails('${event._id}')" class="glass px-4 py-2 rounded-lg text-white hover:bg-white hover:text-black transition-all duration-300 text-sm">
                    <i class="fas fa-eye mr-1"></i>View
                </button>
                ${canRegister ? `
                    <button onclick="registerForEvent('${event._id}')" class="cyber-button text-sm">
                        <i class="fas fa-plus mr-1"></i>Register
                    </button>
                ` : ''}
            </div>
        </div>
    `;
    
    return card;
}

// Get status color
function getStatusColor(status) {
    switch(status) {
        case 'open': return 'text-green-400';
        case 'full': return 'text-yellow-400';
        case 'closed': return 'text-red-400';
        case 'past': return 'text-gray-400';
        default: return 'text-gray-400';
    }
}

// Get status text
function getStatusText(status, availableSeats) {
    switch(status) {
        case 'open': return availableSeats > 0 ? `${availableSeats} seats available` : 'Full';
        case 'full': return 'Full';
        case 'closed': return 'Registration closed';
        case 'past': return 'Event ended';
        default: return 'Unknown';
    }
}

// Register for event
async function registerForEvent(eventId) {
    if (!currentUser) {
        showToast('Please login to register for events', 'error');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ eventId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            loadEvents(); // Refresh events
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        console.error('Error registering for event:', error);
        showToast('Error registering for event', 'error');
    }
}

// View event details
function viewEventDetails(eventId) {
    const event = events.find(e => e._id === eventId);
    if (!event) return;
    
    // Create modal for event details
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${event.eventName}</h3>
                <button class="close-btn" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="event-details">
                    <div class="detail-row">
                        <i class="fas fa-calendar-alt"></i>
                        <span>${new Date(event.date).toLocaleDateString()} at ${new Date(event.date).toLocaleTimeString()}</span>
                    </div>
                    ${event.location ? `
                        <div class="detail-row">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${event.location}</span>
                        </div>
                    ` : ''}
                    <div class="detail-row">
                        <i class="fas fa-user"></i>
                        <span>Organized by ${event.organizer}</span>
                    </div>
                    <div class="detail-row">
                        <i class="fas fa-users"></i>
                        <span>${event.participantCount || 0} / ${event.capacity} registered</span>
                    </div>
                    ${event.description ? `
                        <div class="detail-row">
                            <i class="fas fa-info-circle"></i>
                            <span>${event.description}</span>
                        </div>
                    ` : ''}
                    ${event.tags && event.tags.length > 0 ? `
                        <div class="detail-row">
                            <i class="fas fa-tags"></i>
                            <div class="tags">
                                ${event.tags.map(tag => `<span class="skill-tag">${tag}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="modal-footer">
                <button onclick="closeModal()" class="btn btn-secondary">Close</button>
                ${event.registrationStatus === 'open' && event.availableSeats > 0 ? `
                    <button onclick="registerForEvent('${event._id}'); closeModal();" class="btn btn-primary">Register</button>
                ` : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

// Show my events
async function showMyEvents() {
    if (!currentUser) {
        showToast('Please login to view your events', 'error');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/register/my-events`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMyEventsModal(data.data.events);
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        console.error('Error loading my events:', error);
        showToast('Error loading your events', 'error');
    }
}

// Show my events modal
function showMyEventsModal(myEvents) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>My Registered Events</h3>
                <button class="close-btn" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                ${myEvents.length === 0 ? `
                    <div class="text-center py-8">
                        <p class="text-white/80">You haven't registered for any events yet.</p>
                    </div>
                ` : `
                    <div class="events-list">
                        ${myEvents.map(event => `
                            <div class="event-item">
                                <div class="event-info">
                                    <h4>${event.eventName}</h4>
                                    <p>${new Date(event.eventDate).toLocaleDateString()}</p>
                                    <p>${event.location || 'Location TBD'}</p>
                                </div>
                                <div class="event-actions">
                                    <button onclick="cancelRegistration('${event.eventId}')" class="btn btn-danger btn-sm">Cancel</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
            <div class="modal-footer">
                <button onclick="closeModal()" class="btn btn-secondary">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

// Cancel registration
async function cancelRegistration(eventId) {
    if (!confirm('Are you sure you want to cancel your registration?')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/register/${eventId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            closeModal();
            loadEvents(); // Refresh events
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        console.error('Error cancelling registration:', error);
        showToast('Error cancelling registration', 'error');
    }
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    currentUser = null;
    updateNavigation();
    loadEvents();
    showToast('Logged out successfully', 'success');
}

// Toggle profile menu
function toggleProfileMenu() {
    const menu = document.getElementById('profileMenu');
    if (menu) {
        menu.classList.toggle('opacity-0');
        menu.classList.toggle('invisible');
    }
}

// Show loading state
function showLoading(show) {
    const userGrid = document.getElementById('userGrid');
    if (!userGrid) return;
    
    if (show) {
        userGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="loading-spinner mx-auto mb-4"></div>
                <p class="text-white/80">Loading events...</p>
            </div>
        `;
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    // Create toast if it doesn't exist
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        toast.innerHTML = `
            <div class="toast-content">
                <i class="toast-icon"></i>
                <span class="toast-message"></span>
            </div>
        `;
        document.body.appendChild(toast);
    }
    
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('.toast-icon');
    
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    
    if (type === 'success') {
        toastIcon.className = 'toast-icon fas fa-check-circle';
    } else {
        toastIcon.className = 'toast-icon fas fa-exclamation-circle';
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const eventCards = document.querySelectorAll('.user-card');
            
            eventCards.forEach(card => {
                const eventName = card.querySelector('h3').textContent.toLowerCase();
                const eventDescription = card.querySelector('p').textContent.toLowerCase();
                
                const matches = eventName.includes(searchTerm) || eventDescription.includes(searchTerm);
                
                if (matches || searchTerm === '') {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
    
    // Filter functionality
    document.querySelectorAll('.filter-pill').forEach(pill => {
        pill.addEventListener('click', function() {
            document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            
            // Filter events by tag
            const filterTag = this.textContent.toLowerCase();
            const eventCards = document.querySelectorAll('.user-card');
            
            eventCards.forEach(card => {
                const tags = Array.from(card.querySelectorAll('.skill-tag')).map(tag => tag.textContent.toLowerCase());
                const matches = filterTag === 'all events' || tags.some(tag => tag.includes(filterTag));
                
                if (matches) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Setup animations
function setupAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all animated elements
    document.querySelectorAll('.user-card').forEach(el => {
        observer.observe(el);
    });
}

// Add CSS for the event registration system
const style = document.createElement('style');
style.textContent = `
    .event-details {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    
    .detail-row {
        display: flex;
        align-items: center;
        gap: 8px;
        color: white;
    }
    
    .detail-row i {
        width: 16px;
        color: #00d4ff;
    }
    
    .detail-row .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
    }
    
    .events-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    
    .event-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .event-info h4 {
        color: white;
        margin: 0 0 4px 0;
    }
    
    .event-info p {
        color: rgba(255, 255, 255, 0.7);
        margin: 0;
        font-size: 14px;
    }
    
    .event-actions {
        display: flex;
        gap: 8px;
    }
    
    .btn-sm {
        padding: 6px 12px;
        font-size: 12px;
    }
    
    .btn-danger {
        background: #dc3545;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.3s;
    }
    
    .btn-danger:hover {
        background: #c82333;
    }
    
    .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        border-left: 4px solid #00d4ff;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        z-index: 1000;
    }
    
    .toast.show {
        transform: translateX(0);
    }
    
    .toast.success {
        border-left-color: #28a745;
    }
    
    .toast.error {
        border-left-color: #dc3545;
    }
    
    .toast-content {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .toast-icon {
        font-size: 16px;
    }
    
    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid rgba(255, 255, 255, 0.1);
        border-top: 3px solid #00d4ff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
