// src/components/RedirectModal.jsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AiOutlineClose } from 'react-icons/ai';

const RedirectModal = ({ isOpen, onClose, message, redirectPath, delay }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (location.pathname === redirectPath) {
          onClose();
        } else {
          navigate(redirectPath);
        }
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, redirectPath, delay, navigate, location.pathname]);

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    if (location.pathname === redirectPath) {
      onClose();
    } else {
      navigate(redirectPath);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-80 max-w-sm">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <AiOutlineClose className="h-6 w-6" />
        </button>
        <div className="text-center">
          <p className="mb-4 text-gray-700 text-lg font-medium">{message}</p>
        </div>
        <div className="flex justify-center mt-4">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
};

export default RedirectModal;
