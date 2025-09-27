import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';

const UserProfile = () => {
  const { id } = useParams();
  const { user: currentUser, users, createSwapRequest } = useUser();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestData, setRequestData] = useState({
    skillOffered: '',
    skillRequested: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = users.find(u => u.id === parseInt(id));

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      createSwapRequest(
        user.id,
        requestData.skillOffered,
        requestData.skillRequested,
        requestData.message
      );
      setShowRequestModal(false);
      setRequestData({ skillOffered: '', skillRequested: '', message: '' });
    } catch (error) {
      console.error('Failed to create swap request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h2>
          <p className="text-gray-600">The user you're looking for doesn't exist.</p>
          <Link to="/" className="btn-primary mt-4 inline-block">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const canRequestSwap = currentUser && currentUser.id !== user.id;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="flex items-center space-x-6">
              <img
                src={user.profilePhoto || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover"
              />
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
                <p className="text-lg text-gray-600 mb-2">{user.location}</p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <span className="text-yellow-400 text-xl">⭐</span>
                    <span className="text-lg font-medium text-gray-900 ml-1">{user.rating}</span>
                  </div>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600">Available: {user.availability}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600">Member since {new Date(user.joinDate).toLocaleDateString()}</span>
                </div>
              </div>
              {canRequestSwap && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowRequestModal(true)}
                  className="btn-primary"
                >
                  Request Swap
                </motion.button>
              )}
            </div>
          </div>

          {/* Skills Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Skills Offered */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills Offered</h2>
              <div className="flex flex-wrap gap-2">
                {user.skillsOffered.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Skills Wanted */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills Wanted</h2>
              <div className="flex flex-wrap gap-2">
                {user.skillsWanted.map((skill, index) => (
                  <span key={index} className="skill-tag-wanted">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
            <p className="text-gray-600">
              {user.name} is passionate about skill sharing and learning. They're available {user.availability.toLowerCase()} 
              and have a rating of {user.rating} stars from the community.
            </p>
          </div>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <Link to="/" className="btn-secondary">
              ← Back to Home
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Request Swap Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Request Swap with {user.name}
            </h3>
            
            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill You'll Offer
                </label>
                <select
                  value={requestData.skillOffered}
                  onChange={(e) => setRequestData(prev => ({ ...prev, skillOffered: e.target.value }))}
                  className="input-field"
                  required
                >
                  <option value="">Select a skill</option>
                  {currentUser.skillsOffered.map((skill) => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill You Want to Learn
                </label>
                <select
                  value={requestData.skillRequested}
                  onChange={(e) => setRequestData(prev => ({ ...prev, skillRequested: e.target.value }))}
                  className="input-field"
                  required
                >
                  <option value="">Select a skill</option>
                  {user.skillsOffered.map((skill) => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={requestData.message}
                  onChange={(e) => setRequestData(prev => ({ ...prev, message: e.target.value }))}
                  className="input-field"
                  rows={3}
                  placeholder="Tell them about your learning goals..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 btn-primary"
                >
                  {isSubmitting ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UserProfile; 