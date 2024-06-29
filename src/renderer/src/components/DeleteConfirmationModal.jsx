/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */

function DeleteConfirmationModal({ isOpen, onClose, onConfirm, databaseToDelete, page }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
            <div className="bg-white p-5 rounded-lg shadow-xl">
                <h3 className="text-lg font-semibold">Silme Onayı</h3>
                {page === 'veritabani' && <p className="my-4">'{databaseToDelete}' veritabanını silmek istediğinizden emin misiniz?</p>}
                {page === 'katilimci' && <p className="my-4">'{databaseToDelete}' veritabanındaki tüm katılımcıları silmek istediğinizden emin misiniz?</p>}
                {page === 'konut' && <p className="my-4">'{databaseToDelete}' veritabanındaki tüm konutları silmek istediğinizden emin misiniz?</p>}
                <div className="flex justify-end space-x-4">
                    <button onClick={onClose} className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded">
                        İptal
                    </button>
                    <button onClick={onConfirm} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                        Sil
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeleteConfirmationModal;
