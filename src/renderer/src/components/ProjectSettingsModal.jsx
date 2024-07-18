import React from 'react';
import { FaTimes } from 'react-icons/fa';
import ProjectSettingsPage from '../pages/ProjectSettingsPage';

const ProjectSettingsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-auto">
        <div className="flex justify-end p-4">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes size={24} />
          </button>
        </div>
        <div className="p-4">
          <ProjectSettingsPage onClose={onClose} />
        </div>
      </div>
    </div>
  );
};

export default ProjectSettingsModal;
