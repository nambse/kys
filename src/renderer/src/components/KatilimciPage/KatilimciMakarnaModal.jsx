import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaTimes, FaDownload, FaAsterisk } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const ItemType = 'HEADER';

const DraggableHeader = React.memo(({ id, children, moveHeader }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover(item) {
      if (item.id !== id) {
        moveHeader(item.id, id);
      }
    },
  });

  return (
    <th 
      ref={(node) => drag(drop(node))} 
      style={{ opacity: isDragging ? 0.5 : 1 }} 
      className="py-3 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700"
    >
      {children}
    </th>
  );
});

const KatilimciMakarnaModal = ({ isOpen, onClose, data, attributes }) => {
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [starredAttributes, setStarredAttributes] = useState([]);
  const [headerOrder, setHeaderOrder] = useState([]);
  const [isStarModalOpen, setIsStarModalOpen] = useState(false);
  const [currentAttr, setCurrentAttr] = useState(null);
  const [starValue, setStarValue] = useState(1);
  const [starValueError, setStarValueError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const initialAttributes = attributes.map(attr => attr.key);
      setSelectedAttributes(initialAttributes);
      setHeaderOrder(initialAttributes);
    }
  }, [isOpen, attributes]);

  const makarnaData = useMemo(() => {
    return data.map((d) => {
      const filtered = {};
      selectedAttributes.forEach((a) => {
        filtered[a] = d[a];
      });
      starredAttributes.forEach(({ key, originalKey, starValue }) => {
        const originalValue = d[originalKey];
        if (originalValue) {
          filtered[key] = starValue > originalValue.length
            ? originalValue
            : originalValue.substring(0, starValue) + '*'.repeat(originalValue.length - starValue);
        } else {
          filtered[key] = '';
        }
      });
      return filtered;
    });
  }, [data, selectedAttributes, starredAttributes]);

  const exampleData = useMemo(() => makarnaData.slice(0, 4), [makarnaData]);

  const handleAttributeChange = useCallback((attr) => {
    setSelectedAttributes(prev => 
      prev.includes(attr) ? prev.filter(a => a !== attr) : [...prev, attr]
    );
    setHeaderOrder(prev => 
      prev.includes(attr) ? prev.filter(a => a !== attr) : [...prev, attr]
    );
  }, []);

  const promptForStarredVersion = useCallback((attr) => {
    if (starredAttributes.some(starAttr => starAttr.originalKey === attr)) {
      setStarredAttributes(prev => prev.filter(starAttr => starAttr.originalKey !== attr));
      setHeaderOrder(prev => prev.filter(header => header !== `starred_${attr}`));
    } else {
      setCurrentAttr(attr);
      setIsStarModalOpen(true);
    }
  }, [starredAttributes]);

  const handleStarValueChange = useCallback((e) => {
    setStarValue(parseInt(e.target.value, 10));
  }, []);

  const addStarredAttribute = useCallback(() => {
    const maxLength = Math.max(...data.map(d => d[currentAttr]?.length || 0));
    if (starValue > maxLength) {
      setStarValueError(`Basamak değeri maksimum veri uzunluğu olan ${maxLength} karakterden büyük olamaz.`);
    } else if (starValue > 0) {
      const originalAttr = attributes.find(a => a.key === currentAttr);
      const newStarredAttr = {
        key: `starred_${currentAttr}`,
        originalKey: currentAttr,
        starValue,
        label: originalAttr ? `${originalAttr.label}*` : `${currentAttr}*`
      };
      setStarredAttributes(prev => [...prev, newStarredAttr]);
      setHeaderOrder(prev => [...prev, `starred_${currentAttr}`]);
      setIsStarModalOpen(false);
      setStarValueError('');
    } else {
      setStarValueError("Geçerli bir sayı giriniz.");
    }
  }, [currentAttr, starValue, attributes, data]);

  const exportToExcel = useCallback(() => {
    const exportData = makarnaData.map((d) => {
      const filtered = {};
      headerOrder.forEach((a) => {
        const attribute = attributes.find(attr => attr.key === a) || starredAttributes.find(attr => attr.key === a);
        if (attribute) {
          filtered[attribute.label] = d[a];
        }
      });
      return filtered;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Katılımcılar');
    XLSX.writeFile(wb, 'katılımcılar.xlsx');
  }, [makarnaData, headerOrder, attributes, starredAttributes]);

  const moveHeader = useCallback((draggedId, hoverId) => {
    setHeaderOrder(prev => {
      const dragIndex = prev.indexOf(draggedId);
      const hoverIndex = prev.indexOf(hoverId);
      const newOrder = [...prev];
      newOrder.splice(dragIndex, 1);
      newOrder.splice(hoverIndex, 0, draggedId);
      return newOrder;
    });
  }, []);

  if (!isOpen) return null;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75">
        <div className="bg-white rounded-lg shadow-lg w-3/4 h-3/4 p-8 relative overflow-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-700 hover:text-gray-900"
          >
            <FaTimes size={24} />
          </button>
          <h2 className="text-3xl font-semibold mb-6 text-center">Katılımcı Makarna Hazırla</h2>
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">Aşağıdaki başlıklardan seçim yapınız:</h3>
            <div className="flex flex-wrap gap-4">
              {attributes.map((attr) => (
                <div key={attr.key} className="relative border rounded-lg p-4 shadow-md bg-gray-100">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedAttributes.includes(attr.key)}
                      onChange={() => handleAttributeChange(attr.key)}
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                    <span>{attr.label}</span>
                  </label>
                  <button
                    onClick={() => promptForStarredVersion(attr.key)}
                    className={`absolute -top-4 -right-4 mt-2 mr-2 ${starredAttributes.some(starAttr => starAttr.originalKey === attr.key) ? 'text-red-500 hover:text-red-700' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <FaAsterisk size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">Çıktı:</h3>
            <div className="overflow-hidden border border-gray-300 rounded-lg shadow-sm relative">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    {headerOrder.map((attr) => {
                      const attribute = attributes.find(attribute => attribute.key === attr) || starredAttributes.find(attribute => attribute.key === attr);
                      return (
                        <DraggableHeader key={attr} id={attr} moveHeader={moveHeader}>
                          {attribute ? attribute.label : attr}
                        </DraggableHeader>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {exampleData.slice(0, 3).map((row, index) => (
                    <tr key={index}>
                      {headerOrder.map((attr) => (
                        <td key={attr} className="py-3 px-4 border-b border-gray-200 text-sm">
                          {row[attr]}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="blur-sm">
                    {headerOrder.map((attr) => (
                      <td key={attr} className="py-3 px-4 border-b border-gray-200 text-sm">
                        {exampleData[3] ? exampleData[3][attr] : ''}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent"></div>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={exportToExcel}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center space-x-2 transition duration-300"
            >
              <FaDownload />
              <span>Excel'e Aktar</span>
            </button>
          </div>
        </div>
        {isStarModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75">
            <div className="bg-white rounded-lg shadow-lg w-1/3 p-6 relative">
              <button
                onClick={() => setIsStarModalOpen(false)}
                className="absolute top-4 right-4 text-gray-700 hover:text-gray-900"
              >
                <FaTimes size={24} />
              </button>
              <h3 className="text-lg font-semibold mb-4">Kaç Basamak Gözüksün?</h3>
              <input
                type="number"
                min="1"
                value={starValue}
                onChange={handleStarValueChange}
                className={`w-full p-2 border ${starValueError ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {starValueError && (
                <p className="text-red-500 text-sm mt-2">{starValueError}</p>
              )}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={addStarredAttribute}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                >
                  Ekle
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default KatilimciMakarnaModal;