// Get users from data manager
let users = dataManager.getUsers();

// If no users exist, add some sample users
if (users.length === 0) {
    const sampleUsers = [
        {
            name: "Sarah Chen",
            title: "Frontend Developer",
            location: "San Francisco, CA",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
            skills: ["JavaScript", "React", "UI/UX Design"],
            rating: 4.8,
            bio: "Full-stack developer passionate about creating beautiful user experiences. Love collaborating on innovative projects!",
            availableSkills: ["JavaScript", "React", "Node.js", "UI/UX Design"],
            learnSkills: ["Python", "Machine Learning", "DevOps"]
        },
        {
            name: "Marcus Rodriguez",
            title: "Data Scientist",
            location: "Austin, TX",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
            skills: ["Python", "Data Science", "Machine Learning"],
            rating: 4.9,
            bio: "Data scientist with 5+ years experience in ML and AI. Always excited to learn new technologies and share knowledge.",
            availableSkills: ["Python", "TensorFlow", "Pandas", "SQL"],
            learnSkills: ["React", "JavaScript", "Web Development"]
        },
        {
            name: "Emma Thompson",
            title: "Graphic Designer",
            location: "New York, NY",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
            skills: ["Graphic Design", "Illustration", "Branding"],
            rating: 4.7,
            bio: "Creative designer specializing in brand identity and digital illustration. Let's create something amazing together!",
            availableSkills: ["Adobe Creative Suite", "Illustration", "Branding", "Typography"],
            learnSkills: ["Web Development", "Photography", "Animation"]
        }
    ];
    
    sampleUsers.forEach(user => {
        dataManager.addUser(user);
    });
    
    users = dataManager.getUsers();
}

// Current user's skills (for suggestions)
const currentUserSkills = ["JavaScript", "React", "Node.js", "UI/UX Design"];

// DOM Elements
const userCardsContainer = document.getElementById('userCardsContainer');
const suggestionsGrid = document.getElementById('suggestionsGrid');
const requestModal = document.getElementById('requestModal');
const closeModal = document.getElementById('closeModal');
const cancelRequest = document.getElementById('cancelRequest');
const sendRequest = document.getElementById('sendRequest');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const skillFilter = document.getElementById('skillFilter');
const sortFilter = document.getElementById('sortFilter');
const toast = document.getElementById('toast');

// State
let currentPage = 0;
let filteredUsers = [...users];
const usersPerPage = 6;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    renderUserCards();
    renderSuggestions();
    setupEventListeners();
    setupAnimations();
});

// Setup event listeners
function setupEventListeners() {
    // Modal events
    closeModal.addEventListener('click', closeRequestModal);
    cancelRequest.addEventListener('click', closeRequestModal);
    sendRequest.addEventListener('click', handleSendRequest);
    
    // Filter events
    skillFilter.addEventListener('change', filterUsers);
    sortFilter.addEventListener('change', filterUsers);
    
    // Load more
    loadMoreBtn.addEventListener('click', loadMoreUsers);
    
    // Close modal on outside click
    requestModal.addEventListener('click', function(e) {
        if (e.target === requestModal) {
            closeRequestModal();
        }
    });
    
    // Keyboard events
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && requestModal.classList.contains('active')) {
            closeRequestModal();
        }
    });
}

