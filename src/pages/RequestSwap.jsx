import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { UserContext } from '../context/UserContext';

const RequestSwap = () => {
  const { users, skills, currentUser, addSwapRequest } = useContext(UserContext);
  const [selectedUser, setSelectedUser] = useState('');
  const [skillToOffer, setSkillToOffer] = useState('');
  const [skillToReceive, setSkillToReceive] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Filter out current user from the list
  const availableUsers = users.filter(user => user.id !== currentUser?.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser || !skillToOffer || !skillToReceive) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newRequest = {
        id: Date.now(),
        fromUser: currentUser.id,
        toUser: parseInt(selectedUser),
        skillOffered: skillToOffer,
        skillRequested: skillToReceive,
        message,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      addSwapRequest(newRequest);
      setIsSubmitting(false);
      setShowSuccess(true);
      
      // Reset form
      setSelectedUser('');
      setSkillToOffer('');
      setSkillToReceive('');
      setMessage('');
      
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Request a Skill Swap
            </h1>
            <p className="text-gray-600">
              Connect with other users and exchange your skills
            </p>
          </div>

          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Swap request sent successfully!
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Select User */}
            <div>
              <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-2">
                Select User to Swap With *
              </label>
              <select
                id="user"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              >
                <option value="">Choose a user...</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} - {user.skillsOffered.join(', ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Skill to Offer */}
            <div>
              <label htmlFor="skillToOffer" className="block text-sm font-medium text-gray-700 mb-2">
                Skill You Want to Offer *
              </label>
              <select
                id="skillToOffer"
                value={skillToOffer}
                onChange={(e) => setSkillToOffer(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              >
                <option value="">Select a skill to offer...</option>
                {skills.map(skill => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </div>

            {/* Skill to Receive */}
            <div>
              <label htmlFor="skillToReceive" className="block text-sm font-medium text-gray-700 mb-2">
                Skill You Want to Receive *
              </label>
              <select
                id="skillToReceive"
                value={skillToReceive}
                onChange={(e) => setSkillToReceive(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              >
                <option value="">Select a skill to receive...</option>
                {skills.map(skill => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message (Optional)
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                placeholder="Tell them why you'd like to swap skills..."
              />
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-colors ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending Request...
                </div>
              ) : (
                'Send Swap Request'
              )}
            </motion.button>
          </form>

          {/* Tips Section */}
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              💡 Tips for Successful Swaps
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Be specific about what you can offer and what you want to learn</li>
              <li>• Include your availability and preferred meeting format</li>
              <li>• Mention any relevant experience or background</li>
              <li>• Be respectful and professional in your message</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RequestSwap; 