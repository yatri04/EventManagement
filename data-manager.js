// Data Manager for Skillswap - Real-time data storage and management

class DataManager {
    constructor() {
        this.storageKey = 'skillswap_data';
        this.initializeData();
    }

    // Initialize data structure
    initializeData() {
        if (!this.getData()) {
            this.setDefaultData();
        }
    }

    // Get all data
    getData() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : null;
    }

    // Set data
    setData(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    // Set default data structure
    setDefaultData() {
        const defaultData = {
            currentUser: {
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
            },
            users: [
                {
                    id: 2,
                    name: "Sarah Chen",
                    title: "Frontend Developer",
                    location: "San Francisco, CA",
                    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
                    skills: ["React", "JavaScript", "UI/UX Design"],
                    rating: 4.8,
                    bio: "Passionate frontend developer creating beautiful user experiences.",
                    availableSkills: ["React", "JavaScript", "UI/UX Design", "CSS"],
                    learnSkills: ["Python", "Node.js", "Machine Learning"]
                },
                {
                    id: 3,
                    name: "Marcus Rodriguez",
                    title: "Data Scientist",
                    location: "Austin, TX",
                    skills: ["Python", "Data Science", "Machine Learning"],
                    rating: 4.9,
                    bio: "Data scientist with expertise in ML and AI applications.",
                    availableSkills: ["Python", "TensorFlow", "Pandas", "SQL"],
                    learnSkills: ["React", "JavaScript", "Web Development"]
                },
                {
                    id: 4,
                    name: "Emma Thompson",
                    title: "Graphic Designer",
                    location: "New York, NY",
                    skills: ["Graphic Design", "Illustration", "Branding"],
                    rating: 4.7,
                    bio: "Creative designer specializing in brand identity and digital illustration.",
                    availableSkills: ["Adobe Creative Suite", "Illustration", "Branding", "Typography"],
                    learnSkills: ["Web Development", "Photography", "Animation"]
                }
            ],
            conversations: [],
            notifications: [],
            nextId: 5
        };
        this.setData(defaultData);
    }

    // Get current user
    getCurrentUser() {
        const data = this.getData();
        return data ? data.currentUser : null;
    }

    // Update current user
    updateCurrentUser(userData) {
        const data = this.getData();
        if (data) {
            data.currentUser = { ...data.currentUser, ...userData };
            this.setData(data);
        }
    }

    // Get all users
    getUsers() {
        const data = this.getData();
        return data ? data.users : [];
    }

    // Add new user
    addUser(userData) {
        const data = this.getData();
        if (data) {
            const newUser = {
                id: data.nextId++,
                ...userData
            };
            data.users.push(newUser);
            this.setData(data);
            return newUser;
        }
    }

    // Update user
    updateUser(userId, userData) {
        const data = this.getData();
        if (data) {
            const userIndex = data.users.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                data.users[userIndex] = { ...data.users[userIndex], ...userData };
                this.setData(data);
                return data.users[userIndex];
            }
        }
    }

    // Get conversations
    getConversations() {
        const data = this.getData();
        return data ? data.conversations : [];
    }

    // Add conversation
    addConversation(conversationData) {
        const data = this.getData();
        if (data) {
            const newConversation = {
                id: data.nextId++,
                ...conversationData,
                messages: [],
                unreadCount: 0,
                timestamp: new Date().toISOString()
            };
            data.conversations.push(newConversation);
            this.setData(data);
            return newConversation;
        }
    }

    // Add message to conversation
    addMessage(conversationId, messageData) {
        const data = this.getData();
        if (data) {
            const conversation = data.conversations.find(c => c.id === conversationId);
            if (conversation) {
                const newMessage = {
                    id: Date.now(),
                    ...messageData,
                    timestamp: new Date().toISOString()
                };
                conversation.messages.push(newMessage);
                conversation.lastMessage = messageData.text;
                conversation.timestamp = newMessage.timestamp;
                this.setData(data);
                return newMessage;
            }
        }
    }

    // Get notifications
    getNotifications() {
        const data = this.getData();
        return data ? data.notifications : [];
    }

    // Add notification
    addNotification(notificationData) {
        const data = this.getData();
        if (data) {
            const newNotification = {
                id: data.nextId++,
                ...notificationData,
                read: false,
                timestamp: new Date().toISOString()
            };
            data.notifications.unshift(newNotification);
            this.setData(data);
            return newNotification;
        }
    }

    // Mark notification as read
    markNotificationAsRead(notificationId) {
        const data = this.getData();
        if (data) {
            const notification = data.notifications.find(n => n.id === notificationId);
            if (notification) {
                notification.read = true;
                this.setData(data);
            }
        }
    }

    // Mark all notifications as read
    markAllNotificationsAsRead() {
        const data = this.getData();
        if (data) {
            data.notifications.forEach(notification => {
                notification.read = true;
            });
            this.setData(data);
        }
    }

    // Delete notification
    deleteNotification(notificationId) {
        const data = this.getData();
        if (data) {
            data.notifications = data.notifications.filter(n => n.id !== notificationId);
            this.setData(data);
        }
    }

    // Add skill to current user
    addSkill(skillData) {
        const data = this.getData();
        if (data) {
            const newSkill = {
                id: Date.now(),
                ...skillData
            };
            data.currentUser.skills.push(newSkill);
            this.setData(data);
            return newSkill;
        }
    }

    // Update skill
    updateSkill(skillId, skillData) {
        const data = this.getData();
        if (data) {
            const skillIndex = data.currentUser.skills.findIndex(s => s.id === skillId);
            if (skillIndex !== -1) {
                data.currentUser.skills[skillIndex] = { ...data.currentUser.skills[skillIndex], ...skillData };
                this.setData(data);
                return data.currentUser.skills[skillIndex];
            }
        }
    }

    // Delete skill
    deleteSkill(skillId) {
        const data = this.getData();
        if (data) {
            data.currentUser.skills = data.currentUser.skills.filter(s => s.id !== skillId);
            this.setData(data);
        }
    }

    // Add wanted skill
    addWantedSkill(skillData) {
        const data = this.getData();
        if (data) {
            const newSkill = {
                id: Date.now(),
                ...skillData
            };
            data.currentUser.wantedSkills.push(newSkill);
            this.setData(data);
            return newSkill;
        }
    }

    // Update wanted skill
    updateWantedSkill(skillId, skillData) {
        const data = this.getData();
        if (data) {
            const skillIndex = data.currentUser.wantedSkills.findIndex(s => s.id === skillId);
            if (skillIndex !== -1) {
                data.currentUser.wantedSkills[skillIndex] = { ...data.currentUser.wantedSkills[skillIndex], ...skillData };
                this.setData(data);
                return data.currentUser.wantedSkills[skillIndex];
            }
        }
    }

    // Delete wanted skill
    deleteWantedSkill(skillId) {
        const data = this.getData();
        if (data) {
            data.currentUser.wantedSkills = data.currentUser.wantedSkills.filter(s => s.id !== skillId);
            this.setData(data);
        }
    }

    // Add goal
    addGoal(goalData) {
        const data = this.getData();
        if (data) {
            const newGoal = {
                id: Date.now(),
                ...goalData,
                progress: 0
            };
            data.currentUser.goals.push(newGoal);
            this.setData(data);
            return newGoal;
        }
    }

    // Update goal
    updateGoal(goalId, goalData) {
        const data = this.getData();
        if (data) {
            const goalIndex = data.currentUser.goals.findIndex(g => g.id === goalId);
            if (goalIndex !== -1) {
                data.currentUser.goals[goalIndex] = { ...data.currentUser.goals[goalIndex], ...goalData };
                this.setData(data);
                return data.currentUser.goals[goalIndex];
            }
        }
    }

    // Delete goal
    deleteGoal(goalId) {
        const data = this.getData();
        if (data) {
            data.currentUser.goals = data.currentUser.goals.filter(g => g.id !== goalId);
            this.setData(data);
        }
    }

    // Add activity
    addActivity(activityData) {
        const data = this.getData();
        if (data) {
            const newActivity = {
                id: Date.now(),
                ...activityData,
                time: new Date().toLocaleString()
            };
            data.currentUser.activities.unshift(newActivity);
            // Keep only last 10 activities
            if (data.currentUser.activities.length > 10) {
                data.currentUser.activities = data.currentUser.activities.slice(0, 10);
            }
            this.setData(data);
            return newActivity;
        }
    }

    // Add connection
    addConnection(connectionData) {
        const data = this.getData();
        if (data) {
            const newConnection = {
                id: Date.now(),
                ...connectionData
            };
            data.currentUser.connections.push(newConnection);
            this.setData(data);
            return newConnection;
        }
    }

    // Remove connection
    removeConnection(connectionId) {
        const data = this.getData();
        if (data) {
            data.currentUser.connections = data.currentUser.connections.filter(c => c.id !== connectionId);
            this.setData(data);
        }
    }

    // Add feedback
    addFeedback(feedbackData) {
        const data = this.getData();
        if (data) {
            const newFeedback = {
                id: Date.now(),
                ...feedbackData,
                time: new Date().toLocaleString()
            };
            data.currentUser.feedback.unshift(newFeedback);
            // Keep only last 5 feedback items
            if (data.currentUser.feedback.length > 5) {
                data.currentUser.feedback = data.currentUser.feedback.slice(0, 5);
            }
            this.setData(data);
            return newFeedback;
        }
    }

    // Update ratings
    updateRatings(ratingData) {
        const data = this.getData();
        if (data) {
            data.currentUser.ratings = { ...data.currentUser.ratings, ...ratingData };
            this.setData(data);
        }
    }

    // Search users by skill
    searchUsersBySkill(skill) {
        const users = this.getUsers();
        return users.filter(user => 
            user.skills.some(s => s.toLowerCase().includes(skill.toLowerCase())) ||
            user.availableSkills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
        );
    }

    // Get unread notifications count
    getUnreadNotificationsCount() {
        const notifications = this.getNotifications();
        return notifications.filter(n => !n.read).length;
    }

    // Clear all data (for testing)
    clearAllData() {
        localStorage.removeItem(this.storageKey);
        this.initializeData();
    }

    // Export data (for backup)
    exportData() {
        return this.getData();
    }

    // Import data (for restore)
    importData(data) {
        this.setData(data);
    }
}

// Create global instance
const dataManager = new DataManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
} 