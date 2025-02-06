const MessageReactions = ({ message, onReact }) => {
  const reactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  return (
    <div className="absolute -bottom-8 left-0 bg-white rounded-full shadow-lg px-2 py-1 flex space-x-1">
      {reactions.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onReact(message._id, emoji)}
          className="hover:bg-gray-100 p-1 rounded-full transition-colors"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};
