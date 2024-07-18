import React from 'react';

const Pagination = ({
  pageIndex,
  pageSize,
  canPreviousPage,
  canNextPage,
  pageOptions,
  pageCount,
  gotoPage,
  previousPage,
  nextPage,
  setPageSize
}) => (
  <div className="flex justify-center items-center my-4 space-x-1">
    <button
      onClick={() => gotoPage(0)}
      disabled={!canPreviousPage}
      className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7"></path></svg>
    </button>

    <button
      onClick={() => previousPage()}
      disabled={!canPreviousPage}
      className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg>
    </button>

    <span className="px-3 py-2">
      Sayfa {pageIndex + 1} / {pageOptions.length}
    </span>

    <button
      onClick={() => nextPage()}
      disabled={!canNextPage}
      className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path></svg>
    </button>

    <button
      onClick={() => gotoPage(pageCount - 1)}
      disabled={!canNextPage}
      className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 19l7-7-7-7"></path></svg>
    </button>

    <select
      value={pageSize}
      onChange={e => setPageSize(Number(e.target.value))}
      className="border border-gray-300 rounded py-2 px-4 focus:outline-none focus:border-blue-500"
    >
      {[10, 50, 100, 250, 1000].map(size => (
        <option key={size} value={size}>
          {size}
        </option>
      ))}
    </select>
  </div>
);

export default Pagination;
