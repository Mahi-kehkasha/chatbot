const TypingIndicator = () => (
  <div className="flex space-x-2 p-3 bg-gray-100 rounded-lg max-w-fit">
    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
    <div
      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
      style={{ animationDelay: '0.2s' }}
    ></div>
    <div
      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
      style={{ animationDelay: '0.4s' }}
    ></div>
  </div>
);

export default TypingIndicator;
