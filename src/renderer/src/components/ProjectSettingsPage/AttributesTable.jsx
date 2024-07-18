import React, { useRef, useCallback } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FaTrash } from 'react-icons/fa';

const ItemType = 'HEADER';

const DraggableHeader = ({ attr, index, moveAttribute }) => {
  const ref = useRef(null);
  
  const [{ handlerId }, drop] = useDrop({
    accept: ItemType,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      moveAttribute(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: () => {
      return { index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0.5 : 1;
  drag(drop(ref));

  return (
    <th
      ref={ref}
      style={{ opacity, cursor: 'move' }}
      className="px-6 py-3 border-b border-gray-300 text-left text-xs font-semibold text-white uppercase tracking-wider"
      data-handler-id={handlerId}
    >
      {attr.label}
    </th>
  );
};

const AttributesTable = ({ attributes, onRemove, moveAttribute, type }) => {
  const handleMoveAttribute = useCallback((dragIndex, hoverIndex) => {
    moveAttribute(type, dragIndex, hoverIndex);
  }, [moveAttribute, type]);

  return (
    <DndProvider backend={HTML5Backend}>
      <table className="min-w-full leading-normal shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-700">
          <tr>
            {attributes.map((attr, index) => (
              <DraggableHeader
                key={attr.key}
                attr={attr}
                index={index}
                moveAttribute={handleMoveAttribute}
              />
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          <tr className="hover:bg-gray-200 transition duration-300 ease-in-out">
            {attributes.map((attr) => (
              <td
                key={attr.key}
                className="px-6 py-4 border-b border-gray-300 text-sm text-gray-800"
              >
                <button
                  onClick={() => onRemove(attr.key)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </DndProvider>
  );
};

export default AttributesTable;