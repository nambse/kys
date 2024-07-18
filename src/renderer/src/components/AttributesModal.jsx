import React, { useState } from 'react';
import Modal from 'react-modal';

const AttributesModal = ({ isOpen, onClose, onSubmit }) => {
  const [attributes, setAttributes] = useState(['']);

  const handleChange = (index, event) => {
    const newAttributes = [...attributes];
    newAttributes[index] = event.target.value;
    setAttributes(newAttributes);
  };

  const handleAddAttribute = () => {
    setAttributes([...attributes, '']);
  };

  const handleRemoveAttribute = (index) => {
    const newAttributes = [...attributes];
    newAttributes.splice(index, 1);
    setAttributes(newAttributes);
  };

  const handleSubmit = () => {
    const validAttributes = attributes.filter(attr => attr.trim() !== '');
    if (validAttributes.length === 0) {
      alert('Please add at least one attribute.');
    } else {
      onSubmit(validAttributes);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Attributes Modal"
      className="modal"
      overlayClassName="overlay"
    >
      <h2 className="text-xl font-semibold mb-4">Enter Katılımcı Attributes</h2>
      {attributes.map((attr, index) => (
        <div key={index} className="mb-2 flex items-center">
          <input
            type="text"
            value={attr}
            onChange={(e) => handleChange(index, e)}
            placeholder={`Attribute ${index + 1}`}
            className="px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm flex-grow"
          />
          <button
            onClick={() => handleRemoveAttribute(index)}
            className="ml-2 px-3 py-2 bg-red-600 text-white rounded-md"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        onClick={handleAddAttribute}
        className="px-4 py-2 bg-blue-600 text-white rounded-md mb-4"
      >
        Add Attribute
      </button>
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-green-600 text-white rounded-md mr-2"
        >
          Save
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded-md"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default AttributesModal;
