// Messages Page JavaScript

// Get conversations from data manager
let conversations = dataManager.getConversations();

// If no conversations exist, create some sample ones
if (conversations.length === 0) {
    const sampleConversations = [
        {
            user: {
                id: 2,
                name: "Sarah Chen",
                avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face",
                status: "online"
            },
            messages: [
                { sender: 2, text: "Hi Alex! I saw your profile and I'm really interested in learning React.", timestamp: "2024-01-15T10:30:00", type: "text" },
                { sender: 1, text: "Hey Sarah! That's great! I'd be happy to help you learn React.", timestamp: "2024-01-15T10:35:00", type: "text" },
                { sender: 2, text: "Perfect! I can teach you UI/UX design in return. What do you think?", timestamp: "2024-01-15T10:40:00", type: "text" },
                { sender: 1, text: "That sounds like a great swap! When would you like to start?", timestamp: "2024-01-15T10:45:00", type: "text" },
                { sender: 2, text: "Hey! I'd love to learn React from you. Are you available this weekend?", timestamp: "2024-01-15T12:30:00", type: "text" }
            ]
        },
        {
            user: {
                id: 3,
                name: "Marcus Rodriguez",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
                status: "offline"
            },
            messages: [
                { sender: 3, text: "Hi Alex! I'm learning Python and could use some guidance.", timestamp: "2024-01-14T09:00:00", type: "text" },
                { sender: 1, text: "Sure! I'd be happy to help. What specific areas are you struggling with?", timestamp: "2024-01-14T09:05:00", type: "text" },
                { sender: 3, text: "Thanks for the Python tips! They were really helpful.", timestamp: "2024-01-14T15:30:00", type: "text" }
            ]
        }
    ];
    
    sampleConversations.forEach(conv => {
        dataManager.addConversation(conv);
    });
    
    conversations = dataManager.getConversations();
}

// Get available users from data manager
let availableUsers = dataManager.getUsers();

// Filter out current user and users already in conversations
function getAvailableUsers() {
    const currentUserId = dataManager.getCurrentUser().id;
    const existingConversationUserIds = conversations.map(c => c.user.id);
    
    return availableUsers.filter(user => 
        user.id !== currentUserId && 
        !existingConversationUserIds.includes(user.id)
    );
}

// Current state
let currentConversation = null;
let currentUser = dataManager.getCurrentUser();

// DOM Elements
const conversationsList = document.getElementById('conversationsList');
const welcomeScreen = document.getElementById('welcomeScreen');
const activeChat = document.getElementById('activeChat');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const searchInput = document.getElementById('searchInput');
const userSearchInput = document.getElementById('userSearchInput');
const usersList = document.getElementById('usersList');

// Initialize the messages page
document.addEventListener('DOMContentLoaded', function() {
    loadConversations();
    setupEventListeners();
    setupAnimations();
});

// Load conversations
function loadConversations() {
    // Refresh conversations from data manager
    conversations = dataManager.getConversations();
    
    conversationsList.innerHTML = '';
    
    conversations.forEach((conversation, index) => {
        const conversationElement = createConversationElement(conversation, index);
        conversationsList.appendChild(conversationElement);
        
        // Staggered animation
        setTimeout(() => {
            conversationElement.style.opacity = '1';
            conversationElement.style.transform = 'translateX(0)';
        }, index * 100);
    });
}

// Create conversation element
function createConversationElement(conversation, index) {
    const conversationDiv = document.createElement('div');
    conversationDiv.className = `conversation-item ${conversation.unreadCount > 0 ? 'unread' : ''}`;
    conversationDiv.style.opacity = '0';
    conversationDiv.style.transform = 'translateX(-20px)';
    conversationDiv.style.transition = 'all 0.6s ease';
    conversationDiv.onclick = () => openConversation(conversation);
    
    conversationDiv.innerHTML = `
        <img src="${conversation.user.avatar}" alt="${conversation.user.name}" class="conversation-avatar">
        <div class="conversation-content">
            <div class="conversation-header">
                <span class="conversation-name">${conversation.user.name}</span>
                <span class="conversation-time">${conversation.timestamp}</span>
            </div>
            <div class="conversation-preview">${conversation.lastMessage}</div>
        </div>
        <div class="conversation-status">
            ${conversation.unreadCount > 0 ? `<div class="unread-badge">${conversation.unreadCount}</div>` : ''}
            ${conversation.user.status === 'online' ? '<div class="online-indicator"></div>' : ''}
        </div>
    `;
    
    return conversationDiv;
}

