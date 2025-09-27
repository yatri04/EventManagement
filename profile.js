// Profile Page JavaScript

<<<<<<< HEAD
// Get current user from data manager
let currentUser = dataManager.getCurrentUser();

// If no user exists, create a default one
if (!currentUser || !currentUser.name) {
    currentUser = {
        id: 1,
        name: "",
        title: "",
        location: "",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
        bio: "",
        availability: {
            weekdays: [],
            weekends: []
        },
        privacy: {
            profileVisible: true,
            contactVisible: false
        },
        skills: [],
        wantedSkills: [],
        goals: [],
        ratings: {
            average: 0,
            total: 0,
            distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        },
        feedback: [],
        connections: [],
        activities: []
    };
    dataManager.updateCurrentUser(currentUser);
}
=======
// Sample user data
const currentUser = {
    id: 1,
    name: "Alex Johnson",
    title: "Full Stack Developer",
    location: "San Francisco, CA",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    bio: "Passionate full-stack developer with 5+ years of experience creating innovative web applications. Love learning new technologies and sharing knowledge with others. Always excited to collaborate on interesting projects!",
    availability: {
        weekdays: ["evening"],
        weekends: ["all-day"]
    },
    privacy: {
        profileVisible: true,
        contactVisible: false
    },
    skills: [
        { name: "JavaScript", level: "expert", description: "Advanced JavaScript with ES6+, React, and Node.js" },
        { name: "React", level: "advanced", description: "Building modern web applications with React ecosystem" },
        { name: "Node.js", level: "advanced", description: "Server-side development and API creation" },
        { name: "Python", level: "intermediate", description: "Data analysis and backend development" },
        { name: "UI/UX Design", level: "intermediate", description: "Creating user-friendly interfaces" },
        { name: "Git", level: "advanced", description: "Version control and collaboration" }
    ],
    wantedSkills: [
        { name: "Machine Learning", priority: "high", description: "Want to learn ML for data analysis projects" },
        { name: "Flutter", priority: "medium", description: "Interested in mobile app development" },
        { name: "DevOps", priority: "low", description: "Learn cloud deployment and CI/CD" }
    ],
    goals: [
        { skill: "Machine Learning", deadline: "2024-06-15", description: "Learn ML fundamentals and implement basic algorithms", progress: 30 },
        { skill: "Flutter", deadline: "2024-08-20", description: "Build cross-platform mobile applications", progress: 15 },
        { skill: "DevOps", deadline: "2024-09-30", description: "Master CI/CD and cloud deployment", progress: 45 }
    ],
    ratings: {
        average: 4.8,
        total: 30,
        distribution: { 5: 24, 4: 5, 3: 1, 2: 0, 1: 0 }
    },
    feedback: [
        { user: "Sarah Chen", rating: 5, text: "Excellent teacher! Alex explained React concepts very clearly.", time: "2 days ago" },
        { user: "Marcus Rodriguez", rating: 4, text: "Great JavaScript knowledge and patient teaching style.", time: "1 week ago" },
        { user: "Emma Thompson", rating: 5, text: "Amazing UI/UX insights and practical examples.", time: "2 weeks ago" }
    ],
    connections: [
        { id: 2, name: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face", skill: "React" },
        { id: 3, name: "Marcus Rodriguez", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face", skill: "Python" },
        { id: 4, name: "Emma Thompson", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face", skill: "Design" },
        { id: 5, name: "David Kim", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face", skill: "Photography" },
        { id: 6, name: "Lisa Wang", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop&crop=face", skill: "Marketing" },
        { id: 7, name: "Maria Garcia", avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=60&h=60&fit=crop&crop=face", skill: "iOS" }
    ],
    activities: [
        { type: "connection", text: "Connected with Sarah Chen", time: "2 hours ago", icon: "fas fa-user-plus" },
        { type: "skill", text: "Added new skill: Machine Learning", time: "1 day ago", icon: "fas fa-plus-circle" },
        { type: "message", text: "Received skill swap request from Marcus", time: "2 days ago", icon: "fas fa-envelope" },
        { type: "connection", text: "Completed skill swap with Emma", time: "3 days ago", icon: "fas fa-handshake" },
        { type: "skill", text: "Updated proficiency in React", time: "1 week ago", icon: "fas fa-edit" }
    ]
};
>>>>>>> a2a9c29f6671bdb07a287917b65262c464291ecb

// DOM Elements
const profileImage = document.getElementById('profileImage');
const profileName = document.getElementById('profileName');
const profileTitle = document.querySelector('.profile-title');
const profileLocation = document.querySelector('.profile-location');
const aboutText = document.getElementById('aboutText');
const skillsGrid = document.getElementById('skillsGrid');
const goalsList = document.getElementById('goalsList');
const activityList = document.getElementById('activityList');
const connectionsGrid = document.getElementById('connectionsGrid');
const avatarInput = document.getElementById('avatarInput');

// Modal elements
const editProfileModal = document.getElementById('editProfileModal');
const addSkillModal = document.getElementById('addSkillModal');
const addGoalModal = document.getElementById('addGoalModal');
const addWantedSkillModal = document.getElementById('addWantedSkillModal');
const editAvailabilityModal = document.getElementById('editAvailabilityModal');

// Initialize the profile page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Profile page loaded');
    loadProfileData();
    setupEventListeners();
    setupAnimations();
    console.log('Profile page initialization complete');
});

// Load profile data
function loadProfileData() {
    // Refresh current user from data manager
    currentUser = dataManager.getCurrentUser();
    
    // Load user info
    profileName.textContent = currentUser.name || 'Your Name';
    if (profileTitle) profileTitle.textContent = currentUser.title || 'Your Title';
    if (profileLocation) profileLocation.textContent = currentUser.location || 'Your Location';
    aboutText.textContent = currentUser.bio || 'Tell us about yourself...';
    
    // Update avatar
    if (currentUser.avatar) {
        profileImage.src = currentUser.avatar;
    }
    
    // Load skills
    renderSkills();
    
    // Load wanted skills
    renderWantedSkills();
    
    // Load goals
    renderGoals();
    
    // Load activities
    renderActivities();
    
    // Load connections
    renderConnections();
    
    // Load feedback
    renderFeedback();
    
    // Load privacy settings
    loadPrivacySettings();
    
    // Load availability display
    updateAvailabilityDisplay();
}

// Render skills
function renderSkills() {
    // Refresh current user from data manager
    currentUser = dataManager.getCurrentUser();
    
    skillsGrid.innerHTML = '';
    
    currentUser.skills.forEach((skill, index) => {
        const skillElement = createSkillElement(skill, index);
        skillsGrid.appendChild(skillElement);
        
        // Staggered animation
        setTimeout(() => {
            skillElement.style.opacity = '1';
            skillElement.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Create skill element
function createSkillElement(skill, index) {
    const skillDiv = document.createElement('div');
    skillDiv.className = 'skill-item';
    skillDiv.style.opacity = '0';
    skillDiv.style.transform = 'translateY(20px)';
    skillDiv.style.transition = 'all 0.6s ease';
    
    skillDiv.innerHTML = `
        <div class="skill-header">
            <span class="skill-name">${skill.name}</span>
            <span class="skill-level">${skill.level}</span>
        </div>
        <p class="skill-description">${skill.description}</p>
        <div class="skill-actions">
            <button class="skill-action-btn" onclick="editSkill(${index})">
                <i class="fas fa-edit"></i>
            </button>
            <button class="skill-action-btn" onclick="deleteSkill(${index})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    return skillDiv;
}

// Render goals
function renderGoals() {
    // Refresh current user from data manager
    currentUser = dataManager.getCurrentUser();
    
    goalsList.innerHTML = '';
    
    currentUser.goals.forEach((goal, index) => {
        const goalElement = createGoalElement(goal, index);
        goalsList.appendChild(goalElement);
        
        // Staggered animation
        setTimeout(() => {
            goalElement.style.opacity = '1';
            goalElement.style.transform = 'translateX(0)';
        }, index * 150);
    });
}

// Create goal element
function createGoalElement(goal, index) {
    const goalDiv = document.createElement('div');
    goalDiv.className = 'goal-item';
    goalDiv.style.opacity = '0';
    goalDiv.style.transform = 'translateX(-20px)';
    goalDiv.style.transition = 'all 0.6s ease';
    
    const deadline = new Date(goal.deadline);
    const daysLeft = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
    
    goalDiv.innerHTML = `
        <div class="goal-header">
            <span class="goal-skill">${goal.skill}</span>
            <span class="goal-deadline">${daysLeft > 0 ? ${daysLeft} days : 'Overdue'}</span>
        </div>
        <p class="goal-description">${goal.description}</p>
        <div class="goal-progress">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${goal.progress}%"></div>
            </div>
        </div>
    `;
    
    return goalDiv;
}

// Render activities
function renderActivities() {
    // Refresh current user from data manager
    currentUser = dataManager.getCurrentUser();
    
    activityList.innerHTML = '';
    
    currentUser.activities.forEach((activity, index) => {
        const activityElement = createActivityElement(activity, index);
        activityList.appendChild(activityElement);
        
        // Staggered animation
        setTimeout(() => {
            activityElement.style.opacity = '1';
            activityElement.style.transform = 'translateX(0)';
        }, index * 100);
    });
}

// Create activity element
function createActivityElement(activity, index) {
    const activityDiv = document.createElement('div');
    activityDiv.className = 'activity-item';
    activityDiv.style.opacity = '0';
    activityDiv.style.transform = 'translateX(-20px)';
    activityDiv.style.transition = 'all 0.6s ease';
    
    activityDiv.innerHTML = `
        <div class="activity-icon ${activity.type}">
            <i class="${activity.icon}"></i>
        </div>
        <div class="activity-content">
            <div class="activity-text">${activity.text}</div>
            <div class="activity-time">${activity.time}</div>
        </div>
    `;
    
    return activityDiv;
}

// Render connections
function renderConnections() {
    // Refresh current user from data manager
    currentUser = dataManager.getCurrentUser();
    
    connectionsGrid.innerHTML = '';
    
    currentUser.connections.forEach((connection, index) => {
        const connectionElement = createConnectionElement(connection, index);
        connectionsGrid.appendChild(connectionElement);
        
        // Staggered animation
        setTimeout(() => {
            connectionElement.style.opacity = '1';
            connectionElement.style.transform = 'scale(1)';
        }, index * 100);
    });
}

// Create connection element
function createConnectionElement(connection, index) {
    const connectionDiv = document.createElement('div');
    connectionDiv.className = 'connection-item';
    connectionDiv.style.opacity = '0';
    connectionDiv.style.transform = 'scale(0.8)';
    connectionDiv.style.transition = 'all 0.6s ease';
    connectionDiv.onclick = () => viewConnectionProfile(connection.id);
    
    connectionDiv.innerHTML = `
        <img src="${connection.avatar}" alt="${connection.name}" class="connection-avatar">
        <div class="connection-name">${connection.name}</div>
        <div class="connection-skill">${connection.skill}</div>
    `;
    
    return connectionDiv;
}

// Setup event listeners
function setupEventListeners() {
    // Avatar upload
    const avatarEdit = document.querySelector('.avatar-edit');
    if (avatarEdit && avatarInput) {
        avatarEdit.addEventListener('click', () => avatarInput.click());
        avatarInput.addEventListener('change', handleAvatarUpload);
    }
    
    // Edit profile button
    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', openEditProfileModal);
    }
    
    // Edit about button
    const editAboutBtn = document.getElementById('editAboutBtn');
    if (editAboutBtn) {
        editAboutBtn.addEventListener('click', editAbout);
    }
    
    // Add skill button
    const addSkillBtn = document.getElementById('addSkillBtn');
    if (addSkillBtn) {
        addSkillBtn.addEventListener('click', openAddSkillModal);
    }
    
    // Add goal button
    const addGoalBtn = document.getElementById('addGoalBtn');
    if (addGoalBtn) {
        addGoalBtn.addEventListener('click', openAddGoalModal);
    }
    
    // Add wanted skill button
    const addWantedSkillBtn = document.getElementById('addWantedSkillBtn');
    if (addWantedSkillBtn) {
        addWantedSkillBtn.addEventListener('click', openWantedSkillModal);
    }
    
    // Edit availability button
    const editAvailabilityBtn = document.getElementById('editAvailabilityBtn');
    if (editAvailabilityBtn) {
        editAvailabilityBtn.addEventListener('click', openAvailabilityModal);
    }
    
    // Add wanted skill button
    document.getElementById('addWantedSkillBtn').addEventListener('click', openWantedSkillModal);
    
    // Edit availability button
    document.getElementById('editAvailabilityBtn').addEventListener('click', openAvailabilityModal);
    
    // Modal close buttons
<<<<<<< HEAD
    const closeEditModal = document.getElementById('closeEditModal');
    if (closeEditModal) {
        closeEditModal.addEventListener('click', closeEditProfileModal);
    }
    
    const closeSkillModal = document.getElementById('closeSkillModal');
    if (closeSkillModal) {
        closeSkillModal.addEventListener('click', closeAddSkillModal);
    }
    
    const closeGoalModal = document.getElementById('closeGoalModal');
    if (closeGoalModal) {
        closeGoalModal.addEventListener('click', closeAddGoalModal);
    }
    
    const closeWantedSkillModal = document.getElementById('closeWantedSkillModal');
    if (closeWantedSkillModal) {
        closeWantedSkillModal.addEventListener('click', closeWantedSkillModal);
    }
    
    const closeAvailabilityModal = document.getElementById('closeAvailabilityModal');
    if (closeAvailabilityModal) {
        closeAvailabilityModal.addEventListener('click', closeAvailabilityModal);
    }
    
    // Cancel buttons
    const cancelEdit = document.getElementById('cancelEdit');
    if (cancelEdit) {
        cancelEdit.addEventListener('click', closeEditProfileModal);
    }
    
    const cancelSkill = document.getElementById('cancelSkill');
    if (cancelSkill) {
        cancelSkill.addEventListener('click', closeAddSkillModal);
    }
    
    const cancelGoal = document.getElementById('cancelGoal');
    if (cancelGoal) {
        cancelGoal.addEventListener('click', closeAddGoalModal);
    }
    
    const cancelWantedSkill = document.getElementById('cancelWantedSkill');
    if (cancelWantedSkill) {
        cancelWantedSkill.addEventListener('click', closeWantedSkillModal);
    }
    
    const cancelAvailability = document.getElementById('cancelAvailability');
    if (cancelAvailability) {
        cancelAvailability.addEventListener('click', closeAvailabilityModal);
    }
    
    // Save buttons
    const saveProfileBtn = document.getElementById('saveProfile');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', saveProfile);
    }
    
    const saveSkillBtn = document.getElementById('saveSkill');
    if (saveSkillBtn) {
        saveSkillBtn.addEventListener('click', saveSkill);
    }
    
    const saveGoalBtn = document.getElementById('saveGoal');
    if (saveGoalBtn) {
        saveGoalBtn.addEventListener('click', saveGoal);
    }
    
    const saveWantedSkillBtn = document.getElementById('saveWantedSkill');
    if (saveWantedSkillBtn) {
        saveWantedSkillBtn.addEventListener('click', addWantedSkill);
    }
    
    const saveAvailabilityBtn = document.getElementById('saveAvailability');
    if (saveAvailabilityBtn) {
        saveAvailabilityBtn.addEventListener('click', saveAvailability);
    }
=======
    document.getElementById('closeEditModal').addEventListener('click', closeEditProfileModal);
    document.getElementById('closeSkillModal').addEventListener('click', closeAddSkillModal);
    document.getElementById('closeGoalModal').addEventListener('click', closeAddGoalModal);
    document.getElementById('closeWantedSkillModal').addEventListener('click', closeWantedSkillModal);
    document.getElementById('closeAvailabilityModal').addEventListener('click', closeAvailabilityModal);
    
    // Cancel buttons
    document.getElementById('cancelEdit').addEventListener('click', closeEditProfileModal);
    document.getElementById('cancelSkill').addEventListener('click', closeAddSkillModal);
    document.getElementById('cancelGoal').addEventListener('click', closeAddGoalModal);
    document.getElementById('cancelWantedSkill').addEventListener('click', closeWantedSkillModal);
    document.getElementById('cancelAvailability').addEventListener('click', closeAvailabilityModal);
    
    // Save buttons
    document.getElementById('saveProfile').addEventListener('click', saveProfile);
    document.getElementById('saveSkill').addEventListener('click', saveSkill);
    document.getElementById('saveGoal').addEventListener('click', saveGoal);
    document.getElementById('saveWantedSkill').addEventListener('click', addWantedSkill);
    document.getElementById('saveAvailability').addEventListener('click', saveAvailability);
>>>>>>> a2a9c29f6671bdb07a287917b65262c464291ecb
    
    // Close modals on outside click
    [editProfileModal, addSkillModal, addGoalModal, addWantedSkillModal, editAvailabilityModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }
            });
        }
    });
}

// Handle avatar upload
function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const avatarUrl = e.target.result;
            profileImage.src = avatarUrl;
            
            // Update in data manager
            dataManager.updateCurrentUser({
                ...currentUser,
                avatar: avatarUrl
            });
            
            // Update current user
            currentUser = dataManager.getCurrentUser();
            
            // Add activity
            dataManager.addActivity({
                type: "profile",
                text: "Updated profile picture",
                icon: "fas fa-camera"
            });
            
            showToast('Profile picture updated successfully!', 'success');
        };
        reader.readAsDataURL(file);
    }
}

// Open edit profile modal
function openEditProfileModal() {
    console.log('Opening edit profile modal');
    document.getElementById('editName').value = currentUser.name;
    document.getElementById('editTitle').value = currentUser.title;
    document.getElementById('editLocation').value = currentUser.location;
    document.getElementById('editBio').value = currentUser.bio;
    editProfileModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close edit profile modal
function closeEditProfileModal() {
    editProfileModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Save profile
function saveProfile() {
    const name = document.getElementById('editName').value;
    const title = document.getElementById('editTitle').value;
    const location = document.getElementById('editLocation').value;
    const bio = document.getElementById('editBio').value;
    
    if (!name || !title || !location || !bio) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    // Update user data
    currentUser.name = name;
    currentUser.title = title;
    currentUser.location = location;
    currentUser.bio = bio;
    
    // Save to data manager
    dataManager.updateCurrentUser(currentUser);
    
    // Update UI
    profileName.textContent = name;
    if (profileTitle) profileTitle.textContent = title;
    if (profileLocation) profileLocation.textContent = location;
    aboutText.textContent = bio;
    
    // Add activity
    dataManager.addActivity({
        type: "profile",
        text: "Updated profile information",
        icon: "fas fa-edit"
    });
    
    closeEditProfileModal();
    showToast('Profile updated successfully!', 'success');
}

// Edit about section
function editAbout() {
    const newBio = prompt('Update your bio:', currentUser.bio);
    if (newBio && newBio.trim()) {
        // Update in data manager
        dataManager.updateCurrentUser({
            ...currentUser,
            bio: newBio.trim()
        });
        
        // Update current user
        currentUser = dataManager.getCurrentUser();
        
        // Update UI
        aboutText.textContent = newBio.trim();
        
        // Add activity
        dataManager.addActivity({
            type: "profile",
            text: "Updated bio",
            icon: "fas fa-edit"
        });
        
        showToast('Bio updated successfully!', 'success');
    }
}

// Open add skill modal
function openAddSkillModal() {
    console.log('Opening add skill modal');
    document.getElementById('skillName').value = '';
    document.getElementById('skillLevel').value = '';
    document.getElementById('skillDescription').value = '';
    addSkillModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close add skill modal
function closeAddSkillModal() {
    addSkillModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Save skill
function saveSkill() {
    const name = document.getElementById('skillName').value;
    const level = document.getElementById('skillLevel').value;
    const description = document.getElementById('skillDescription').value;
    
    if (!name || !level) {
        showToast('Please fill in skill name and level', 'error');
        return;
    }
    
    const newSkill = {
        name: name.trim(),
        level: level,
        description: description.trim() || ${name} skill
    };
    
    // Add to data manager
    dataManager.addSkill(newSkill);
    
    // Update current user
    currentUser = dataManager.getCurrentUser();
    
    // Add activity
    dataManager.addActivity({
        type: "skill",
        text: `Added new skill: ${name}`,
        icon: "fas fa-plus-circle"
    });
    
    renderSkills();
    closeAddSkillModal();
    showToast('Skill added successfully!', 'success');
    
    // Clear form
    document.getElementById('skillName').value = '';
    document.getElementById('skillLevel').value = '';
    document.getElementById('skillDescription').value = '';
}

// Edit skill
function editSkill(index) {
    const skill = currentUser.skills[index];
    const newName = prompt('Skill name:', skill.name);
    const newLevel = prompt('Level (beginner/intermediate/advanced/expert):', skill.level);
    const newDescription = prompt('Description:', skill.description);
    
    if (newName && newLevel) {
        const updatedSkill = {
            name: newName.trim(),
            level: newLevel.toLowerCase(),
            description: newDescription.trim() || ${newName} skill
        };
        
        // Update in data manager
        dataManager.updateSkill(skill.id, updatedSkill);
        
        // Update current user
        currentUser = dataManager.getCurrentUser();
        
        // Add activity
        dataManager.addActivity({
            type: "skill",
            text: `Updated skill: ${newName}`,
            icon: "fas fa-edit"
        });
        
        renderSkills();
        showToast('Skill updated successfully!', 'success');
    }
}

// Delete skill
function deleteSkill(index) {
    if (confirm('Are you sure you want to delete this skill?')) {
        const skill = currentUser.skills[index];
        const skillName = skill.name;
        
        // Delete from data manager
        dataManager.deleteSkill(skill.id);
        
        // Update current user
        currentUser = dataManager.getCurrentUser();
        
        // Add activity
        dataManager.addActivity({
            type: "skill",
            text: `Deleted skill: ${skillName}`,
            icon: "fas fa-trash"
        });
        
        renderSkills();
        showToast('Skill deleted successfully!', 'success');
    }
}

// Open add goal modal
function openAddGoalModal() {
    document.getElementById('goalSkill').value = '';
    document.getElementById('goalDeadline').value = '';
    document.getElementById('goalDescription').value = '';
    addGoalModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close add goal modal
function closeAddGoalModal() {
    addGoalModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Save goal
function saveGoal() {
    const skill = document.getElementById('goalSkill').value;
    const deadline = document.getElementById('goalDeadline').value;
    const description = document.getElementById('goalDescription').value;
    
    if (!skill || !deadline) {
        showToast('Please fill in skill and deadline', 'error');
        return;
    }
    
    const newGoal = {
        skill: skill.trim(),
        deadline: deadline,
        description: description.trim() || Learn ${skill},
        progress: 0
    };
    
    // Add to data manager
    dataManager.addGoal(newGoal);
    
    // Update current user
    currentUser = dataManager.getCurrentUser();
    
    // Add activity
    dataManager.addActivity({
        type: "goal",
        text: `Added new goal: ${skill}`,
        icon: "fas fa-target"
    });
    
    renderGoals();
    closeAddGoalModal();
    showToast('Learning goal added successfully!', 'success');
    
    // Clear form
    document.getElementById('goalSkill').value = '';
    document.getElementById('goalDeadline').value = '';
    document.getElementById('goalDescription').value = '';
}

// View connection profile
function viewConnectionProfile(connectionId) {
    showToast(Viewing ${currentUser.connections.find(c => c.id === connectionId)?.name}'s profile, 'success');
    // In a real app, this would navigate to the connection's profile page
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
    document.querySelectorAll('.profile-card').forEach(el => {
        observer.observe(el);
    });
}

// Show toast notification
function showToast(message, type = 'success') {
    const toastElement = document.getElementById('toast');
    const toastMessage = document.querySelector('.toast-message');
    const toastIcon = document.querySelector('.toast-icon');
    
    toastMessage.textContent = message;
    toastElement.className = toast ${type};
    
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

// Add some interactive effects
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to skill items
    document.addEventListener('mouseover', function(e) {
        if (e.target.closest('.skill-item')) {
            e.target.closest('.skill-item').style.transform = 'translateY(-5px) scale(1.02)';
        }
    });
    
    document.addEventListener('mouseout', function(e) {
        if (e.target.closest('.skill-item')) {
            e.target.closest('.skill-item').style.transform = 'translateY(0) scale(1)';
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

// Render wanted skills
function renderWantedSkills() {
<<<<<<< HEAD
    // Refresh current user from data manager
    currentUser = dataManager.getCurrentUser();
    
=======
>>>>>>> a2a9c29f6671bdb07a287917b65262c464291ecb
    const wantedSkillsGrid = document.getElementById('wantedSkillsGrid');
    if (!wantedSkillsGrid) return;
    
    wantedSkillsGrid.innerHTML = '';
    
    currentUser.wantedSkills.forEach((skill, index) => {
        const skillElement = createWantedSkillElement(skill, index);
        wantedSkillsGrid.appendChild(skillElement);
        
        // Staggered animation
        setTimeout(() => {
            skillElement.style.opacity = '1';
            skillElement.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Create wanted skill element
function createWantedSkillElement(skill, index) {
    const skillDiv = document.createElement('div');
    skillDiv.className = 'wanted-skill-item';
    skillDiv.style.opacity = '0';
    skillDiv.style.transform = 'translateY(20px)';
    skillDiv.style.transition = 'all 0.6s ease';
    
    skillDiv.innerHTML = `
        <div class="wanted-skill-header">
            <span class="wanted-skill-name">${skill.name}</span>
            <span class="wanted-skill-priority ${skill.priority}">${skill.priority}</span>
        </div>
        <p class="wanted-skill-description">${skill.description}</p>
        <div class="skill-actions">
            <button class="skill-action-btn" onclick="editWantedSkill(${index})">
                <i class="fas fa-edit"></i>
            </button>
            <button class="skill-action-btn" onclick="deleteWantedSkill(${index})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    return skillDiv;
}

// Render feedback
function renderFeedback() {
<<<<<<< HEAD
    // Refresh current user from data manager
    currentUser = dataManager.getCurrentUser();
    
=======
>>>>>>> a2a9c29f6671bdb07a287917b65262c464291ecb
    const recentFeedback = document.getElementById('recentFeedback');
    if (!recentFeedback) return;
    
    recentFeedback.innerHTML = '';
    
    currentUser.feedback.forEach((feedback, index) => {
        const feedbackElement = createFeedbackElement(feedback, index);
        recentFeedback.appendChild(feedbackElement);
        
        // Staggered animation
        setTimeout(() => {
            feedbackElement.style.opacity = '1';
            feedbackElement.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Create feedback element
function createFeedbackElement(feedback, index) {
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = 'feedback-item';
    feedbackDiv.style.opacity = '0';
    feedbackDiv.style.transform = 'translateY(20px)';
    feedbackDiv.style.transition = 'all 0.6s ease';
    
    const stars = '⭐'.repeat(feedback.rating);
    
    feedbackDiv.innerHTML = `
        <div class="feedback-header">
            <span class="feedback-user">${feedback.user}</span>
            <span class="feedback-rating">${stars}</span>
        </div>
        <div class="feedback-text">${feedback.text}</div>
        <div class="feedback-time">${feedback.time}</div>
    `;
    
    return feedbackDiv;
}

// Load privacy settings
function loadPrivacySettings() {
    const profileVisibility = document.getElementById('profileVisibility');
    const contactVisibility = document.getElementById('contactVisibility');
    
    if (profileVisibility) {
        profileVisibility.checked = currentUser.privacy.profileVisible;
    }
    
    if (contactVisibility) {
        contactVisibility.checked = currentUser.privacy.contactVisible;
    }
}

// Edit wanted skill
function editWantedSkill(index) {
    const skill = currentUser.wantedSkills[index];
    const newName = prompt('Skill name:', skill.name);
    const newPriority = prompt('Priority (high/medium/low):', skill.priority);
    const newDescription = prompt('Description:', skill.description);
    
    if (newName && newPriority) {
<<<<<<< HEAD
        const updatedSkill = {
            name: newName.trim(),
            priority: newPriority.toLowerCase(),
            description: newDescription.trim() || `${newName} skill`
        };
        
        // Update in data manager
        dataManager.updateWantedSkill(skill.id, updatedSkill);
        
        // Update current user
        currentUser = dataManager.getCurrentUser();
        
        // Add activity
        dataManager.addActivity({
            type: "skill",
            text: `Updated wanted skill: ${newName}`,
            icon: "fas fa-edit"
        });
        
=======
        currentUser.wantedSkills[index] = {
            name: newName.trim(),
            priority: newPriority.toLowerCase(),
            description: newDescription.trim() || ${newName} skill
        };
>>>>>>> a2a9c29f6671bdb07a287917b65262c464291ecb
        renderWantedSkills();
        showToast('Wanted skill updated successfully!', 'success');
    }
}

// Delete wanted skill
function deleteWantedSkill(index) {
    if (confirm('Are you sure you want to delete this wanted skill?')) {
<<<<<<< HEAD
        const skill = currentUser.wantedSkills[index];
        const skillName = skill.name;
        
        // Delete from data manager
        dataManager.deleteWantedSkill(skill.id);
        
        // Update current user
        currentUser = dataManager.getCurrentUser();
        
        // Add activity
        dataManager.addActivity({
            type: "skill",
            text: `Deleted wanted skill: ${skillName}`,
            icon: "fas fa-trash"
        });
        
=======
        currentUser.wantedSkills.splice(index, 1);
>>>>>>> a2a9c29f6671bdb07a287917b65262c464291ecb
        renderWantedSkills();
        showToast('Wanted skill deleted successfully!', 'success');
    }
}

// Add wanted skill
function addWantedSkill() {
    const name = document.getElementById('wantedSkillName').value;
    const priority = document.getElementById('wantedSkillPriority').value;
    const description = document.getElementById('wantedSkillDescription').value;
    
    if (!name || !priority) {
        showToast('Please fill in skill name and priority', 'error');
        return;
    }
    
    const newSkill = {
        name: name.trim(),
        priority: priority,
<<<<<<< HEAD
        description: description.trim() || `Want to learn ${name}`
    };
    
    // Add to data manager
    dataManager.addWantedSkill(newSkill);
    
    // Update current user
    currentUser = dataManager.getCurrentUser();
    
    // Add activity
    dataManager.addActivity({
        type: "skill",
        text: `Added wanted skill: ${name}`,
        icon: "fas fa-heart"
    });
    
    renderWantedSkills();
    closeWantedSkillModal();
    showToast('Wanted skill added successfully!', 'success');
    
    // Clear form
    document.getElementById('wantedSkillName').value = '';
    document.getElementById('wantedSkillPriority').value = '';
    document.getElementById('wantedSkillDescription').value = '';
=======
        description: description.trim() || Want to learn ${name}
    };
    
    currentUser.wantedSkills.push(newSkill);
    renderWantedSkills();
    
    closeWantedSkillModal();
    showToast('Wanted skill added successfully!', 'success');
>>>>>>> a2a9c29f6671bdb07a287917b65262c464291ecb
}

// Open wanted skill modal
function openWantedSkillModal() {
    document.getElementById('addWantedSkillModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close wanted skill modal
function closeWantedSkillModal() {
    document.getElementById('addWantedSkillModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Open availability modal
function openAvailabilityModal() {
    document.getElementById('editAvailabilityModal').classList.add('active');
    document.body.style.overflow = 'hidden';
    loadAvailabilitySettings();
}

// Close availability modal
function closeAvailabilityModal() {
    document.getElementById('editAvailabilityModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Load availability settings
function loadAvailabilitySettings() {
    const availability = currentUser.availability;
    
    document.getElementById('weekdayMorning').checked = availability.weekdays.includes('morning');
    document.getElementById('weekdayAfternoon').checked = availability.weekdays.includes('afternoon');
    document.getElementById('weekdayEvening').checked = availability.weekdays.includes('evening');
    document.getElementById('weekendMorning').checked = availability.weekends.includes('morning');
    document.getElementById('weekendAfternoon').checked = availability.weekends.includes('afternoon');
    document.getElementById('weekendEvening').checked = availability.weekends.includes('evening');
    document.getElementById('weekendAllDay').checked = availability.weekends.includes('all-day');
}

// Save availability
function saveAvailability() {
    const weekdays = [];
    const weekends = [];
    
    if (document.getElementById('weekdayMorning').checked) weekdays.push('morning');
    if (document.getElementById('weekdayAfternoon').checked) weekdays.push('afternoon');
    if (document.getElementById('weekdayEvening').checked) weekdays.push('evening');
    if (document.getElementById('weekendMorning').checked) weekends.push('morning');
    if (document.getElementById('weekendAfternoon').checked) weekends.push('afternoon');
    if (document.getElementById('weekendEvening').checked) weekends.push('evening');
    if (document.getElementById('weekendAllDay').checked) weekends.push('all-day');
    
<<<<<<< HEAD
    // Update in data manager
    dataManager.updateCurrentUser({
        ...currentUser,
        availability: { weekdays, weekends }
    });
    
    // Update current user
    currentUser = dataManager.getCurrentUser();
    
    // Add activity
    dataManager.addActivity({
        type: "availability",
        text: "Updated availability settings",
        icon: "fas fa-clock"
    });
    
    updateAvailabilityDisplay();
=======
    currentUser.availability = { weekdays, weekends };
    updateAvailabilityDisplay();
    
>>>>>>> a2a9c29f6671bdb07a287917b65262c464291ecb
    closeAvailabilityModal();
    showToast('Availability updated successfully!', 'success');
}

// Update availability display
function updateAvailabilityDisplay() {
    const availabilityGrid = document.getElementById('availabilityGrid');
    if (!availabilityGrid) return;
    
    availabilityGrid.innerHTML = '';
    
    const availability = currentUser.availability;
    
    if (availability.weekdays.length > 0) {
        const weekdayDiv = document.createElement('div');
        weekdayDiv.className = 'availability-item';
        weekdayDiv.innerHTML = `
            <span class="day">Weekdays</span>
            <span class="time">${availability.weekdays.join(', ')}</span>
        `;
        availabilityGrid.appendChild(weekdayDiv);
    }
    
    if (availability.weekends.length > 0) {
        const weekendDiv = document.createElement('div');
        weekendDiv.className = 'availability-item';
        weekendDiv.innerHTML = `
            <span class="day">Weekends</span>
            <span class="time">${availability.weekends.join(', ')}</span>
        `;
        availabilityGrid.appendChild(weekendDiv);
    }
<<<<<<< HEAD
} 
=======
}
>>>>>>> a2a9c29f6671bdb07a287917b65262c464291ecb
