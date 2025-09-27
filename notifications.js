// Notifications Page JavaScript

// Get notifications from data manager
let notifications = dataManager.getNotifications();

// If no notifications exist, create some sample ones
if (notifications.length === 0) {
    const sampleNotifications = [
        {
            type: 'request',
            title: 'New Skill Swap Request',
            text: 'Sarah Chen wants to swap React skills with your UI/UX Design expertise',
            user: {
                name: 'Sarah Chen',
                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
            },
            actions: ['Accept', 'Decline', 'Message']
        },
        {
            type: 'message',
            title: 'New Message from Marcus',
            text: 'Marcus Rodriguez sent you a message about Python learning',
            user: {
                name: 'Marcus Rodriguez',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
            },
            actions: ['Reply', 'View Chat']
        },
        {
            type: 'connection',
            title: 'New Connection',
            text: 'Emma Thompson accepted your connection request',
            user: {
                name: 'Emma Thompson',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
            },
            actions: ['View Profile', 'Message']
        },
        {
            type: 'skill',
            title: 'Skill Achievement Unlocked',
            text: 'Congratulations! You\'ve completed the React Fundamentals course',
            user: null,
            actions: ['View Certificate', 'Share']
        },
        {
            type: 'request',
            title: 'Skill Swap Request Accepted',
            text: 'David Kim accepted your skill swap proposal for Photography ↔ JavaScript',
            user: {
                name: 'David Kim',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
            },
            actions: ['Schedule Session', 'Message']
        }
    ];
    
    sampleNotifications.forEach(notification => {
        dataManager.addNotification(notification);
    });
    
    notifications = dataManager.getNotifications();
}

// Current state
let currentFilter = 'all';
let filteredNotifications = [...notifications];
let currentPage = 0;
const notificationsPerPage = 10;

// DOM Elements
const notificationsList = document.getElementById('notificationsList');
const emptyState = document.getElementById('emptyState');
const loadMoreContainer = document.getElementById('loadMoreContainer');
const loadMoreBtn = document.getElementById('loadMoreBtn');

// Initialize the notifications page
document.addEventListener('DOMContentLoaded', function() {
    loadNotifications();
    setupEventListeners();
    setupAnimations();
    updateTabCounts();
});

