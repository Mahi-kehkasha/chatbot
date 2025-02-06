import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [profilePicture, setProfilePicture] = useState(
    user?.profilePicture || ''
  );
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.put(
        'http://localhost:5000/api/users/profile',
        {
          username,
          profilePicture,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setUser(response.data);
      setIsEditing(false);
    } catch (error) {
      setError('Failed to update profile');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Profile</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-6 mb-6">
          <img
            src={profilePicture || 'https://via.placeholder.com/100'}
            alt={username}
            className="w-24 h-24 rounded-full"
          />
          {isEditing ? (
            <input
              type="text"
              value={profilePicture}
              onChange={(e) => setProfilePicture(e.target.value)}
              placeholder="Profile picture URL"
              className="flex-1 p-2 border rounded"
            />
          ) : (
            <h3 className="text-xl font-medium">{username}</h3>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full p-2 border rounded"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;
