import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';

const UserCard = ({ user }) => {
  const { user: currentUser, createSwapRequest } = useUser();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestData, setRequestData] = useState({
    skillOffered: '',
    skillRequested: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const canRequestSwap = currentUser && currentUser.id !== user.id;

  return (
    <>
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200"
      >
        {/* User Header */}
        <div className="flex items-center space-x-4 mb-4">
          <img
            src={user.profilePhoto || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face"}
            alt={user.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-600">{user.location}</p>
            <div className="flex items-center mt-1">
              <span className="text-yellow-400">⭐</span>
              <span className="text-sm text-gray-600 ml-1">{user.rating}</span>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="space-y-3 mb-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Can Offer:</h4>
            <div className="flex flex-wrap gap-1">
              {user.skillsOffered.slice(0, 3).map((skill, index) => (
                <span key={index} className="skill-tag text-xs">
                  {skill}
                </span>
              ))}
              {user.skillsOffered.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{user.skillsOffered.length - 3} more
                </span>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Wants to Learn:</h4>
            <div className="flex flex-wrap gap-1">
              {user.skillsWanted.slice(0, 3).map((skill, index) => (
                <span key={index} className="skill-tag-wanted text-xs">
                  {skill}
                </span>
              ))}
              {user.skillsWanted.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{user.skillsWanted.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Available:</span> {user.availability}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Link
            to={`/user/${user.id}`}
            className="flex-1 btn-secondary text-center text-sm"
          >
            View Profile
          </Link>
          {canRequestSwap && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowRequestModal(true)}
              className="flex-1 btn-primary text-sm"
            >
              Request Swap
            </motion.button>
          )}
        </div>
      </motion.div>

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
    </>
  );
};

export default UserCard; 