// Open conversation
function openConversation(conversation) {
    currentConversation = conversation;
    
    // Update UI
    document.getElementById('chatUserAvatar').src = conversation.user.avatar;
    document.getElementById('chatUserName').textContent = conversation.user.name;
    document.getElementById('chatUserStatus').textContent = conversation.user.status === 'online' ? 'Online' : 'Offline';
    
    // Show chat area
    welcomeScreen.style.display = 'none';
    activeChat.style.display = 'flex';
    
    // Load messages
    loadMessages(conversation.messages);
    
    // Mark as read
    conversation.unreadCount = 0;
    updateConversationList();
    
    // Focus on input
    setTimeout(() => {
        messageInput.focus();
    }, 100);
}

// Load messages
function loadMessages(messages) {
    chatMessages.innerHTML = '';
    
    messages.forEach((message, index) => {
        const messageElement = createMessageElement(message, index);
        chatMessages.appendChild(messageElement);
        
        // Staggered animation
        setTimeout(() => {
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateY(0)';
        }, index * 50);
    });
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Create message element
function createMessageElement(message, index) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.sender === currentUser.id ? 'sent' : 'received'}`;
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(20px)';
    messageDiv.style.transition = 'all 0.6s ease';
    
    const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <img src="${message.sender === currentUser.id ? currentUser.avatar : currentConversation.user.avatar}" 
             alt="Avatar" class="message-avatar">
        <div class="message-content">
            <div class="message-text">${message.text}</div>
            <div class="message-time">${time}</div>
        </div>
    `;
    
    return messageDiv;
}

// Send message
function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || !currentConversation) return;
    
    const newMessage = {
        sender: currentUser.id,
        text: text,
        type: 'text'
    };
    
    // Add to data manager
    dataManager.addMessage(currentConversation.id, newMessage);
    
    // Update current conversation
    currentConversation = dataManager.getConversations().find(c => c.id === currentConversation.id);
    
    // Add to UI
    const messageElement = createMessageElement(newMessage, currentConversation.messages.length - 1);
    chatMessages.appendChild(messageElement);
    
    // Animate in
    setTimeout(() => {
        messageElement.style.opacity = '1';
        messageElement.style.transform = 'translateY(0)';
    }, 50);
    
    // Clear input and scroll
    messageInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Update conversation list
    updateConversationList();
    
    // Simulate reply (for demo)
    setTimeout(() => {
        simulateReply();
    }, 2000);
}

// Simulate reply
function simulateReply() {
    if (!currentConversation) return;
    
    const replies = [
        "That sounds great!",
        "I'll get back to you soon.",
        "Thanks for the message!",
        "Looking forward to our skill swap!",
        "Perfect timing!",
        "I'm excited to learn from you!"
    ];
    
    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    
    const replyMessage = {
        id: Date.now(),
        sender: currentConversation.user.id,
        text: randomReply,
        timestamp: new Date().toISOString(),
        type: 'text'
    };
    
    // Add to conversation
    currentConversation.messages.push(replyMessage);
    currentConversation.lastMessage = randomReply;
    currentConversation.timestamp = 'Just now';
    
    // Add to UI
    const messageElement = createMessageElement(replyMessage, currentConversation.messages.length - 1);
    chatMessages.appendChild(messageElement);
    
    // Animate in
    setTimeout(() => {
        messageElement.style.opacity = '1';
        messageElement.style.transform = 'translateY(0)';
    }, 50);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Update conversation list
    updateConversationList();
}

// Update conversation list
function updateConversationList() {
    const conversationElements = conversationsList.querySelectorAll('.conversation-item');
    conversations.forEach((conversation, index) => {
        const element = conversationElements[index];
        if (element) {
            element.className = `conversation-item ${conversation.unreadCount > 0 ? 'unread' : ''}`;
            element.querySelector('.conversation-preview').textContent = conversation.lastMessage;
            element.querySelector('.conversation-time').textContent = conversation.timestamp;
            
            const unreadBadge = element.querySelector('.unread-badge');
            if (conversation.unreadCount > 0) {
                if (unreadBadge) {
                    unreadBadge.textContent = conversation.unreadCount;
                } else {
                    const statusDiv = element.querySelector('.conversation-status');
                    statusDiv.innerHTML = `<div class="unread-badge">${conversation.unreadCount}</div>`;
                }
            } else if (unreadBadge) {
                unreadBadge.remove();
            }
        }
    });
}

