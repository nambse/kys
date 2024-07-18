import React from 'react';

const Bubbles = ({ items, onClick }) => (
  <div className="flex flex-wrap gap-2 mb-4">
    {items.map((item, index) => (
      <button
        key={index}
        onClick={() => onClick(item)}
        className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-700 shadow-md transition-transform transform hover:scale-105"
      >
        {item}
      </button>
    ))}
  </div>
);

export default Bubbles;
