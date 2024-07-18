import React from 'react';

const GlobalFilter = ({ globalFilter, setGlobalFilter }) => (
  <div className="flex justify-center mt-4">
    <input
      value={globalFilter || ''}
      onChange={e => setGlobalFilter(e.target.value || undefined)}
      placeholder="Search..."
      className="mt-1 block w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    />
  </div>
);

export default GlobalFilter;
