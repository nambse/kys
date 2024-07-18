import { Fragment, useState, useEffect, useMemo } from 'react';
import { useTable, usePagination, useGlobalFilter } from 'react-table';
import { useDatabase } from '../context/DatabaseContext';
import SidebarNav from "../components/SideBarNav";
import AlertComponent from '../components/AlertComponent';
import LoadingComponent from '../components/LoadingComponent';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import translations from '../translations/spreadsheetTranslations';
import { ReactSpreadsheetImport } from "react-spreadsheet-import";
import { FaEdit, FaSave } from 'react-icons/fa';

// Custom GlobalFilter component
const GlobalFilter = ({ globalFilter, setGlobalFilter }) => (
  <div className="flex justify-center mt-4">
    <input
      value={globalFilter || ''}
      onChange={e => setGlobalFilter(e.target.value || undefined)}
      placeholder="Search..."
      className="mt-1 block w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    />
  </div>
);

export default function KatilimciPage() {
  const { projectInfo } = useDatabase();
  const [importedKatilimciData, setImportedKatilimciData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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
    window.electron.ipcRenderer.send('add-katilimcilar', { projectId: projectInfo.id, data });

    window.electron.ipcRenderer.once('add-katilimcilar-response', (event, args) => {
      if (args.success) {
        setImportedKatilimciData(data);
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
    window.electron.ipcRenderer.send('delete-katilimcilar', projectInfo.id);

    window.electron.ipcRenderer.once('delete-katilimcilar-response', (event, args) => {
      if (args.success) {
        setImportedKatilimciData([]);
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

  useEffect(() => {
    fetchProjectSettings();
  }, []);

  const fetchProjectSettings = () => {
    window.electron.ipcRenderer.send('get-project-settings', projectInfo.id);
    window.electron.ipcRenderer.once('get-project-settings-response', (event, response) => {
      if (response.success && response.settings) {
        const katilimciAttributes = response.settings.katilimciAttributes || [];
        setAttributes(katilimciAttributes);
        checkAndCreateKatilimcilarTable(katilimciAttributes);
      } else {
        console.error(response.message);
      }
    });
  };

  const checkAndCreateKatilimcilarTable = (katilimciAttributes) => {
    window.electron.ipcRenderer.send('check-katilimcilar-table', { projectId: projectInfo.id });

    window.electron.ipcRenderer.once('check-katilimcilar-table-response', (event, args) => {
      if (!args.exists) {
        createKatilimcilarTable(katilimciAttributes);
      } else {
        fetchData();
      }
    });
  };

  const createKatilimcilarTable = (katilimciAttributes) => {
    const keys = katilimciAttributes.map(attr => attr.key);
    window.electron.ipcRenderer.send('create-katilimcilar-table', { projectId: projectInfo.id, attributes: keys });

    window.electron.ipcRenderer.once('create-katilimcilar-table-response', (event, args) => {
      if (args.success) {
        fetchData();
      } else {
        console.error(args);
      }
    });
  };

  const fetchData = () => {
    setIsLoading(true);
    window.electron.ipcRenderer.send('get-katilimcilar', projectInfo.id);
    window.electron.ipcRenderer.once('get-katilimcilar-response', (event, response) => {
      if (response.success) {
        setImportedKatilimciData(response.data);
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
      const row = importedKatilimciData[rowIndex];
      setEditValues(row);
      setEditingRowIndex(rowIndex);
    }
  };

  const handleInputChange = (e, columnId) => {
    setEditValues({ ...editValues, [columnId]: e.target.value });
  };

  const handleSaveEdit = (rowIndex) => {
    const updatedRow = { ...importedKatilimciData[rowIndex], ...editValues };

    // Ensure no empty fields
    const hasEmptyFields = Object.values(updatedRow).some(value => !value);

    if (hasEmptyFields) {
      setAlertMessage('Tüm alanlar doldurulmalıdır.');
      setShowAlert(true);
      return;
    }

    // Convert updatedRow to use keys before saving to the database
    const newRow = {};
    attributes.forEach(attr => {
      newRow[attr.key] = updatedRow[attr.label];
    });

    window.electron.ipcRenderer.send('update-katilimci-row', { projectId: projectInfo.id, updatedRow: newRow });

    window.electron.ipcRenderer.once('update-katilimci-row-response', (event, args) => {
      if (args.success) {
        const newData = [...importedKatilimciData];
        newData[rowIndex] = updatedRow;
        setImportedKatilimciData(newData);
        setEditingRowIndex(null);
        setAlertMessage('Veriler başarıyla güncellendi.');
        setShowAlert(true);
      } else {
        console.error(args.error);
        setAlertMessage('Veri güncellenirken bir hata oluştu.');
        setShowAlert(true);
      }
    });
  };

  const columns = useMemo(() => {
    const dynamicHeaders = attributes.map(attr => ({
      label: attr.label,
      key: attr.key
    }));
    const staticHeaders = [...dynamicHeaders, { label: " ", key: "edit" }];
    return staticHeaders.map(header => ({
      Header: header.label,
      accessor: header.key,
      Cell: ({ value, row, column }) => {
        if (column.id === 'edit') {
          return (
            <button
              onClick={() => handleEdit(row.index)}
              className="text-blue-500 hover:text-blue-700"
            >
              <FaEdit />
            </button>
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
    data: importedKatilimciData,
    initialState: { pageIndex: currentPageIndex, pageSize: currentPageSize },
  }, useGlobalFilter, usePagination);

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
    <div>
      <div className="flex justify-between mt-2 mx-6 font-medium text-gray-800 items-center">
        <div className="flex pt-4 items-center">
          <div
            className="p-4 border rounded-md cursor-pointer bg-green-600 hover:bg-green-700 text-white mx-2"
            onClick={() => setIsOpen(true)}
          >
            Otomatik Excel Yükleme
          </div>
        </div>
        <div className="flex-1 text-center">
          <h2 className="text-2xl font-semibold text-gray-900">{projectInfo.projectName} Katılımcı Tablosu</h2>
        </div>
        {importedKatilimciData.length > 0 && (
          <div className="flex justify-between items-center p-4 border border-dashed border-gray-800 rounded-md bg-gray-100 text-gray-700 hover:text-gray-900 mx-4">
            <div>
              <div>
                Toplam Katılımcı Sayısı: {importedKatilimciData.length}
              </div>
              <div>
                Veritabanı: {projectInfo.projectName}
              </div>
            </div>
            <button
              className="ml-8 p-2 border rounded-md bg-red-600 hover:bg-red-700 text-white"
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

      {importedKatilimciData.length > 0 && (
        <Fragment>
          <div className="my-4">
            <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
          </div>

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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 19l7-7-7-7"></path></svg>
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
        </Fragment>
      )}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteData}
        page='katilimci'
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
      <SidebarNav 
      checkIfDbSelected={projectInfo}
      selectedProject={projectInfo}
      />
    </div>
  );
}
