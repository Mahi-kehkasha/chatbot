import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ContactList from './ContactList';
import io from 'socket.io-client';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';
import TypingIndicator from './TypingIndicator';
import config from '../config';
import Header from './Header';
import MessageInput from './MessageInput';
import CallHandler from './CallHandler';
import { getAvatarUrl } from '../utils/avatar';

const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const messagesEndRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [stickers, setStickers] = useState([]);
  const [showCallHandler, setShowCallHandler] = useState(false);

  useEffect(() => {
    const newSocket = io(config.SOCKET_URL);
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket && user) {
      socket.emit('login', user.id);

      socket.on('receiveMessage', (message) => {
        if (
          selectedContact &&
          (message.sender === selectedContact._id || message.sender === user.id)
        ) {
          setMessages((prev) => [...prev, message]);
        }
      });
    }
  }, [socket, user, selectedContact]);

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${config.API_URL}/api/messages/${selectedContact._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedContact]);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages();
    }
  }, [selectedContact, fetchMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (socket && user) {
      socket.on('userTyping', (userId) => {
        if (selectedContact?._id === userId) {
          setIsTyping(true);
        }
      });

      socket.on('userStoppedTyping', (userId) => {
        if (selectedContact?._id === userId) {
          setIsTyping(false);
        }
      });
    }
  }, [socket, user, selectedContact]);

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach((message) => {
      const date = new Date(message.createdAt).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const renderMessageContent = (content) => {
    if (content.startsWith('[sticker:')) {
      const stickerId = content.match(/\[sticker:(\d+)\]/)[1];
      const sticker = stickers.find((s) => s.id === parseInt(stickerId));
      return sticker ? (
        <img
          src={sticker.url}
          alt={sticker.label}
          className="w-32 h-32 object-contain"
        />
      ) : (
        content
      );
    }
    if (content.startsWith('[gif:')) {
      const gifUrl = content.match(/\[gif:(.*?)\]/)[1];
      return (
        <img
          src={gifUrl}
          alt="GIF"
          className="w-48 h-48 object-contain rounded-lg"
        />
      );
    }
    return content;
  };

  useEffect(() => {
    // Initialize stickers
    setStickers([
      {
        id: 1,
        url: 'https://media.giphy.com/media/LOnt6uqjD9OexmQJRB/giphy.gif',
        label: 'Thumbs Up',
      },
      {
        id: 2,
        url: 'https://media.giphy.com/media/dw36yjtOAtuSZyxEJG/giphy.gif',
        label: 'Hello',
      },
    ]);
  }, []); // Run once on mount

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/4 border-r border-gray-200">
          <ContactList
            onSelectContact={setSelectedContact}
            selectedContact={selectedContact}
          />
        </div>
        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedContact ? (
            <>
              <div className="p-4 border-b bg-white shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={
                        selectedContact.profilePicture ||
                        getAvatarUrl(selectedContact.username)
                      }
                      alt={selectedContact.username}
                      className="w-10 h-10 rounded-full"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = getAvatarUrl(selectedContact.username);
                      }}
                    />
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {selectedContact.username}
                      </h2>
                      <p
                        className={`text-sm ${
                          selectedContact.isOnline
                            ? 'text-green-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {selectedContact.isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowCallHandler(true)}
                      className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                      title="Start call"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    {isTyping && (
                      <div className="flex justify-start">
                        <TypingIndicator />
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                    <div className="space-y-4">
                      {Object.entries(groupMessagesByDate(messages)).map(
                        ([date, msgs]) => (
                          <div key={date} className="space-y-4">
                            <div className="flex justify-center">
                              <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                                {date === new Date().toLocaleDateString()
                                  ? 'Today'
                                  : date}
                              </span>
                            </div>
                            {msgs.map((message, index) => (
                              <div
                                key={message._id || index}
                                className={`flex ${
                                  message.sender === user.id
                                    ? 'justify-end'
                                    : 'justify-start'
                                }`}
                              >
                                {message.sender !== user.id && (
                                  <img
                                    src={selectedContact.profilePicture}
                                    alt=""
                                    className="w-8 h-8 rounded-full mr-2 self-end"
                                  />
                                )}
                                <div
                                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                    message.sender === user.id
                                      ? 'bg-blue-600 text-white rounded-br-none'
                                      : 'bg-white text-gray-800 rounded-bl-none shadow'
                                  }`}
                                >
                                  <div className="whitespace-pre-wrap break-words">
                                    {renderMessageContent(message.content)}
                                  </div>
                                  <div
                                    className={`text-xs mt-1 ${
                                      message.sender === user.id
                                        ? 'text-blue-100'
                                        : 'text-gray-500'
                                    }`}
                                  >
                                    {new Date(
                                      message.createdAt
                                    ).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                    {message.sender === user.id && (
                                      <span className="ml-2">
                                        {message.read ? '✓✓' : '✓'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      )}
                    </div>
                  </>
                )}
              </div>

              <MessageInput
                onSend={async (content) => {
                  if (content && selectedContact && !sendingMessage) {
                    setSendingMessage(true);
                    try {
                      const response = await axios.post(
                        `${config.API_URL}/api/messages`,
                        {
                          receiverId: selectedContact._id,
                          content: content,
                        },
                        {
                          headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                              'token'
                            )}`,
                          },
                        }
                      );

                      socket.emit('sendMessage', {
                        ...response.data,
                        receiverId: selectedContact._id,
                      });
                      setMessages((prev) => [...prev, response.data]);
                    } catch (error) {
                      console.error('Error sending message:', error);
                    } finally {
                      setSendingMessage(false);
                    }
                  }
                }}
                disabled={!selectedContact || sendingMessage}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="mt-4 text-lg">Select a contact to start chatting</p>
            </div>
          )}
        </div>
      </div>
      {showCallHandler && (
        <CallHandler
          selectedContact={selectedContact}
          user={user}
          onClose={() => setShowCallHandler(false)}
        />
      )}
    </div>
  );
};

export default Chat;
