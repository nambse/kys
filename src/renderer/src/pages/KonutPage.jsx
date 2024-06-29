/* eslint-disable react/jsx-key */
import { ReactSpreadsheetImport } from "react-spreadsheet-import";
import { useState, useMemo, useEffect, useRef } from "react";
import { useTable, usePagination } from 'react-table';
import XLSX from 'xlsx';
import { useDatabase } from '../context/DatabaseContext';
import BottomNav from "../components/BottomNav";
import AlertComponent from '../components/AlertComponent';
import LoadingComponent from '../components/LoadingComponent';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import translations from '../translations/spreadsheetTranslations';

export default function KonutPage() {
    const { projectInfo } = useDatabase();
    const [importedKonutData, setImportedKonutData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [currentPageSize, setCurrentPageSize] = useState(100);

    const fileInputRef = useRef(null);

    const handleDivClick = () => {
        fileInputRef.current.click();
    };

    const onClose = () => {
        setIsOpen(false);
    };

    const sendAndSaveData = (data) => {
        setIsLoading(true);
        window.electron.ipcRenderer.send('add-konutlar', { projectId: projectInfo.id, data });

        window.electron.ipcRenderer.once('add-konutlar-response', (event, args) => {
            if (args.success) {
                setImportedKonutData(data);
                setIsLoading(false);
                setAlertMessage('Veriler başarıyla kaydedildi.');
                setShowAlert(true);
            } else {
                console.error(args.error);
                setIsLoading(false);
                setAlertMessage('Veri kaydedilirken bir hata oluştu.');
                setShowAlert(true);
            }
        });
    };

    const openDeleteModal = () => {
        setIsDeleteModalOpen(true);
    };

    const handleDeleteData = () => {
        window.electron.ipcRenderer.send('delete-konutlar', projectInfo.id);

        window.electron.ipcRenderer.once('delete-konutlar-response', (event, args) => {
            if (args.success) {
                setImportedKonutData([]);
                setAlertMessage('Tüm veriler başarıyla silindi.');
                setShowAlert(true);
            } else {
                console.error(args.error);
                setAlertMessage('Veriler silinirken bir hata oluştu.');
                setShowAlert(true);
            }
        });

        setIsDeleteModalOpen(false);
    };

    const onSubmit = (data) => {
        const validData = data.validData || [];
        sendAndSaveData(validData);
        setIsOpen(false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const binaryString = event.target.result;
            const workbook = XLSX.read(binaryString, { type: 'binary' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);
            const transformedData = data.map(item => ({
                konutSiraNo: item["SIRA NO"].toString(),
                bbNo: item["BB NO"].toString(),
                etap: item["ETAP"].toString(),
                blokNo: item["BLOK NO"].toString(),
                katNo: item["KAT NO"].toString(),
                daireNo: item["DAİRE NO"].toString(),
                odaSayisi: item["ODA SAYISI"].toString(),
                brüt: item["BRÜT (m²)"].toString(),
            }));
            sendAndSaveData(transformedData);
        };

        reader.readAsBinaryString(file);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        setIsLoading(true);
        window.electron.ipcRenderer.send('get-konutlar', projectInfo.id);
        window.electron.ipcRenderer.once('get-konutlar-response', (event, response) => {
            if (response.success) {
                setImportedKonutData(response.data);
                setIsLoading(false);
            } else {
                console.error(response.error);
                setIsLoading(false);
            }
        });
    };

    const staticHeaders = [
        { label: "SIRA NO", key: "konutSiraNo" },
        { label: "BB NO", key: "bbNo" },
        { label: "ETAP", key: "etap" },
        { label: "BLOK NO", key: "blokNo" },
        { label: "KAT NO", key: "katNo" },
        { label: "DAIRE NO", key: "daireNo" },
        { label: "ODA SAYISI", key: "odaSayisi" },
        { label: "BRÜT (m²)", key: "brüt" }
    ];

    const columns = useMemo(() => staticHeaders.map(header => ({
        Header: header.label,
        accessor: header.key
    })), []);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        page,
        prepareRow,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state: { pageIndex, pageSize },
    } = useTable({
        columns,
        data: importedKonutData,
        initialState: { pageIndex: currentPageIndex, pageSize: currentPageSize },
    }, usePagination);

    useEffect(() => {
        setCurrentPageIndex(pageIndex);
        setCurrentPageSize(pageSize);
    }, [pageIndex, pageSize]);

    const fields = [
        {
            label: "Sıra No",
            key: "konutSiraNo",
            fieldType: { type: "input" },
            validations: [{ rule: "required", errorMessage: "Sıra No is required" }]
        },
        {
            label: "BB No",
            key: "bbNo",
            fieldType: { type: "input" },
            validations: [{ rule: "required", errorMessage: "BB no is required" }]
        },
        {
            label: "Etap",
            key: "etap",
            fieldType: { type: "input" },
            validations: [{ rule: "required", errorMessage: "Etap is required" }]
        },
        {
            label: "Blok No",
            key: "blokNo",
            fieldType: { type: "input" },
            validations: [{ rule: "required", errorMessage: "Blok no is required" }]
        },
        {
            label: "Kat No",
            key: "katNo",
            fieldType: { type: "input" },
            validations: [{ rule: "required", errorMessage: "Kat no is required" }]
        },
        {
            label: "Daire No",
            key: "daireNo",
            fieldType: { type: "input" },
            validations: [{ rule: "required", errorMessage: "Daire no is required" }]
        },
        {
            label: "Oda Sayısı",
            key: "odaSayisi",
            fieldType: { type: "input" },
            validations: [{ rule: "required", errorMessage: "Oda sayısı is required" }]
        },
        {
            label: "Brüt (m²)",
            key: "brüt",
            fieldType: { type: "input" },
            validations: [{ rule: "required", errorMessage: "Brüt m² is required" }]
        }
    ];

    return (
        <div>
            <div className="flex justify-between mt-2 mx-6 font-medium text-gray-800 items-center">
                <div className="flex pt-4 items-center">
                    <div className="p-4 border rounded-md cursor-pointer  bg-green-600 hover:bg-green-700 text-white mx-2">
                        Örnek Excel
                    </div>
                    <div className="p-4 border rounded-md cursor-pointer bg-green-600 hover:bg-green-700 text-white mx-2" onClick={handleDivClick}>
                        <label htmlFor="file-upload" className="cursor-pointer" style={{ pointerEvents: 'none' }}>
                            Manuel Excel Yükleme
                        </label>
                        <input id="file-upload" type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileChange} ref={fileInputRef} />
                    </div>
                    <div
                        className="p-4 border rounded-md cursor-pointer  bg-green-600 hover:bg-green-700 text-white mx-2"
                        onClick={() => setIsOpen(true)}>
                        Otomatik Excel Yükleme
                    </div>
                </div>
                <div className="flex-1 text-center">
                    <h2 className="text-2xl font-semibold text-gray-900">{projectInfo.projectName} Konut Tablosu</h2>
                </div>
                {importedKonutData.length > 0 && (
                    <div className="flex justify-between items-center p-4 border border-dashed border-gray-800 rounded-md bg-gray-100 text-gray-700 hover:text-gray-900 mx-4">
                        <div>
                            <div>
                                Toplam Konut Sayısı: {importedKonutData.length}
                            </div>
                            <div>
                                Veritabanı: {projectInfo.projectName}
                            </div>
                        </div>
                        <button
                            className="ml-8 p-2 border rounded-md bg-red-600 hover:bg-red-700 text-white"
                            onClick={openDeleteModal}
                            title="Tüm verileri sil">
                            Verileri Sil
                        </button>
                    </div>
                )}
            </div>

            {isLoading && <LoadingComponent />}

            <ReactSpreadsheetImport
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={onSubmit}
                fields={fields}
                translations={translations}
            />

            {importedKonutData.length > 0 && (
                <div className="mt-4 mx-2 mb-20 overflow-auto" style={{ maxHeight: "78vh" }}>
                    <table {...getTableProps()} className="min-w-full leading-normal shadow-md rounded-lg overflow-x-auto">
                        <thead className="sticky top-0 bg-gray-700 z-10">
                            {headerGroups.map(headerGroup => (
                                <tr {...headerGroup.getHeaderGroupProps()}>
                                    {headerGroup.headers.map(column => (
                                        <th {...column.getHeaderProps()} className="px-6 py-3 border-b border-gray-500 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                            {column.render('Header')}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody {...getTableBodyProps()} className="bg-white">
                            {page.map((row, i) => {
                                prepareRow(row);
                                return (
                                    <tr {...row.getRowProps()} className={`${i % 2 === 0 ? 'bg-gray-100' : 'bg-white'} hover:bg-gray-200 transition duration-300 ease-in-out`}>
                                        {row.cells.map(cell => (
                                            <td {...cell.getCellProps()} className="px-6 py-4 border-b border-gray-300 text-sm text-gray-800">
                                                {cell.render('Cell')}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <div className="flex justify-center items-center my-4 space-x-1">
                        <button
                            onClick={() => gotoPage(0)}
                            disabled={!canPreviousPage}
                            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7"></path></svg>
                        </button>

                        <button
                            onClick={() => previousPage()}
                            disabled={!canPreviousPage}
                            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg>
                        </button>

                        <span className="px-3 py-2">
                            Sayfa {pageIndex + 1} / {pageOptions.length}
                        </span>

                        <button
                            onClick={() => nextPage()}
                            disabled={!canNextPage}
                            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path></svg>
                        </button>

                        <button
                            onClick={() => gotoPage(pageCount - 1)}
                            disabled={!canNextPage}
                            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 19l7-7-7-7"></path></svg>
                        </button>

                        <select
                            value={pageSize}
                            onChange={e => {
                                const newPageSize = Number(e.target.value);
                                setCurrentPageSize(newPageSize);
                                setPageSize(newPageSize);
                            }}
                            className="border border-gray-300 rounded py-2 px-4 focus:outline-none focus:border-blue-500"
                        >
                            {[10, 50, 100, 250, 1000].map(size => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteData}
                page='konut'
            />
            {showAlert && (
                <AlertComponent
                    message={alertMessage}
                    isVisible={showAlert}
                    autoHideDuration={1500}
                    backgroundColor="bg-red-500"
                    textColor="text-white"
                    padding="p-8"
                    position="top"
                    onHide={() => setShowAlert(false)}
                />
            )}
            <BottomNav isItRafflePage={false} />
        </div>
    );
}
