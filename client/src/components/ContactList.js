import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import config from '../config';
import { getAvatarUrl } from '../utils/avatar';

const ContactList = ({ onSelectContact, selectedContact }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchContacts = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/users/contacts`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setContacts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Add socket listener for online status updates
  useEffect(() => {
    const socket = io(config.SOCKET_URL);

    socket.on('userOnline', (userId) => {
      setContacts((prev) =>
        prev.map((contact) =>
          contact._id === userId ? { ...contact, isOnline: true } : contact
        )
      );
    });

    socket.on('userOffline', (userId) => {
      setContacts((prev) =>
        prev.map((contact) =>
          contact._id === userId
            ? { ...contact, isOnline: false, lastActive: new Date() }
            : contact
        )
      );
    });

    // Refresh contacts every minute
    const interval = setInterval(() => {
      fetchContacts();
    }, 60000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return <div className="p-4">Loading contacts...</div>;
  }

  // Filter contacts based on search
  const filteredContacts = contacts.filter(
    (contact) =>
      contact.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <span className="mr-2">💬</span>
          Conversations
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {contacts.filter((c) => c.isOnline).length} online
        </p>
        <div className="mt-3">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>
      </div>
      <div className="overflow-y-auto h-[calc(100vh-80px)]">
        {filteredContacts.map((contact) => (
          <div
            key={contact._id}
            onClick={() => onSelectContact(contact)}
            className={`p-4 cursor-pointer hover:bg-gray-50 flex items-center space-x-3 transition-colors duration-150 ${
              selectedContact?._id === contact._id ? 'bg-blue-50' : ''
            }`}
          >
            <div className="relative">
              <img
                src={contact.profilePicture || getAvatarUrl(contact.username)}
                alt={contact.username}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getAvatarUrl(contact.username);
                }}
              />
              <span
                className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                  contact.isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate flex items-center">
                {contact.username}
                {contact.isOnline && (
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-600 font-medium truncate">
                {contact.role}
              </p>
              <p className="text-xs text-gray-500 truncate">{contact.status}</p>
              <p
                className={`text-xs ${
                  contact.isOnline ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                {contact.isOnline
                  ? 'Online'
                  : `Last seen ${new Date(
                      contact.lastActive
                    ).toLocaleString()}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactList;
