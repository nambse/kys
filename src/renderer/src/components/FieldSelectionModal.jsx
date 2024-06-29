// FieldSelectionModal.jsx
import React, { useState } from 'react';

export default function FieldSelectionModal({ isOpen, onClose, onSave }) {
  const [fields, setFields] = useState([
    { label: "Sıra No", key: "siraNo" },
    { label: "Ad Soyad", key: "adSoyad" },
    { label: "Başvuru No", key: "basvuruNo" },
    { label: "Asil Yedek", key: "asilYedek" },
    { label: "Başvuru Kategorisi", key: "basvuruKategorisi" },
    { label: "TC Kimlik No", key: "tc" },
    { label: "İl", key: "il" },
    { label: "İlçe", key: "ilce" },
    { label: "Mahalle", key: "mahalle" },
    { label: "HUID", key: "huid" }
  ]);

  const handleAddField = () => {
    setFields([...fields, { label: "", key: "" }]);
  };

  const handleFieldChange = (index, field, value) => {
    const newFields = [...fields];
    newFields[index][field] = value;
    setFields(newFields);
  };

  const handleSave = () => {
    onSave(fields);
    onClose();
  };

  return (
    isOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
        <div className="bg-white p-6 rounded shadow-lg">
          <h2 className="text-xl font-bold mb-4">Select Fields</h2>
          {fields.map((field, index) => (
            <div key={index} className="mb-2">
              <input
                type="text"
                value={field.label}
                onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                placeholder="Label"
                className="mr-2 p-2 border rounded"
              />
              <input
                type="text"
                value={field.key}
                onChange={(e) => handleFieldChange(index, 'key', e.target.value)}
                placeholder="Key"
                className="p-2 border rounded"
              />
            </div>
          ))}
          <button onClick={handleAddField} className="mr-2 p-2 bg-blue-500 text-white rounded">Add Field</button>
          <button onClick={handleSave} className="mr-2 p-2 bg-green-500 text-white rounded">Save</button>
          <button onClick={onClose} className="p-2 bg-red-500 text-white rounded">Cancel</button>
        </div>
      </div>
    )
  );
}
