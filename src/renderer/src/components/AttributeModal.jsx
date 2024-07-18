import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const AttributeModal = ({ isOpen, onRequestClose, attributes, handleAttributeChange, addAttribute, handleAttributesSubmit }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Attribute Modal"
      className="modal"
      overlayClassName="modal-overlay"
    >
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Yeni Alanlar Ekle</h2>
        {attributes.map((attribute, index) => (
          <div key={index} className="mb-4 flex space-x-2">
            <input
              type="text"
              value={attribute.name}
              onChange={(e) => handleAttributeChange(index, 'name', e.target.value)}
              placeholder="Alan Adı"
              className="p-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
        <button
          onClick={addAttribute}
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Alan Ekle
        </button>
        <button
          onClick={handleAttributesSubmit}
          className="mt-4 p-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Kaydet ve Yüklemeye Başla
        </button>
      </div>
    </Modal>
  );
};

export default AttributeModal;