// Search conversations
function searchConversations(query) {
    const filteredConversations = conversations.filter(conversation =>
        conversation.user.name.toLowerCase().includes(query.toLowerCase()) ||
        conversation.lastMessage.toLowerCase().includes(query.toLowerCase())
    );
    
    conversationsList.innerHTML = '';
    filteredConversations.forEach((conversation, index) => {
        const conversationElement = createConversationElement(conversation, index);
        conversationsList.appendChild(conversationElement);
        
        setTimeout(() => {
            conversationElement.style.opacity = '1';
            conversationElement.style.transform = 'translateX(0)';
        }, index * 100);
    });
}

// Show new chat modal
function showNewChatModal() {
    document.getElementById('newChatModal').classList.add('active');
    document.body.style.overflow = 'hidden';
    loadAvailableUsers();
}

// Close new chat modal
function closeNewChatModal() {
    document.getElementById('newChatModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Load available users
function loadAvailableUsers() {
    usersList.innerHTML = '';
    
    // Refresh available users
    availableUsers = dataManager.getUsers();
    const filteredUsers = getAvailableUsers();
    
    filteredUsers.forEach(user => {
        const userElement = createUserElement(user);
        usersList.appendChild(userElement);
    });
}

// Create user element
function createUserElement(user) {
    const userDiv = document.createElement('div');
    userDiv.className = 'user-item';
    userDiv.onclick = () => startNewConversation(user);
    
    userDiv.innerHTML = `
        <img src="${user.avatar}" alt="${user.name}" class="user-avatar">
        <div class="user-info">
            <h4>${user.name}</h4>
            <p>${user.skills.join(', ')}</p>
        </div>
        <div class="user-status ${user.status}"></div>
    `;
    
    return userDiv;
}

// Start new conversation
function startNewConversation(user) {
    const newConversation = {
        user: user,
        messages: []
    };
    
    // Add to data manager
    const addedConversation = dataManager.addConversation(newConversation);
    
    // Update conversations list
    conversations = dataManager.getConversations();
    
    loadConversations();
    openConversation(addedConversation);
    closeNewChatModal();
    
    showToast(`Started conversation with ${user.name}`, 'success');
}

// Toggle attachments
function toggleAttachments() {
    const panel = document.getElementById('attachmentsPanel');
    panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
}

// Toggle emoji picker
function toggleEmojiPicker() {
    showToast('Emoji picker coming soon!', 'success');
}

// Toggle user profile
function toggleUserProfile() {
    const sidebar = document.getElementById('userProfileSidebar');
    sidebar.classList.toggle('active');
    
    if (sidebar.classList.contains('active')) {
        loadUserProfile();
    }
}

// Close user profile
function closeUserProfile() {
    document.getElementById('userProfileSidebar').classList.remove('active');
}

// Load user profile
function loadUserProfile() {
    if (!currentConversation) return;
    
    const content = document.getElementById('profileSidebarContent');
    content.innerHTML = `
        <div class="profile-info">
            <img src="${currentConversation.user.avatar}" alt="${currentConversation.user.name}" class="profile-avatar">
            <h3>${currentConversation.user.name}</h3>
            <p class="profile-status">${currentConversation.user.status}</p>
        </div>
        <div class="profile-skills">
            <h4>Skills</h4>
            <div class="skills-list">
                <span class="skill-tag">JavaScript</span>
                <span class="skill-tag">React</span>
                <span class="skill-tag">UI/UX Design</span>
            </div>
        </div>
        <div class="profile-actions">
            <button class="profile-action-btn" onclick="viewFullProfile()">
                <i class="fas fa-user"></i>
                View Full Profile
            </button>
            <button class="profile-action-btn" onclick="blockUser()">
                <i class="fas fa-ban"></i>
                Block User
            </button>
        </div>
    `;
}

// Toggle skill swap
function toggleSkillSwap() {
    document.getElementById('skillSwapModal').classList.add('active');
    document.body.style.overflow = 'hidden';
    populateSkillSelects();
}

// Close skill swap modal
function closeSkillSwapModal() {
    document.getElementById('skillSwapModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Populate skill selects
function populateSkillSelects() {
    const teachSelect = document.getElementById('teachSkillSelect');
    const learnSelect = document.getElementById('learnSkillSelect');
    
    const mySkills = ['JavaScript', 'React', 'Node.js', 'UI/UX Design'];
    const theirSkills = ['Python', 'Data Science', 'Machine Learning', 'Photography'];
    
    teachSelect.innerHTML = '<option value="">Select a skill</option>';
    learnSelect.innerHTML = '<option value="">Select a skill</option>';
    
    mySkills.forEach(skill => {
        const option = document.createElement('option');
        option.value = skill;
        option.textContent = skill;
        teachSelect.appendChild(option);
    });
    
    theirSkills.forEach(skill => {
        const option = document.createElement('option');
        option.value = skill;
        option.textContent = skill;
        learnSelect.appendChild(option);
    });
}

// Send skill swap proposal
function sendSkillSwapProposal() {
    const teachSkill = document.getElementById('teachSkillSelect').value;
    const learnSkill = document.getElementById('learnSkillSelect').value;
    const message = document.getElementById('swapMessage').value;
    
    if (!teachSkill || !learnSkill) {
        showToast('Please select both skills', 'error');
        return;
    }
    
    // Add proposal message to chat
    const proposalMessage = {
        id: Date.now(),
        sender: currentUser.id,
        text: `Skill Swap Proposal: I'll teach you ${teachSkill} in exchange for ${learnSkill}. ${message}`,
        timestamp: new Date().toISOString(),
        type: 'proposal'
    };
    
    currentConversation.messages.push(proposalMessage);
    currentConversation.lastMessage = `Skill Swap Proposal: ${teachSkill} ↔ ${learnSkill}`;
    currentConversation.timestamp = 'Just now';
    
    // Add to UI
    const messageElement = createMessageElement(proposalMessage, currentConversation.messages.length - 1);
    chatMessages.appendChild(messageElement);
    
    setTimeout(() => {
        messageElement.style.opacity = '1';
        messageElement.style.transform = 'translateY(0)';
    }, 50);
    
    closeSkillSwapModal();
    updateConversationList();
    showToast('Skill swap proposal sent!', 'success');
}

// Setup event listeners
function setupEventListeners() {
    // Search
    searchInput.addEventListener('input', (e) => {
        searchConversations(e.target.value);
    });
    
    // Message input
    messageInput.addEventListener('input', () => {
        sendBtn.disabled = !messageInput.value.trim();
    });
    
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // User search
    userSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const userElements = usersList.querySelectorAll('.user-item');
        
        userElements.forEach(element => {
            const userName = element.querySelector('h4').textContent.toLowerCase();
            const userSkills = element.querySelector('p').textContent.toLowerCase();
            
            if (userName.includes(query) || userSkills.includes(query)) {
                element.style.display = 'flex';
            } else {
                element.style.display = 'none';
            }
        });
    });
    
    // Modal close events
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
}

// Setup animations
function setupAnimations() {
    // Auto-resize textarea
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });
    
    // Typing indicator
    let typingTimeout;
    messageInput.addEventListener('input', () => {
        if (currentConversation) {
            // Show typing indicator
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
                // Hide typing indicator
            }, 1000);
        }
    });
}

// Utility functions
function showPendingRequests() {
    showToast('Pending requests feature coming soon!', 'success');
}

function attachFile() {
    showToast('File attachment feature coming soon!', 'success');
}

function attachImage() {
    showToast('Image attachment feature coming soon!', 'success');
}

function attachSkill() {
    showToast('Skill attachment feature coming soon!', 'success');
}

function viewFullProfile() {
    showToast('Redirecting to full profile...', 'success');
}

function blockUser() {
    if (confirm('Are you sure you want to block this user?')) {
        showToast('User blocked successfully', 'success');
        closeUserProfile();
    }
}

function toggleChatMenu() {
    showToast('Chat menu coming soon!', 'success');
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