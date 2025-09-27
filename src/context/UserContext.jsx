import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [swapRequests, setSwapRequests] = useState({
    sent: [],
    received: []
  });
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "Welcome to Skill Swap Platform!",
      message: "We're excited to launch our new skill exchange platform. Start connecting with others to learn and grow together!",
      type: "info",
      createdAt: new Date().toISOString(),
      isActive: true
    }
  ]);
  const [activityLogs, setActivityLogs] = useState([
    {
      id: 1,
      userId: 1,
      userName: "Sarah Johnson",
      action: "login",
      details: "User logged in",
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      userId: 2,
      userName: "Mike Chen",
      action: "swap_request",
      details: "Sent swap request to Sarah Johnson",
      timestamp: new Date(Date.now() - 3600000).toISOString()
    }
  ]);

  // Dummy users data with admin role
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      location: "New York, NY",
      profilePhoto: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      skillsOffered: ["JavaScript", "React", "UI/UX Design"],
      skillsWanted: ["Python", "Machine Learning"],
      availability: "Weekends",
      rating: 4.8,
      isPublic: true,
      role: "user",
      isBanned: false,
      joinDate: "2024-01-15"
    },
    {
      id: 2,
      name: "Mike Chen",
      email: "mike@example.com",
      location: "San Francisco, CA",
      profilePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      skillsOffered: ["Python", "Data Science", "SQL"],
      skillsWanted: ["React", "Node.js"],
      availability: "Evenings",
      rating: 4.6,
      isPublic: true,
      role: "user",
      isBanned: false,
      joinDate: "2024-01-20"
    },
    {
      id: 3,
      name: "Emma Davis",
      email: "emma@example.com",
      location: "Austin, TX",
      profilePhoto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      skillsOffered: ["Graphic Design", "Illustration", "Branding"],
      skillsWanted: ["Web Development", "JavaScript"],
      availability: "Weekends",
      rating: 4.9,
      isPublic: true,
      role: "user",
      isBanned: false,
      joinDate: "2024-01-25"
    },
    {
      id: 4,
      name: "Alex Rodriguez",
      email: "alex@example.com",
      location: "Miami, FL",
      profilePhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      skillsOffered: ["Mobile Development", "Swift", "iOS"],
      skillsWanted: ["UI/UX Design", "Product Management"],
      availability: "Evenings",
      rating: 4.7,
      isPublic: true,
      role: "user",
      isBanned: false,
      joinDate: "2024-02-01"
    },
    {
      id: 5,
      name: "Lisa Wang",
      email: "lisa@example.com",
      location: "Seattle, WA",
      profilePhoto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      skillsOffered: ["Project Management", "Agile", "Leadership"],
      skillsWanted: ["Data Analysis", "Excel"],
      availability: "Weekends",
      rating: 4.5,
      isPublic: true,
      role: "user",
      isBanned: false,
      joinDate: "2024-02-05"
    },
    {
      id: 6,
      name: "Admin User",
      email: "admin@skillswap.com",
      location: "Admin HQ",
      profilePhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      skillsOffered: ["Platform Management", "User Support"],
      skillsWanted: ["Community Feedback"],
      availability: "Always",
      rating: 5.0,
      isPublic: false,
      role: "admin",
      isBanned: false,
      joinDate: "2024-01-01"
    }
  ]);

  // Available skills for selection
  const availableSkills = [
    "JavaScript", "React", "Node.js", "Python", "Java", "C++", "SQL", "MongoDB",
    "UI/UX Design", "Graphic Design", "Illustration", "Branding", "Mobile Development",
    "Swift", "iOS", "Android", "Data Science", "Machine Learning", "Project Management",
    "Agile", "Leadership", "Data Analysis", "Excel", "Product Management"
  ];

  // Check if user is logged in on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('skillSwapUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('skillSwapUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('skillSwapUser');
    }
  }, [user]);

  const register = (userData) => {
    // Check if email already exists
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      return { success: false, error: "Email already registered" };
    }

    // Create new user
    const newUser = {
      id: Date.now(),
      name: userData.name,
      email: userData.email,
      location: userData.location || "Not specified",
      profilePhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      skillsOffered: userData.skillsOffered,
      skillsWanted: userData.skillsWanted,
      availability: userData.availability,
      rating: 0,
      isPublic: true,
      role: "user",
      isBanned: false,
      joinDate: new Date().toISOString().split('T')[0]
    };

    // Add user to users array
    setUsers(prev => [...prev, newUser]);
    
    // Log the registration activity
    addActivityLog(newUser.id, newUser.name, "registration", "New user registered");
    
    // Auto-login the new user
    setUser(newUser);
    
    return { success: true };
  };

  const login = (email, password) => {
    // Simulate login - in real app this would be an API call
    const foundUser = users.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      // Log the login activity
      addActivityLog(foundUser.id, foundUser.name, "login", "User logged in");
      return { success: true };
    }
    return { success: false, error: "Invalid credentials" };
  };

  const logout = () => {
    if (user) {
      addActivityLog(user.id, user.name, "logout", "User logged out");
    }
    setUser(null);
  };

  const updateProfile = (updatedProfile) => {
    setUser(prev => ({ ...prev, ...updatedProfile }));
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, ...updatedProfile } : u));
    addActivityLog(user.id, user.name, "profile_update", "Profile updated");
  };

  const createSwapRequest = (targetUserId, skillOffered, skillRequested, message) => {
    const newRequest = {
      id: Date.now(),
      fromUserId: user.id,
      toUserId: targetUserId,
      fromUserName: user.name,
      toUserName: users.find(u => u.id === targetUserId)?.name,
      skillOffered,
      skillRequested,
      message,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setSwapRequests(prev => ({
      ...prev,
      sent: [...prev.sent, newRequest]
    }));

    // Also add to received requests for the target user (simulating real app)
    const receivedRequest = {
      ...newRequest,
      id: Date.now() + 1,
      fromUserId: user.id,
      toUserId: targetUserId
    };

    addActivityLog(user.id, user.name, "swap_request", `Sent swap request to ${users.find(u => u.id === targetUserId)?.name}`);
    console.log('Swap request created:', newRequest);
  };

  const updateSwapRequest = (requestId, status) => {
    setSwapRequests(prev => ({
      sent: prev.sent.map(req => 
        req.id === requestId ? { ...req, status } : req
      ),
      received: prev.received.map(req => 
        req.id === requestId ? { ...req, status } : req
      )
    }));
    
    const request = [...swapRequests.sent, ...swapRequests.received].find(req => req.id === requestId);
    if (request) {
      addActivityLog(user.id, user.name, "swap_update", `Updated swap request status to ${status}`);
    }
  };

  const deleteSwapRequest = (requestId) => {
    setSwapRequests(prev => ({
      sent: prev.sent.filter(req => req.id !== requestId),
      received: prev.received.filter(req => req.id !== requestId)
    }));
    addActivityLog(user.id, user.name, "swap_delete", "Deleted swap request");
  };

  // Admin functions
  const banUser = (userId) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, isBanned: true } : u
    ));
    const targetUser = users.find(u => u.id === userId);
    addActivityLog(user.id, user.name, "admin_action", `Banned user: ${targetUser?.name}`);
  };

  const unbanUser = (userId) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, isBanned: false } : u
    ));
    const targetUser = users.find(u => u.id === userId);
    addActivityLog(user.id, user.name, "admin_action", `Unbanned user: ${targetUser?.name}`);
  };

  const createAnnouncement = (announcement) => {
    const newAnnouncement = {
      id: Date.now(),
      ...announcement,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    setAnnouncements(prev => [...prev, newAnnouncement]);
    addActivityLog(user.id, user.name, "admin_action", `Created announcement: ${announcement.title}`);
  };

  const updateAnnouncement = (announcementId, updates) => {
    setAnnouncements(prev => prev.map(ann => 
      ann.id === announcementId ? { ...ann, ...updates } : ann
    ));
    addActivityLog(user.id, user.name, "admin_action", `Updated announcement: ${updates.title || 'ID: ' + announcementId}`);
  };

  const deleteAnnouncement = (announcementId) => {
    setAnnouncements(prev => prev.filter(ann => ann.id !== announcementId));
    addActivityLog(user.id, user.name, "admin_action", `Deleted announcement: ID ${announcementId}`);
  };

  const addActivityLog = (userId, userName, action, details) => {
    const newLog = {
      id: Date.now(),
      userId,
      userName,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const exportActivityLogs = () => {
    const csvContent = [
      ['ID', 'User ID', 'User Name', 'Action', 'Details', 'Timestamp'],
      ...activityLogs.map(log => [
        log.id,
        log.userId,
        log.userName,
        log.action,
        log.details,
        log.timestamp
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportUserReports = () => {
    const csvContent = [
      ['ID', 'Name', 'Email', 'Location', 'Role', 'Status', 'Join Date', 'Rating'],
      ...users.map(u => [
        u.id,
        u.name,
        u.email,
        u.location,
        u.role,
        u.isBanned ? 'Banned' : 'Active',
        u.joinDate,
        u.rating
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-reports-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const value = {
    user,
    users,
    availableSkills,
    swapRequests,
    announcements,
    activityLogs,
    register,
    login,
    logout,
    updateProfile,
    createSwapRequest,
    updateSwapRequest,
    deleteSwapRequest,
    // Admin functions
    banUser,
    unbanUser,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    exportActivityLogs,
    exportUserReports,
    addActivityLog
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 