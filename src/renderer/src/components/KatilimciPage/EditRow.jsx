import React from 'react';
import { FaSave } from 'react-icons/fa';

const EditRow = ({ row, editValues, handleInputChange, handleSaveEdit }) => (
  <tr className="bg-gray-100 transition duration-300 ease-in-out">
    {row.cells.map(cell => (
      <td key={cell.getCellProps().key} className="px-6 py-4 border-b border-gray-300 text-sm text-gray-800">
        {cell.column.id === 'edit' ? (
          <button
            onClick={() => handleSaveEdit(row.index)}
            className="text-green-500 hover:text-green-700"
          >
            <FaSave />
          </button>
        ) : (
          <input
            type="text"
            value={editValues[cell.column.id] || ''}
            onChange={(e) => handleInputChange(e, cell.column.id)}
            className="w-full px-2 py-1 border rounded"
          />
        )}
      </td>
    ))}
  </tr>
);

export default EditRow;
