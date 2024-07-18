import React from 'react';

const Bubbles = ({ items, onClick }) => (
  <div className="flex flex-wrap gap-3 mb-6">
    {items.map((item, index) => (
      <button
        key={index}
        onClick={() => onClick(item)}
        className="px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-lg font-medium text-sm hover:bg-gray-50 hover:text-gray-800 hover:border-gray-300 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
      >
        {item}
      </button>
    ))}
  </div>
);

export default Bubbles;