// Render user cards
function renderUserCards() {
    // Refresh users from data manager
    users = dataManager.getUsers();
    
    const startIndex = currentPage * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const usersToShow = filteredUsers.slice(startIndex, endIndex);
    
    usersToShow.forEach((user, index) => {
        const card = createUserCard(user, startIndex + index);
        userCardsContainer.appendChild(card);
        
        // Add staggered animation
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Update load more button
    updateLoadMoreButton();
}

// Create user card element
function createUserCard(user, index) {
    const card = document.createElement('div');
    card.className = 'user-card';
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease';
    
    card.innerHTML = `
        <div class="user-header">
            <img src="${user.avatar}" alt="${user.name}" class="user-avatar">
            <div class="user-info">
                <h3>${user.name}</h3>
                <p><i class="fas fa-map-marker-alt"></i> ${user.location}</p>
            </div>
        </div>
        <div class="user-rating">
            <div class="stars">
                ${generateStars(user.rating)}
            </div>
            <span class="rating-text">${user.rating}/5.0</span>
        </div>
        <div class="user-skills">
            ${user.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
        </div>
        <p class="user-bio">${user.bio}</p>
        <div class="user-actions">
            <button class="btn btn-primary" onclick="openRequestModal(${user.id})">
                <i class="fas fa-handshake"></i>
                Request Swap
            </button>
            <button class="btn btn-secondary" onclick="viewProfile(${user.id})">
                <i class="fas fa-eye"></i>
                View
            </button>
            <button class="btn btn-rating" onclick="openRatingModal(${user.id})">
                <i class="fas fa-star"></i>
                Rate
            </button>
        </div>
    `;
    
    return card;
}

// Generate star rating
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// Render suggestions
function renderSuggestions() {
    const suggestions = generateSuggestions();
    
    suggestions.forEach((suggestion, index) => {
        const card = document.createElement('div');
        card.className = 'suggestion-card';
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.6s ease';
        
        card.innerHTML = `
            <div class="suggestion-header">
                <img src="${suggestion.user.avatar}" alt="${suggestion.user.name}" class="suggestion-avatar">
                <div class="suggestion-info">
                    <h4>${suggestion.user.name}</h4>
                    <p>${suggestion.reason}</p>
                </div>
            </div>
            <div class="suggestion-skills">
                <span class="suggestion-skill">${suggestion.teachSkill}</span>
                <i class="fas fa-exchange-alt"></i>
                <span class="suggestion-skill">${suggestion.learnSkill}</span>
            </div>
            <button class="suggestion-action" onclick="openRequestModal(${suggestion.user.id})">
                Start Swap
            </button>
        `;
        
        suggestionsGrid.appendChild(card);
        
        // Staggered animation
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 150);
    });
}

// Generate suggestions based on current user's skills
function generateSuggestions() {
    const suggestions = [];
    const currentUserSkillSet = new Set(currentUserSkills);
    
    users.forEach(user => {
        const userSkillSet = new Set(user.availableSkills);
        const learnSkillSet = new Set(user.learnSkills);
        
        // Find complementary skills
        const teachSkill = user.availableSkills.find(skill => 
            !currentUserSkillSet.has(skill) && currentUserSkills.includes(skill)
        );
        
        const learnSkill = user.learnSkills.find(skill => 
            currentUserSkillSet.has(skill) && !userSkillSet.has(skill)
        );
        
        if (teachSkill && learnSkill) {
            suggestions.push({
                user,
                teachSkill,
                learnSkill,
                reason: `Perfect match! You can teach ${teachSkill} and learn ${learnSkill}`
            });
        }
    });
    
    return suggestions.slice(0, 4); // Return top 4 suggestions
}

// Filter users
function filterUsers() {
    // Refresh users from data manager
    users = dataManager.getUsers();
    
    const skillFilterValue = skillFilter.value;
    const sortFilterValue = sortFilter.value;
    
    // Reset pagination
    currentPage = 0;
    userCardsContainer.innerHTML = '';
    
    // Apply filters
    filteredUsers = users.filter(user => {
        if (!skillFilterValue) return true;
        return user.skills.some(skill => 
            skill.toLowerCase().includes(skillFilterValue.toLowerCase())
        );
    });
    
    // Apply sorting
    filteredUsers.sort((a, b) => {
        switch (sortFilterValue) {
            case 'rating':
                return b.rating - a.rating;
            case 'skills':
                return b.skills.length - a.skills.length;
            case 'recent':
            default:
                return b.id - a.id;
        }
    });
    
    renderUserCards();
}

// Load more users
function loadMoreUsers() {
    currentPage++;
    renderUserCards();
}

// Update load more button
function updateLoadMoreButton() {
    const hasMoreUsers = (currentPage + 1) * usersPerPage < filteredUsers.length;
    loadMoreBtn.style.display = hasMoreUsers ? 'inline-flex' : 'none';
}

// Open request modal
function openRequestModal(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    // Populate modal
    document.getElementById('modalUserImage').src = user.avatar;
    document.getElementById('modalUserName').textContent = user.name;
    document.getElementById('modalUserSkills').textContent = user.skills.join(', ');
    
    // Populate skill selects
    populateSkillSelect('teachSkill', currentUserSkills);
    populateSkillSelect('learnSkill', user.availableSkills);
    
    // Show modal
    requestModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close request modal
function closeRequestModal() {
    requestModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Reset form
    document.getElementById('requestMessage').value = '';
    document.getElementById('teachSkill').value = '';
    document.getElementById('learnSkill').value = '';
}

// Populate skill select
function populateSkillSelect(selectId, skills) {
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">Select a skill</option>';
    
    skills.forEach(skill => {
        const option = document.createElement('option');
        option.value = skill;
        option.textContent = skill;
        select.appendChild(option);
    });
}

// Handle send request
function handleSendRequest() {
    const message = document.getElementById('requestMessage').value;
    const teachSkill = document.getElementById('teachSkill').value;
    const learnSkill = document.getElementById('learnSkill').value;
    
    if (!teachSkill || !learnSkill) {
        showToast('Please select both skills for the exchange', 'error');
        return;
    }
    
    // Simulate API call
    setTimeout(() => {
        showToast('Skill swap request sent successfully!', 'success');
        closeRequestModal();
    }, 1000);
}

// Rate user
function rateUser(userId, rating) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    // Add feedback to user
    const currentUser = dataManager.getCurrentUser();
    const feedback = {
        user: currentUser.name || 'Anonymous',
        rating: rating,
        text: `Rated ${rating} stars`,
        time: new Date().toLocaleString()
    };
    
    // Update user's ratings in data manager
    const updatedUser = dataManager.updateUser(userId, {
        ...user,
        feedback: [...(user.feedback || []), feedback]
    });
    
    // Update ratings
    const allRatings = updatedUser.feedback.map(f => f.rating);
    const averageRating = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;
    
    dataManager.updateUser(userId, {
        ...updatedUser,
        rating: Math.round(averageRating * 10) / 10
    });
    
    // Refresh users
    users = dataManager.getUsers();
    
    showToast(`Rated ${user.name} ${rating} stars!`, 'success');
    
    // Close rating modal if open
    const ratingModal = document.getElementById('ratingModal');
    if (ratingModal) {
        ratingModal.classList.remove('active');
    }
}

// Open rating modal
function openRatingModal(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    // Create rating modal if it doesn't exist
    let ratingModal = document.getElementById('ratingModal');
    if (!ratingModal) {
        ratingModal = document.createElement('div');
        ratingModal.id = 'ratingModal';
        ratingModal.className = 'modal';
        ratingModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Rate User</h3>
                    <button class="close-btn" onclick="closeRatingModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="user-info">
                        <img id="ratingUserAvatar" src="" alt="" class="user-avatar">
                        <h4 id="ratingUserName"></h4>
                    </div>
                    <div class="rating-stars">
                        <span class="star" onclick="rateUser(currentRatingUserId, 1)">☆</span>
                        <span class="star" onclick="rateUser(currentRatingUserId, 2)">☆</span>
                        <span class="star" onclick="rateUser(currentRatingUserId, 3)">☆</span>
                        <span class="star" onclick="rateUser(currentRatingUserId, 4)">☆</span>
                        <span class="star" onclick="rateUser(currentRatingUserId, 5)">☆</span>
                    </div>
                    <p>Click on a star to rate this user</p>
                </div>
            </div>
        `;
        document.body.appendChild(ratingModal);
    }
    
    // Populate modal
    document.getElementById('ratingUserAvatar').src = user.avatar;
    document.getElementById('ratingUserName').textContent = user.name;
    
    // Store current user ID for rating
    window.currentRatingUserId = userId;
    
    // Show modal
    ratingModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close rating modal
function closeRatingModal() {
    const ratingModal = document.getElementById('ratingModal');
    if (ratingModal) {
        ratingModal.classList.remove('active');
        document.body.style.overflow = 'auto';
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

// View profile (placeholder)
function viewProfile(userId) {
    showToast('Profile view feature coming soon!', 'success');
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
    document.querySelectorAll('.user-card, .suggestion-card').forEach(el => {
        observer.observe(el);
    });
    
    // Navbar scroll effect
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
}

// Smooth scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Add some interactive effects
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to skill tags
    document.addEventListener('mouseover', function(e) {
        if (e.target.classList.contains('skill-tag')) {
            e.target.style.transform = 'scale(1.1) rotate(2deg)';
        }
    });
    
    document.addEventListener('mouseout', function(e) {
        if (e.target.classList.contains('skill-tag')) {
            e.target.style.transform = 'scale(1) rotate(0deg)';
        }
    });
    
    // Add click ripple effect to buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn') || e.target.closest('.btn')) {
            const button = e.target.classList.contains('btn') ? e.target : e.target.closest('.btn');
            createRipple(button, e);
        }
    });
});

// Create ripple effect
function createRipple(button, event) {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style); 