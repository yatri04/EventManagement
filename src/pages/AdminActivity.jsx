import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';

const AdminActivity = () => {
  const { user: currentUser, activityLogs, exportActivityLogs } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Filter activity logs
  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    
    const matchesDate = dateFilter === 'all' || (() => {
      const logDate = new Date(log.timestamp);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      switch (dateFilter) {
        case 'today':
          return logDate >= today;
        case 'yesterday':
          return logDate >= yesterday && logDate < today;
        case 'lastWeek':
          return logDate >= lastWeek;
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesAction && matchesDate;
  });

  const getActionIcon = (action) => {
    switch (action) {
      case 'login':
        return '🔐';
      case 'logout':
        return '🚪';
      case 'swap_request':
        return '🔄';
      case 'swap_update':
        return '✏️';
      case 'swap_delete':
        return '🗑️';
      case 'profile_update':
        return '👤';
      case 'admin_action':
        return '⚙️';
      default:
        return '📝';
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'login':
        return 'bg-green-100 text-green-800';
      case 'logout':
        return 'bg-gray-100 text-gray-800';
      case 'swap_request':
        return 'bg-blue-100 text-blue-800';
      case 'swap_update':
        return 'bg-yellow-100 text-yellow-800';
      case 'swap_delete':
        return 'bg-red-100 text-red-800';
      case 'profile_update':
        return 'bg-purple-100 text-purple-800';
      case 'admin_action':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      full: date.toLocaleString()
    };
  };

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

  if (!currentUser || currentUser.role !== 'admin') {
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Activity Logs</h1>
              <p className="text-gray-600">Monitor user activities and system events</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportActivityLogs}
              className="btn-primary"
            >
              Export Logs
            </motion.button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search by user, action, or details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Action Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action Type
                </label>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="all">All Actions</option>
                  <option value="login">Login</option>
                  <option value="logout">Logout</option>
                  <option value="swap_request">Swap Request</option>
                  <option value="swap_update">Swap Update</option>
                  <option value="swap_delete">Swap Delete</option>
                  <option value="profile_update">Profile Update</option>
                  <option value="admin_action">Admin Action</option>
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="lastWeek">Last 7 Days</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setActionFilter('all');
                    setDateFilter('all');
                  }}
                  className="btn-secondary w-full"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Activity Logs */}
          <div className="space-y-4">
            {filteredLogs.map((log, index) => (
              <motion.div
                key={log.id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex items-start space-x-4">
                  {/* Action Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-lg">{getActionIcon(log.action)}</span>
                    </div>
                  </div>

                  {/* Log Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{log.userName}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{log.details}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>User ID: {log.userId}</span>
                      <span>•</span>
                      <span>{formatTimestamp(log.timestamp).full}</span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => {
                        // Could open a modal with more details
                        alert(`Log ID: ${log.id}\nUser: ${log.userName}\nAction: ${log.action}\nDetails: ${log.details}\nTimestamp: ${formatTimestamp(log.timestamp).full}`);
                      }}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredLogs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No activity logs found</h3>
              <p className="text-gray-600">
                Try adjusting your search terms or filters to find more logs.
              </p>
            </motion.div>
          )}

          {/* Summary Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-2xl font-bold text-gray-900">{activityLogs.length}</div>
              <div className="text-sm text-gray-600">Total Logs</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-2xl font-bold text-green-600">
                {activityLogs.filter(log => log.action === 'login').length}
              </div>
              <div className="text-sm text-gray-600">Login Events</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-2xl font-bold text-blue-600">
                {activityLogs.filter(log => log.action.includes('swap')).length}
              </div>
              <div className="text-sm text-gray-600">Swap Events</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-2xl font-bold text-red-600">
                {activityLogs.filter(log => log.action === 'admin_action').length}
              </div>
              <div className="text-sm text-gray-600">Admin Actions</div>
            </div>
          </div>

          {/* Recent Activity Chart */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Actions by Type</h4>
                <div className="space-y-2">
                  {Object.entries(
                    activityLogs.reduce((acc, log) => {
                      acc[log.action] = (acc[log.action] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([action, count]) => (
                    <div key={action} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{action.replace('_', ' ')}</span>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Most Active Users</h4>
                <div className="space-y-2">
                  {Object.entries(
                    activityLogs.reduce((acc, log) => {
                      acc[log.userName] = (acc[log.userName] || 0) + 1;
                      return acc;
                    }, {})
                  )
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([userName, count]) => (
                      <div key={userName} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{userName}</span>
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminActivity; 