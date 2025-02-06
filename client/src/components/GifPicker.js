import React, { useState } from 'react';

const GifPicker = ({ onSelect, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const staticGifs = [
    {
      id: '1',
      url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDdtY2JrY3BxNXF1bXRzNXdrOGV1NnB4bWw5a3BveGptcnR6YnBpYiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/LOnt6uqjD9OexmQJRB/giphy.gif',
      description: 'Thumbs Up',
    },
    {
      id: '2',
      url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmh2ZmdvNnBpbTR0MjI4Z2VrYnJ3YTk4M3JvYmx1ZHV0YnB3NHB6eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/dw36yjtOAtuSZyxEJG/giphy.gif',
      description: 'Hello',
    },
    {
      id: '3',
      url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaWZqbWd4Y3JxbmRwN2t6ZXBxbXd6aXBxaWN0ZnBnYnBzaWQyeXEmZXA9djFfaW50ZXJuYWxfZ2lmX2J5X2lkJmN0PXM/DhstvI3zZ598Nb1rFf/giphy.gif',
      description: 'Wave',
    },
    {
      id: '4',
      url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcHVpcWRxZWlsY2JyYmQyYnJnOWVpY2h5ZWd6ZHBxbWxwdWQyeWVxdyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/xT9IgG50Fb7Mi0prBC/giphy.gif',
      description: 'Laugh',
    },
  ];

  const filteredGifs = staticGifs.filter((gif) =>
    gif.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="absolute bottom-16 left-0 z-10 bg-white rounded-lg shadow-xl p-4 border w-[320px] h-[400px]">
      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Search GIFs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 overflow-y-auto h-[calc(100%-60px)]">
        {filteredGifs.map((gif) => (
          <button
            key={gif.id}
            onClick={() => {
              onSelect(`[gif:${gif.url}]`);
              onClose();
            }}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <img
              src={gif.url}
              alt={gif.description}
              className="w-full h-32 object-cover rounded"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default GifPicker;