// Load notifications
function loadNotifications() {
    const startIndex = currentPage * notificationsPerPage;
    const endIndex = startIndex + notificationsPerPage;
    const notificationsToShow = filteredNotifications.slice(startIndex, endIndex);
    
    if (currentPage === 0) {
        notificationsList.innerHTML = '';
    }
    
    if (notificationsToShow.length === 0 && currentPage === 0) {
        showEmptyState();
        return;
    }
    
    hideEmptyState();
    
    notificationsToShow.forEach((notification, index) => {
        const notificationElement = createNotificationElement(notification, startIndex + index);
        notificationsList.appendChild(notificationElement);
        
        // Staggered animation
        setTimeout(() => {
            notificationElement.style.opacity = '1';
            notificationElement.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    updateLoadMoreButton();
}

// Create notification element
function createNotificationElement(notification, index) {
    const notificationDiv = document.createElement('div');
    notificationDiv.className = `notification-item ${notification.read ? '' : 'unread'}`;
    notificationDiv.style.opacity = '0';
    notificationDiv.style.transform = 'translateY(20px)';
    notificationDiv.style.transition = 'all 0.6s ease';
    notificationDiv.onclick = () => openNotificationDetail(notification);
    
    const iconClass = getNotificationIcon(notification.type);
    const userAvatar = notification.user ? 
        `<img src="${notification.user.avatar}" alt="${notification.user.name}" class="notification-avatar">` : '';
    
    notificationDiv.innerHTML = `
        <div class="notification-header">
            <div class="notification-icon ${notification.type}">
                <i class="${iconClass}"></i>
            </div>
            ${userAvatar}
            <div class="notification-content">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-text">${notification.text}</div>
            </div>
        </div>
        <div class="notification-meta">
            <div class="notification-time">${notification.timestamp}</div>
            <div class="notification-actions">
                ${notification.actions.map(action => 
                    `<button class="notification-action-btn" onclick="handleNotificationAction('${action}', ${notification.id})">${action}</button>`
                ).join('')}
            </div>
        </div>
    `;
    
    return notificationDiv;
}

// Get notification icon
function getNotificationIcon(type) {
    const icons = {
        request: 'fas fa-handshake',
        message: 'fas fa-envelope',
        connection: 'fas fa-user-plus',
        skill: 'fas fa-trophy'
    };
    return icons[type] || 'fas fa-bell';
}

// Open notification detail
function openNotificationDetail(notification) {
    const modal = document.getElementById('notificationModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalFooter = document.getElementById('modalFooter');
    
    modalTitle.textContent = notification.title;
    
    let bodyContent = `
        <div class="notification-detail">
            <div class="detail-header">
                ${notification.user ? `<img src="${notification.user.avatar}" alt="${notification.user.name}" class="detail-avatar">` : ''}
                <div class="detail-info">
                    <h4>${notification.title}</h4>
                    <p class="detail-time">${notification.timestamp}</p>
                </div>
            </div>
            <div class="detail-content">
                <p>${notification.text}</p>
            </div>
        </div>
    `;
    
    modalBody.innerHTML = bodyContent;
    
    let footerContent = `
        <button class="btn-secondary" onclick="closeNotificationModal()">Close</button>
    `;
    
    notification.actions.forEach(action => {
        footerContent += `
            <button class="btn-primary" onclick="handleNotificationAction('${action}', ${notification.id})">${action}</button>
        `;
    });
    
    modalFooter.innerHTML = footerContent;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Mark as read
    if (!notification.read) {
        notification.read = true;
        updateNotificationUI(notification.id);
    }
}

// Close notification modal
function closeNotificationModal() {
    document.getElementById('notificationModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Handle notification action
function handleNotificationAction(action, notificationId) {
    const notification = notifications.find(n => n.id === notificationId);
    
    switch (action) {
        case 'Accept':
            showToast('Request accepted!', 'success');
            break;
        case 'Decline':
            showToast('Request declined', 'success');
            break;
        case 'Message':
            window.location.href = 'messages.html';
            break;
        case 'Reply':
            window.location.href = 'messages.html';
            break;
        case 'View Chat':
            window.location.href = 'messages.html';
            break;
        case 'View Profile':
            window.location.href = 'profile.html';
            break;
        case 'View Certificate':
            showToast('Certificate downloaded!', 'success');
            break;
        case 'Share':
            showToast('Shared on social media!', 'success');
            break;
        case 'Schedule Session':
            showToast('Redirecting to scheduling...', 'success');
            break;
        case 'Rate Session':
            showToast('Rating submitted!', 'success');
            break;
        case 'Leave Review':
            showToast('Review submitted!', 'success');
            break;
        case 'Enroll Now':
            showToast('Enrolled in course!', 'success');
            break;
        case 'Learn More':
            showToast('Redirecting to course details...', 'success');
            break;
        case 'Complete Profile':
            window.location.href = 'profile.html';
            break;
        case 'Dismiss':
            dismissNotification(notificationId);
            break;
        case 'Mute':
            showToast('Group muted', 'success');
            break;
        case 'View Group':
            showToast('Redirecting to group...', 'success');
            break;
        default:
            showToast(`${action} action completed`, 'success');
    }
    
    closeNotificationModal();
}

// Dismiss notification
function dismissNotification(notificationId) {
    const index = notifications.findIndex(n => n.id === notificationId);
    if (index > -1) {
        notifications.splice(index, 1);
        filterNotifications(currentFilter);
        showToast('Notification dismissed', 'success');
    }
}

// Filter notifications
function filterNotifications(filter) {
    currentFilter = filter;
    currentPage = 0;
    
    if (filter === 'all') {
        filteredNotifications = [...notifications];
    } else {
        filteredNotifications = notifications.filter(n => n.type === filter);
    }
    
    loadNotifications();
    updateTabCounts();
}

// Update tab counts
function updateTabCounts() {
    const counts = {
        all: notifications.length,
        requests: notifications.filter(n => n.type === 'request').length,
        messages: notifications.filter(n => n.type === 'message').length,
        connections: notifications.filter(n => n.type === 'connection').length,
        skills: notifications.filter(n => n.type === 'skill').length
    };
    
    Object.keys(counts).forEach(filter => {
        const tab = document.getElementById(`${filter}Tab`);
        if (tab) {
            const countElement = tab.querySelector('.tab-count');
            if (countElement) {
                countElement.textContent = counts[filter];
            }
        }
    });
}

// Mark all as read
function markAllAsRead() {
    notifications.forEach(notification => {
        notification.read = true;
    });
    
    // Update UI
    const notificationElements = notificationsList.querySelectorAll('.notification-item');
    notificationElements.forEach(element => {
        element.classList.remove('unread');
    });
    
    showToast('All notifications marked as read', 'success');
    updateTabCounts();
}

// Clear all notifications
function clearAllNotifications() {
    if (confirm('Are you sure you want to clear all notifications?')) {
        notifications.length = 0;
        filteredNotifications = [];
        currentPage = 0;
        loadNotifications();
        updateTabCounts();
        showToast('All notifications cleared', 'success');
    }
}

// Load more notifications
function loadMoreNotifications() {
    currentPage++;
    loadNotifications();
}

// Update load more button
function updateLoadMoreButton() {
    const hasMore = (currentPage + 1) * notificationsPerPage < filteredNotifications.length;
    loadMoreContainer.style.display = hasMore ? 'block' : 'none';
}

// Show empty state
function showEmptyState() {
    notificationsList.style.display = 'none';
    emptyState.style.display = 'block';
    loadMoreContainer.style.display = 'none';
}

// Hide empty state
function hideEmptyState() {
    notificationsList.style.display = 'block';
    emptyState.style.display = 'none';
}

// Refresh notifications
function refreshNotifications() {
    showToast('Refreshing notifications...', 'success');
    setTimeout(() => {
        currentPage = 0;
        loadNotifications();
        showToast('Notifications refreshed!', 'success');
    }, 1000);
}

// Update notification UI
function updateNotificationUI(notificationId) {
    const notificationElement = notificationsList.querySelector(`[data-notification-id="${notificationId}"]`);
    if (notificationElement) {
        notificationElement.classList.remove('unread');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            // Filter notifications
            filterNotifications(tab.dataset.filter);
        });
    });
    
    // Mark all read button
    document.getElementById('markAllReadBtn').addEventListener('click', markAllAsRead);
    
    // Clear all button
    document.getElementById('clearAllBtn').addEventListener('click', clearAllNotifications);
    
    // Load more button
    document.getElementById('loadMoreBtn').addEventListener('click', loadMoreNotifications);
    
    // Modal close events
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
    
    // Keyboard events
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                activeModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        }
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
    
    // Observe notification items
    document.querySelectorAll('.notification-item').forEach(el => {
        observer.observe(el);
    });
    
    // Add hover effects
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('.notification-item')) {
            e.target.closest('.notification-item').style.transform = 'translateY(-3px) scale(1.02)';
        }
    });
    
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest('.notification-item')) {
            e.target.closest('.notification-item').style.transform = 'translateY(0) scale(1)';
        }
    });
}

