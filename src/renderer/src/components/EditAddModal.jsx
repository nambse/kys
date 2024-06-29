/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import '../assets/form.css';

function EditAddModal({ isOpen, onClose, onSubmit, isEditMode, initialData }) {
    const [formProjectName, setFormProjectName] = useState('');
    const [formProjectLocation, setFormProjectLocation] = useState('');
    const [formRaffleTimeout, setFormRaffleTimeout] = useState(1.0);
    const [formRaffleUserCount, setFormRaffleUserCount] = useState(0);

    useEffect(() => {
        if (isEditMode && initialData) {
            setFormProjectName(initialData.formProjectName || '');
            setFormProjectLocation(initialData.formProjectLocation || '');
            setFormRaffleTimeout(initialData.formRaffleTimeout || 1.0);
            setFormRaffleUserCount(initialData.formRaffleUserCount || 0);
        } else {
            resetForm();
        }
    }, [isEditMode, initialData, isOpen]);

    const resetForm = () => {
        setFormProjectName('');
        setFormProjectLocation('');
        setFormRaffleTimeout(1.0);
        setFormRaffleUserCount(0);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            formProjectName,
            formProjectLocation,
            formRaffleTimeout,
            formRaffleUserCount,
            success: true, // Indicate the operation was successful
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-xl w-1/3 max-w-4xl relative">
                <button onClick={onClose} className="absolute top-2 right-2 mt-2 mr-2 text-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h3 className="text-lg font-semibold mb-4 text-center">{isEditMode ? 'Proje Düzenle' : 'Yeni Proje Oluştur'}</h3>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="formProjectName" className="block text-sm font-medium text-gray-800">Proje Adı</label>
                        <input
                            type="text"
                            id="formProjectName"
                            value={formProjectName}
                            onChange={(e) => setFormProjectName(e.target.value)}
                            required
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="formProjectLocation" className="block text-sm font-medium text-gray-800">Proje Yeri</label>
                        <input
                            type="text"
                            id="formProjectLocation"
                            value={formProjectLocation}
                            onChange={(e) => setFormProjectLocation(e.target.value)}
                            required
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="formRaffleTimeout" className="block text-sm font-medium text-gray-800">Kura Çekme Süresi (saniye)</label>
                        <input
                            type="number"
                            id="formRaffleTimeout"
                            value={formRaffleTimeout}
                            onChange={(e) => setFormRaffleTimeout(e.target.value)}
                            step="0.1"
                            min="0.1"
                            required
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="formRaffleUserCount" className="block text-sm font-medium text-gray-800">Asil Sayısı</label>
                        <input
                            type="number"
                            id="formRaffleUserCount"
                            value={formRaffleUserCount}
                            onChange={(e) => setFormRaffleUserCount(e.target.value)}
                            step="1"
                            min="1"
                            required
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div className="flex justify-center mt-6">
                        <button type="submit" className="px-6 py-3 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none">
                            {isEditMode ? 'Kaydet' : 'Oluştur'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditAddModal;
