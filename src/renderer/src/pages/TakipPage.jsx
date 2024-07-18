import { useState, useEffect, Fragment } from 'react';
import Spreadsheet from 'react-spreadsheet';
import { format, getMonth, getYear } from 'date-fns';
import trLocale from 'date-fns/locale/tr';
import SidebarNav from '../components/SidebarNav';
import LoadingComponent from '../components/LoadingComponent';
import AlertComponent from '../components/AlertComponent';

const TakipPage = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertBackgroundColor, setAlertBackgroundColor] = useState('bg-green-500');
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchData();
    }, [currentMonth, currentYear]);

    const fetchData = () => {
        setIsLoading(true);
        window.electron.ipcRenderer.send('get-projects');
        window.electron.ipcRenderer.once('get-projects-response', (event, response) => {
            if (response.success) {
                const projects = response.data;
                const filteredData = projects.filter(project => {
                    const projectDate = new Date(project.raffleDate);
                    return getMonth(projectDate) === currentMonth && getYear(projectDate) === currentYear;
                });
                setData(transformDataToSpreadsheetFormat(filteredData));
                setIsLoading(false);
            } else {
                setAlertMessage('Veri yüklenirken bir hata oluştu.');
                setAlertBackgroundColor('bg-red-500');
                setShowAlert(true);
                setIsLoading(false);
            }
        });
    };

    const transformDataToSpreadsheetFormat = (projects) => {
        const columns = ["Tarih", "Uzman", "İl/İlçe", "Konut", "Başvuru", "Saat", "Liste", "Numaralandırma", "Kura", "Program", " ", " "];
        const rows = projects.map(project => [
            { value: format(new Date(project.raffleDate), 'dd.MM.yyyy', { locale: trLocale }) },
            { value: project.projectOwner || '' },
            { value: project.projectLocation || '' },
            { value: project.raffleHouseCount || '' },
            { value: project.raffleApplicantCount || '' },
            { value: project.raffleTime || '' },
            { value: project.list || '' },
            { value: project.numbering || '' },
            { value: project.raffleType || '' },
            { value: project.program || '' },
            { value: '' },
            { value: '' }
        ]);

        // Add 50 empty rows
        for (let i = 0; i < 50; i++) {
            rows.push(new Array(columns.length).fill({ value: '' }));
        }

        return [
            columns.map(col => ({ value: col, readOnly: true, className: 'bg-gray-200 font-bold text-center' })),
            ...rows
        ];
    };

    const handleMonthChange = (monthIndex) => {
        setCurrentMonth(monthIndex);
    };

    const handleSave = () => {
        // Logic for saving the data back to the backend
        setAlertMessage('Veriler başarıyla kaydedildi.');
        setAlertBackgroundColor('bg-green-500');
        setShowAlert(true);
    };

    const months = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];

    return (
        <div className="flex justify-center items-center bg-gray-100 min-h-screen">
            <div className="w-full max-w-7xl p-6 bg-white rounded-lg shadow-md h-[calc(100vh-100px)] flex flex-col">
                <h2 className="text-3xl font-semibold text-gray-800 mb-4 text-center">Kura Takip Tablosu</h2>
                {isLoading ? (
                    <LoadingComponent />
                ) : (
                    <Fragment>
                        <div className="overflow-x-auto overflow-y-auto border border-gray-300 rounded-lg shadow-md custom-hide-scrollbars" style={{ maxHeight: '78vh' }}>
                            <div className="min-w-full">
                                <Spreadsheet
                                    data={data}
                                    onChange={(newData) => setData(newData)}
                                    className="bg-white w-full"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={handleSave}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md shadow-md transition duration-300"
                            >
                                Kaydet
                            </button>
                        </div>
                    </Fragment>
                )}
                {showAlert && (
                    <AlertComponent
                        message={alertMessage}
                        isVisible={showAlert}
                        autoHideDuration={1500}
                        backgroundColor={alertBackgroundColor}
                        textColor="text-white"
                        padding="p-4"
                        position="top"
                        onHide={() => setShowAlert(false)}
                    />
                )}
                <div className="flex justify-center items-center mt-6">
                    {months.map((month, index) => (
                        <button
                            key={index}
                            onClick={() => handleMonthChange(index)}
                            className={`px-4 py-2 m-1 font-medium text-sm rounded-md shadow-md transition duration-300 ${currentMonth === index ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
                        >
                            {month}
                        </button>
                    ))}
                </div>
                <SidebarNav />
            </div>
        </div>
    );
};

export default TakipPage;
