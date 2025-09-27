import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const AdminPanel = () => {
  const { user, users, swapRequests, announcements, activityLogs, exportActivityLogs, exportUserReports } = useUser();

  // Calculate statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => !u.isBanned).length;
  const bannedUsers = users.filter(u => u.isBanned).length;
  const totalRequests = swapRequests.sent.length + swapRequests.received.length;
  const pendingRequests = [...swapRequests.sent, ...swapRequests.received].filter(req => req.status === 'pending').length;
  const activeAnnouncements = announcements.filter(ann => ann.isActive).length;
  const recentActivity = activityLogs.slice(0, 5);

  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      change: "+12%",
      changeType: "positive",
      icon: "👥"
    },
    {
      title: "Active Users",
      value: activeUsers,
      change: "+8%",
      changeType: "positive",
      icon: "✅"
    },
    {
      title: "Banned Users",
      value: bannedUsers,
      change: "-2%",
      changeType: "negative",
      icon: "🚫"
    },
    {
      title: "Total Requests",
      value: totalRequests,
      change: "+15%",
      changeType: "positive",
      icon: "🔄"
    },
    {
      title: "Pending Requests",
      value: pendingRequests,
      change: "+5%",
      changeType: "neutral",
      icon: "⏳"
    },
    {
      title: "Active Announcements",
      value: activeAnnouncements,
      change: "0%",
      changeType: "neutral",
      icon: "📢"
    }
  ];

  const quickActions = [
    {
      title: "Manage Users",
      description: "Ban/unban users, view profiles",
      icon: "👥",
      link: "/admin/users",
      color: "bg-blue-500"
    },
    {
      title: "Announcements",
      description: "Create and manage announcements",
      icon: "📢",
      link: "/admin/announcements",
      color: "bg-green-500"
    },
    {
      title: "Export Reports",
      description: "Download activity and user reports",
      icon: "📊",
      action: () => {
        exportActivityLogs();
        exportUserReports();
      },
      color: "bg-purple-500"
    },
    {
      title: "View Activity Logs",
      description: "Monitor user activities",
      icon: "📝",
      link: "/admin/activity",
      color: "bg-orange-500"
    }
  ];

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={pageVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
            <p className="text-gray-600">Manage your Skill Swap Platform</p>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm ${
                      stat.changeType === 'positive' ? 'text-green-600' :
                      stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className="text-3xl">{stat.icon}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
              >
                {action.link ? (
                  <Link to={action.link} className="block">
                    <div className="flex items-center mb-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl ${action.color}`}>
                        {action.icon}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </Link>
                ) : (
                  <button
                    onClick={action.action}
                    className="block w-full text-left"
                  >
                    <div className="flex items-center mb-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl ${action.color}`}>
                        {action.icon}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </button>
                )}
              </motion.div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              <Link
                to="/admin/activity"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View all →
              </Link>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 text-sm font-medium">
                        {activity.userName.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.userName}</p>
                    <p className="text-sm text-gray-600">{activity.details}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Platform Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Services</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Operational
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">New Users Today</span>
                  <span className="text-sm font-medium text-gray-900">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Swap Requests Today</span>
                  <span className="text-sm font-medium text-gray-900">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Sessions</span>
                  <span className="text-sm font-medium text-gray-900">24</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPanel; 