// Show settings modal
function showSettingsModal() {
    document.getElementById('settingsModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close settings modal
function closeSettingsModal() {
    document.getElementById('settingsModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Save notification settings
function saveNotificationSettings() {
    const settings = {
        emailRequests: document.getElementById('emailRequests').checked,
        emailMessages: document.getElementById('emailMessages').checked,
        emailConnections: document.getElementById('emailConnections').checked,
        pushNotifications: document.getElementById('pushNotifications').checked,
        digestEmails: document.getElementById('digestEmails').checked
    };
    
    // Save to localStorage (in a real app, this would be sent to server)
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    
    closeSettingsModal();
    showToast('Notification settings saved!', 'success');
}

// Load notification settings
function loadNotificationSettings() {
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        Object.keys(settings).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.checked = settings[key];
            }
        });
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const toastElement = document.getElementById('toast');
    const toastMessage = document.querySelector('.toast-message');
    const toastIcon = document.querySelector('.toast-icon');
    
    toastMessage.textContent = message;
    toastElement.className = `toast ${type}`;
    
    if (type === 'success') {
        toastIcon.className = 'toast-icon fas fa-check-circle';
    } else {
        toastIcon.className = 'toast-icon fas fa-exclamation-circle';
    }
    
    toastElement.classList.add('show');
    
    setTimeout(() => {
        toastElement.classList.remove('show');
    }, 3000);
}

// Initialize settings on page load
document.addEventListener('DOMContentLoaded', function() {
    loadNotificationSettings();
}); 