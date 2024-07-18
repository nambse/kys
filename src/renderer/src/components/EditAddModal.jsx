import { useState, useEffect } from 'react';
import '../assets/form.css';
import { format } from 'date-fns';

function EditAddModal({ isOpen, onClose, onSubmit, isEditMode, initialData, isCalendar = false }) {
    const [formProjectName, setFormProjectName] = useState('');
    const [formProjectLocation, setFormProjectLocation] = useState('');
    const [formProjectOwner, setFormProjectOwner] = useState('');
    const [formProjectBranch, setFormProjectBranch] = useState('Talep Örgütlenme Şubesi');
    const [formRaffleType, setFormRaffleType] = useState('Manuel');
    const [formRaffleCategory, setFormRaffleCategory] = useState('Hak Sahipliği Belirleme Kurası');
    const [formRaffleDate, setFormRaffleDate] = useState('');
    const [formRaffleTime, setFormRaffleTime] = useState('');
    const [formRaffleHouseCount, setFormRaffleHouseCount] = useState(0);
    const [formRaffleApplicantCount, setFormRaffleApplicantCount] = useState(0);
    const [formRaffleTags, setFormRaffleTags] = useState([]);
    const [newTag, setNewTag] = useState('');
    const predefinedTags = ['50.000 Konut', '100.000 Konut', '250.000 Konut'];
    const [availablePredefinedTags, setAvailablePredefinedTags] = useState(predefinedTags);

    useEffect(() => {
        if ((isEditMode && initialData) || (isCalendar && initialData)) {
            setFormProjectName(initialData.formProjectName || '');
            setFormProjectLocation(initialData.formProjectLocation || '');
            setFormProjectOwner(initialData.formProjectOwner || '');
            setFormProjectBranch(initialData.formProjectBranch || 'Talep Örgütlenme Şubesi');
            setFormRaffleType(initialData.formRaffleType || 'Manuel');
            setFormRaffleCategory(initialData.formRaffleCategory || 'Hak Sahipliği Belirleme Kurası');
            setFormRaffleDate(initialData.formRaffleDate ? format(new Date(initialData.formRaffleDate), 'yyyy-MM-dd') : '');
            setFormRaffleTime(initialData.formRaffleTime || '');
            setFormRaffleHouseCount(initialData.formRaffleHouseCount || 0);
            setFormRaffleApplicantCount(initialData.formRaffleApplicantCount || 0);
            setFormRaffleTags(initialData.formRaffleTags ? initialData.formRaffleTags.split(', ') : []);
        } else {
            resetForm();
        }
    }, [isEditMode, initialData, isOpen]);

    useEffect(() => {
        setAvailablePredefinedTags(predefinedTags.filter(tag => !formRaffleTags.includes(tag)));
    }, [formRaffleTags]);

    const resetForm = () => {
        setFormProjectName('');
        setFormProjectLocation('');
        setFormProjectOwner('');
        setFormProjectBranch('Talep Örgütlenme Şubesi');
        setFormRaffleType('Manuel');
        setFormRaffleCategory('Hak Sahipliği Belirleme Kurası');
        setFormRaffleDate('');
        setFormRaffleTime('');
        setFormRaffleHouseCount(0);
        setFormRaffleApplicantCount(0);
        setFormRaffleTags([]);
        setNewTag('');
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            formProjectName,
            formProjectLocation,
            formProjectOwner,
            formProjectBranch,
            formRaffleType,
            formRaffleCategory,
            formRaffleDate,
            formRaffleTime,
            formRaffleHouseCount,
            formRaffleApplicantCount,
            formRaffleTags: formRaffleTags.join(', '),
        });
        onClose();
    };

    const handleAddTag = () => {
        if (newTag && !formRaffleTags.includes(newTag)) {
            setFormRaffleTags([...formRaffleTags, newTag]);
            setNewTag('');
        }
    };

    const handleRemoveTag = (tag) => {
        setFormRaffleTags(formRaffleTags.filter(t => t !== tag));
    };

    const handlePredefinedTagClick = (tag) => {
        if (!formRaffleTags.includes(tag)) {
            setFormRaffleTags([...formRaffleTags, tag]);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-20">
            <div className="bg-white p-8 rounded-lg shadow-xl w-2/3 max-w-4xl relative">
                <button onClick={onClose} className="absolute top-2 right-2 mt-2 mr-2 text-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h3 className="text-lg font-semibold mb-4 text-center">{isEditMode ? 'Projeyi Düzenle' : 'Yeni Proje Oluştur'}</h3>
                <form onSubmit={handleFormSubmit} className="grid grid-cols-2 gap-4">
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
                        <label htmlFor="formProjectOwner" className="block text-sm font-medium text-gray-800">Proje Uzmanı</label>
                        <input
                            type="text"
                            id="formProjectOwner"
                            value={formProjectOwner}
                            onChange={(e) => setFormProjectOwner(e.target.value)}
                            required
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="formProjectBranch" className="block text-sm font-medium text-gray-800">Proje Şubesi</label>
                        <select
                            id="formProjectBranch"
                            value={formProjectBranch}
                            onChange={(e) => setFormProjectBranch(e.target.value)}
                            required
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                            <option value="Talep Örgütlenme Şubesi">Talep Örgütlenme Şubesi</option>
                            <option value="Pazarlama ve Satış Şubesi">Pazarlama ve Satış Şubesi</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="formRaffleType" className="block text-sm font-medium text-gray-800">Kura Türü</label>
                        <select
                            id="formRaffleType"
                            value={formRaffleType}
                            onChange={(e) => setFormRaffleType(e.target.value)}
                            required
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                            <option value="Manuel">Manuel</option>
                            <option value="Otomatik">Otomatik</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="formRaffleCategory" className="block text-sm font-medium text-gray-800">Kura Kategorisi</label>
                        <select
                            id="formRaffleCategory"
                            value={formRaffleCategory}
                            onChange={(e) => setFormRaffleCategory(e.target.value)}
                            required
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                            <option value="Hak Sahipliği Belirleme Kurası">Hak Sahipliği Belirleme Kurası</option>
                            <option value="Konut Belirleme Kurası">Konut Belirleme Kurası</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="formRaffleDate" className="block text-sm font-medium text-gray-800">Kura Tarihi</label>
                        <input
                            type="date"
                            id="formRaffleDate"
                            value={formRaffleDate}
                            onChange={(e) => setFormRaffleDate(e.target.value)}
                            required
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="formRaffleTime" className="block text-sm font-medium text-gray-800">Kura Saati</label>
                        <input
                            type="time"
                            id="formRaffleTime"
                            value={formRaffleTime}
                            onChange={(e) => setFormRaffleTime(e.target.value)}
                            required
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="formRaffleHouseCount" className="block text-sm font-medium text-gray-800">Konut Sayısı</label>
                        <input
                            type="number"
                            id="formRaffleHouseCount"
                            value={formRaffleHouseCount}
                            onChange={(e) => setFormRaffleHouseCount(e.target.value)}
                            step="1"
                            min="1"
                            required
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="formRaffleApplicantCount" className="block text-sm font-medium text-gray-800">Hak Sahibi Sayısı</label>
                        <input
                            type="number"
                            id="formRaffleApplicantCount"
                            value={formRaffleApplicantCount}
                            onChange={(e) => setFormRaffleApplicantCount(e.target.value)}
                            step="1"
                            min="1"
                            required
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div className="col-span-2">
                        <label htmlFor="formRaffleTags" className="block text-sm font-medium text-gray-800 mb-2">Etiketler</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {availablePredefinedTags.map((tag, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handlePredefinedTagClick(tag)}
                                    className="bg-blue-100 text-blue-800 rounded-full px-4 py-1 hover:bg-blue-200 focus:outline-none transition-colors duration-200"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                            <input
                                type="text"
                                id="newTag"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                className="mt-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500 w-1/3"
                                placeholder="Yeni Etiket"
                            />
                            <button type="button" onClick={handleAddTag} className="px-2.5 py-2 mt-1 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none">
                                Ekle
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formRaffleTags.map((tag, index) => (
                                <span key={index} className="bg-blue-500 text-white rounded-full px-3 py-1 flex items-center">
                                    {tag}
                                    <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-2 text-xs text-gray-200 hover:text-white focus:outline-none">
                                        &times;
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="col-span-2 flex justify-center mt-6">
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
