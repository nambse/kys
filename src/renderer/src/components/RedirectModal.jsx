// src/components/RedirectModal.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const RedirectModal = ({ isOpen, onClose, message, redirectPath }) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (!isOpen) {
    return null;
  }

  const handleGoToSettings = () => {
    navigate(redirectPath);
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-80 max-w-sm">
        <div className="text-center mb-4">
          <p className="text-gray-700 text-lg font-medium">{message}</p>
        </div>
        <div className="flex justify-center mt-4 space-x-4">
          <button
            onClick={handleGoToSettings}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none"
          >
            Ayarlara Git
          </button>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  );
};

export default RedirectModal;
