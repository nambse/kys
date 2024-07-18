import React, { Fragment } from 'react';
import { useTable, usePagination, useGlobalFilter } from 'react-table';

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

const TableWithPagination = ({ columns, data, globalFilterEnabled = true, initialPageSize = 10 }) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize, globalFilter },
    setGlobalFilter
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: initialPageSize }
    },
    useGlobalFilter,
    usePagination
  );

  return (
    <div className="flex-grow overflow-hidden">
      {globalFilterEnabled && (
        <div className="my-4">
          <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
        </div>
      )}
      <div className="h-full overflow-auto">
        <table {...getTableProps()} className="min-w-full leading-normal shadow-md rounded-lg">
          <thead className="bg-gray-700 sticky top-0 z-10">
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())} className="px-6 py-3 border-b border-gray-500 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    {column.render('Header')}
                    <span>
                      {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className="bg-white">
            {page.map((row, i) => {
              prepareRow(row);
              return (
                <Fragment key={row.getRowProps().key}>
                  <tr {...row.getRowProps()} className="hover:bg-gray-200 transition duration-300 ease-in-out">
                    {row.cells.map(cell => (
                      <td {...cell.getCellProps()} className="px-6 py-4 border-b border-gray-300 text-sm text-gray-800">
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center items-center my-4 space-x-1 fixed bottom-0 left-0 w-full bg-white py-4">
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
          {[10, 20, 30, 40, 50].map(size => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TableWithPagination;
