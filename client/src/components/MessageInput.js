import React, { useState } from 'react';
import GifPicker from './GifPicker';
import VoiceMessage from './VoiceMessage';

const MessageInput = ({ onSend, disabled }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);

  const emojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '✨', '🙌', '🤔', '👋'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage('');
      setShowEmojiPicker(false);
      setShowGifPicker(false);
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowGifPicker(false);
              }}
            >
              <span role="img" aria-label="emoji">
                😊
              </span>
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-12 left-0 z-10 bg-white rounded-lg shadow-xl p-2 border">
                <div className="grid grid-cols-5 gap-2">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setMessage((prev) => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={() => {
              setShowGifPicker(!showGifPicker);
              setShowEmojiPicker(false);
            }}
          >
            <span role="img" aria-label="gif">
              🎭
            </span>
          </button>

          <VoiceMessage onRecord={(blob) => onSend(`[audio:${blob}]`)} />

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Type a message..."
            disabled={disabled}
          />
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className={`px-6 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-150 ${
              message.trim() && !disabled
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Send
          </button>
        </div>
      </form>

      {showGifPicker && (
        <GifPicker
          onSelect={(gifId) => {
            onSend(gifId);
            setShowGifPicker(false);
          }}
          onClose={() => setShowGifPicker(false)}
        />
      )}
    </div>
  );
};

export default MessageInput;
