import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAvatarUrl } from '../utils/avatar';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <span className="text-xl font-bold">CHATBOT</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img
                src={user?.profilePicture || getAvatarUrl(user?.username)}
                alt={user?.username}
                className="w-8 h-8 rounded-full border-2 border-white"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getAvatarUrl(user?.username);
                }}
              />
              <div className="text-sm">
                <p className="font-medium">{user?.username}</p>
                <p className="text-xs opacity-75">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
