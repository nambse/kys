import { Fragment, useState, useEffect, useMemo } from 'react';
import { useTable, usePagination, useGlobalFilter, useSortBy } from 'react-table';
import { useDatabase } from '../context/DatabaseContext';
import SidebarNav from "../components/SidebarNav";
import AlertComponent from '../components/AlertComponent';
import LoadingComponent from '../components/LoadingComponent';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import translations from '../translations/spreadsheetTranslations';
import { ReactSpreadsheetImport } from "react-spreadsheet-import";
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import KatilimciMakarnaModal from '../components/KatilimciPage/KatilimciMakarnaModal';

// Custom GlobalFilter component
const GlobalFilter = ({ globalFilter, setGlobalFilter }) => (
  <div className="flex justify-center mt-4">
    <input
      value={globalFilter || ''}
      onChange={e => setGlobalFilter(e.target.value || undefined)}
      placeholder="Ara..."
      className="mt-1 block w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    />
  </div>
);

export default function KonutPage() {
  const { projectInfo } = useDatabase();
  const [importedKonutData, setImportedKonutData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertBackgroundColor, setAlertBackgroundColor] = useState('bg-green-500');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMakarnaModalOpen, setIsMakarnaModalOpen] = useState(false);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [dataReady, setDataReady] = useState(false);
  const [attributes, setAttributes] = useState([]);

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(100);

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
        setAlertBackgroundColor('bg-green-500')
        setShowAlert(true);
      } else {
        console.error(args.error);
        setIsLoading(false);
        setAlertMessage('Veri kaydedilirken bir hata oluştu.');
        setAlertBackgroundColor('bg-red-500')
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
        setAlertBackgroundColor('bg-green-500')
        setShowAlert(true);
      } else {
        console.error(args.error);
        setAlertMessage('Veriler silinirken bir hata oluştu.');
        setAlertBackgroundColor('bg-red-500')
        setShowAlert(true);
      }
    });

    setIsDeleteModalOpen(false);
  };

  const handleDeleteRow = (rowIndex) => {
    const row = importedKonutData[rowIndex];
    window.electron.ipcRenderer.send('delete-konut-row', { projectId: projectInfo.id, rowId: row.id });

    window.electron.ipcRenderer.once('delete-konut-row-response', (event, args) => {
      if (args.success) {
        const newData = importedKonutData.filter((_, index) => index !== rowIndex);
        setImportedKonutData(newData);
        setAlertMessage('Veri başarıyla silindi.');
        setAlertBackgroundColor('bg-green-500')
        setShowAlert(true);
      } else {
        console.error(args.error);
        setAlertMessage('Veri silinirken bir hata oluştu.');
        setAlertBackgroundColor('bg-red-500')
        setShowAlert(true);
      }
    });
  };

  const onSubmit = (data) => {
    const validData = data.validData || [];
    sendAndSaveData(validData);
    setIsOpen(false);
  };

  useEffect(() => {
    fetchProjectSettings();
  }, []);

  const fetchProjectSettings = () => {
    window.electron.ipcRenderer.send('get-project-settings', projectInfo.id);
    window.electron.ipcRenderer.once('get-project-settings-response', (event, response) => {
      if (response.success && response.settings) {
        const konutAttributes = response.settings.konutAttributes || [];
        setAttributes(konutAttributes);
        checkAndCreateKonutlarTable(konutAttributes);
      } else {
        console.error(response.message);
      }
    });
  };

  const checkAndCreateKonutlarTable = (konutAttributes) => {
    window.electron.ipcRenderer.send('check-konutlar-table', { projectId: projectInfo.id });

    window.electron.ipcRenderer.once('check-konutlar-table-response', (event, args) => {
      if (!args.exists) {
        createKonutlarTable(konutAttributes);
      } else {
        fetchData();
      }
    });
  };

  const createKonutlarTable = (konutAttributes) => {
    const keys = konutAttributes.map(attr => attr.key);
    window.electron.ipcRenderer.send('create-konutlar-table', { projectId: projectInfo.id, attributes: keys });

    window.electron.ipcRenderer.once('create-konutlar-table-response', (event, args) => {
      if (args.success) {
        fetchData();
      } else {
        console.error(args);
      }
    });
  };

  const fetchData = () => {
    setIsLoading(true);
    window.electron.ipcRenderer.send('get-konutlar', projectInfo.id);
    window.electron.ipcRenderer.once('get-konutlar-response', (event, response) => {
      if (response.success) {
        setImportedKonutData(response.data);
        setIsLoading(false);
        setDataReady(true);
      } else {
        console.error(response.error);
        setIsLoading(false);
      }
    });
  };

  const handleEdit = (rowIndex) => {
    if (editingRowIndex === rowIndex) {
      setEditingRowIndex(null);
    } else {
      const row = importedKonutData[rowIndex];
      setEditValues(row);
      setEditingRowIndex(rowIndex);
    }
  };

  const handleInputChange = (e, columnId) => {
    setEditValues({ ...editValues, [columnId]: e.target.value });
  };

  const handleSaveEdit = (rowIndex) => {
    const updatedRow = { ...importedKonutData[rowIndex], ...editValues };

    // Ensure no empty fields
    const hasEmptyFields = Object.values(updatedRow).some(value => !value);

    if (hasEmptyFields) {
      setAlertMessage('Tüm alanlar doldurulmalıdır.');
      setAlertBackgroundColor('bg-red-500')
      setShowAlert(true);
      return;
    }

    window.electron.ipcRenderer.send('update-konut-row', { projectId: projectInfo.id, updatedRow });

    window.electron.ipcRenderer.once('update-konut-row-response', (event, args) => {
      if (args.success) {
        const newData = [...importedKonutData];
        newData[rowIndex] = updatedRow;
        setImportedKonutData(newData);
        setEditingRowIndex(null);
        setAlertMessage('Veriler başarıyla güncellendi.');
        setAlertBackgroundColor('bg-green-500')
        setShowAlert(true);
      } else {
        console.error(args.error);
        setAlertMessage('Veri güncellenirken bir hata oluştu.');
        setAlertBackgroundColor('bg-red-500')
        setShowAlert(true);
      }
    });
  };

  const columns = useMemo(() => {
    const dynamicHeaders = attributes.map(attr => ({
      label: attr.label,
      key: attr.key,
      sortType: 'basic'
    }));
    const staticHeaders = [...dynamicHeaders, { label: " ", key: "edit", disableSortBy: true }];
    return staticHeaders.map(header => ({
      Header: header.label,
      accessor: header.key,
      disableSortBy: header.disableSortBy,
      Cell: ({ value, row, column }) => {
        if (column.id === 'edit') {
          return (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleEdit(row.index)}
                className="text-blue-500 hover:text-blue-700"
              >
                <FaEdit />
              </button>
              <button
                onClick={() => handleDeleteRow(row.index)}
                className="text-red-500 hover:text-red-700"
              >
                <FaTimes />
              </button>
            </div>
          );
        }
        return value;
      }
    }));
  }, [editingRowIndex, editValues, dataReady, attributes]);

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
    state: { pageIndex, pageSize, globalFilter },
    setGlobalFilter
  } = useTable({
    columns,
    data: importedKonutData,
    initialState: { pageIndex: currentPageIndex, pageSize: currentPageSize },
  }, useGlobalFilter, useSortBy, usePagination);

  useEffect(() => {
    setCurrentPageIndex(pageIndex);
    setCurrentPageSize(pageSize);
  }, [pageIndex, pageSize]);

  const fields = attributes.map(attr => ({
    label: attr.label,
    key: attr.key,
    fieldType: { type: "input" },
    validations: [{ rule: "required", errorMessage: `${attr.label} is required` }]
  }));

  return (
    <div className="flex justify-center items-center bg-gray-100 min-h-screen">
      <div className="w-full max-w-7xl p-6 bg-white rounded-lg shadow-md h-[calc(100vh-100px)] flex flex-col">
        <div className="grid grid-cols-3 items-center mx-6 font-medium text-gray-800">
          <div className="flex items-center align-middle">
           {importedKonutData.length > 0 ?  
              (<div
                className="p-4 border rounded-md cursor-pointer bg-green-600 hover:bg-green-700 text-white mx-2"
                onClick={() => setIsMakarnaModalOpen(true)}
               >
                Konut Makarna Hazırla
              </div>)
           : 
              (<div
                className="p-4 border rounded-md cursor-pointer bg-green-600 hover:bg-green-700 text-white mx-2"
                onClick={() => setIsOpen(true)}
               >
                Konut Yükleme
              </div>)
           }
          </div>
          <div className="flex-1 text-center">
            <h2 className="text-2xl font-semibold text-gray-900">{projectInfo.projectName} Konut Tablosu</h2>
          </div>
          {importedKonutData.length > 0 && (
            <div className="flex justify-self-end items-center p-4 border border-dashed border-gray-800 rounded-md bg-gray-100 text-gray-700 hover:text-gray-900 mx-2">
              <div>
                <div>
                  Toplam Kayıt: {importedKonutData.length}
                </div>
              { /*
               <div>
                  Proje: {projectInfo.projectName}
                </div>
               */ }
              </div>
              <button
                className="ml-6 p-2 border rounded-md bg-red-600 hover:bg-red-700 text-white"
                onClick={openDeleteModal}
                title="Tüm verileri sil"
              >
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
          <Fragment>
            <div>
              <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
            </div>
            {/* This is the line for adjusting the height of the table mb-8 */}
            <div className="mt-4 mx-2 overflow-auto" style={{ maxHeight: "78vh" }}>
              <table {...getTableProps()} className="min-w-full leading-normal shadow-md rounded-lg overflow-x-auto">
                <thead className="sticky top-0 bg-gray-700 z-10">
                  {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map(column => (
                        <th {...column.getHeaderProps(column.getSortByToggleProps())} className="px-6 py-3 border-b border-gray-500 text-left text-xs font-semibold text-white uppercase tracking-wider">
                          {column.render('Header')}
                          <span>
                            {column.isSorted
                              ? column.isSortedDesc
                                ? ' 🔽'
                                : ' 🔼'
                              : ''}
                          </span>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody {...getTableBodyProps()} className="bg-white">
                  {page.map((row, i) => {
                    prepareRow(row);
                    return (
                      <Fragment key={row.getRowProps().key}>
                        <tr className={`${i % 2 === 0 ? 'bg-gray-100' : 'bg-white'} hover:bg-gray-200 transition duration-300 ease-in-out`}>
                          {row.cells.map(cell => (
                            <td {...cell.getCellProps()} className="px-6 py-4 border-b border-gray-300 text-sm text-gray-800">
                              {cell.render('Cell')}
                            </td>
                          ))}
                        </tr>
                        {editingRowIndex === row.index && (
                          <tr className={`${i % 2 === 0 ? 'bg-gray-100' : 'bg-white'} transition duration-300 ease-in-out`}>
                            {row.cells.map(cell => (
                              <td key={cell.getCellProps().key} className="px-6 py-4 border-b border-gray-300 text-sm text-gray-800">
                                {cell.column.id === 'edit' ? (
                                    <button
                                      onClick={() => handleSaveEdit(row.index)}
                                      className="text-green-500 hover:text-green-700"
                                    >
                                      <FaSave />
                                    </button>
                                ) : (
                                  <input
                                    type="text"
                                    value={editValues[cell.column.id] || ''}
                                    onChange={(e) => handleInputChange(e, cell.column.id)}
                                    className="w-full px-2 py-1 border rounded"
                                  />
                                )}
                              </td>
                            ))}
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Fragment>
        )}
        {importedKonutData.length > 0 && (
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
            backgroundColor={alertBackgroundColor}
            textColor="text-white"
            padding="p-8"
            position="top"
            onHide={() => setShowAlert(false)}
          />
        )}
        <KatilimciMakarnaModal
          isOpen={isMakarnaModalOpen}
          onClose={() => setIsMakarnaModalOpen(false)}
          data={importedKonutData}
          attributes={attributes}
        />
        <SidebarNav 
          checkIfDbSelected={projectInfo}
          selectedProject={projectInfo}
        />
      </div>
    </div>
  );
}
