import { Fragment, useState, useEffect, useMemo, useRef } from 'react';
import { useTable, usePagination, useGlobalFilter, useSortBy } from 'react-table';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import tr from 'date-fns/locale/tr'; // Import the Turkish locale from date-fns
import { useDatabase } from '../context/DatabaseContext';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import EditAddModal from '../components/EditAddModal';
import BottomNav from '../components/BottomNav';
import AlertComponent from '../components/AlertComponent';

// Register the Turkish locale with react-datepicker
registerLocale('tr', tr);

// Custom filter UI for global filtering
const GlobalFilter = ({ globalFilter, setGlobalFilter, dateFilter, setDateFilter }) => {
  const [startDate, endDate] = dateFilter || [null, null];

  return (
    <div className="flex space-x-4 items-center">
      <input
        value={globalFilter || ''}
        onChange={e => setGlobalFilter(e.target.value || undefined)}
        placeholder={`Ara...`}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
      <DatePicker
        selected={startDate}
        onChange={(dates) => {
          const [start, end] = dates;
          setDateFilter([start, end]);
        }}
        startDate={startDate}
        endDate={endDate}
        selectsRange
        isClearable
        placeholderText="Tarihe Göre Filtrele"
        className="mt-1 block w-auto px-6 text-center py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm z-20"
        locale="tr" // Set the locale to Turkish
      />
    </div>
  );
};

function DatabasePage() {
  const { projectInfo, setProjectInfo, projects, setProjects } = useDatabase();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditAddModal, setShowEditAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [initialData, setInitialData] = useState({});
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [expandedRowIndex, setExpandedRowIndex] = useState(null);
  const [dateFilter, setDateFilter] = useState([null, null]);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [dropdownIndex, setDropdownIndex] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchProjects();
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, []);

  const fetchProjects = () => {
    window.electron.ipcRenderer.send('get-projects');
    window.electron.ipcRenderer.once('get-projects-response', (event, response) => {
      if (response.success) {
        setProjects(response.data);
      } else {
        console.error('Failed to fetch projects:', response.error);
      }
    });
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownIndex(null);
    }
  };

  const toggleProjectDetails = (projectId, rowIndex) => {
    if (expandedRowIndex === rowIndex) {
      setExpandedRowIndex(null);
      setProjectInfo(null);
    } else {
      fetchProjectDetails(projectId, rowIndex);
    }
  };

  const fetchProjectDetails = (projectId, rowIndex) => {
    window.electron.ipcRenderer.send('get-project-details', projectId);
    window.electron.ipcRenderer.once('get-project-details-response', (event, response) => {
      if (response.success) {
        console.log('Project Details Fetched:', response.projectInfo);
        setProjectInfo(response.projectInfo);
        setExpandedRowIndex(rowIndex);
      } else {
        console.error('Failed to fetch project details:', response.error);
      }
    });
  };

  const openEditModal = (project) => {
    setInitialData({
      formProjectName: project.projectName || '',
      formProjectLocation: project.projectLocation || '',
      formRaffleTimeout: project.raffleTimeout || 1.0,
      formRaffleUserCount: project.raffleUserCount || 0
    });
    setCurrentProjectId(project.id);
    setIsEditMode(true);
    setShowEditAddModal(true);
  };

  const openAddModal = () => {
    setInitialData({
      formProjectName: '',
      formProjectLocation: '',
      formRaffleTimeout: 1.0,
      formRaffleUserCount: 0
    });
    setCurrentProjectId(null);
    setIsEditMode(false);
    setShowEditAddModal(true);
  };

  const openDeleteModal = (projectId) => {
    setProjectToDelete(projectId);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    window.electron.ipcRenderer.send('delete-project', projectToDelete);
    window.electron.ipcRenderer.once('delete-project-response', (event, response) => {
      if (response.success) {
        setAlertMessage('Project deleted successfully');
        setShowAlert(true);
        fetchProjects();
      } else {
        setAlertMessage('Failed to delete project');
        setShowAlert(true);
      }
    });
    setShowDeleteModal(false);
  };

  const handleSubmitForm = (formData) => {
    const { formProjectName, formProjectLocation, formRaffleTimeout, formRaffleUserCount } = formData;

    const ipcMessage = isEditMode ? 'edit-project' : 'add-project';
    const requestData = { projectName: formProjectName, projectLocation: formProjectLocation, raffleTimeout: formRaffleTimeout, raffleUserCount: formRaffleUserCount };

    if (isEditMode) {
      requestData.id = currentProjectId;
    }

    window.electron.ipcRenderer.send(ipcMessage, requestData);
    window.electron.ipcRenderer.once(`${ipcMessage}-response`, (event, response) => {
      if (response.success) {
        setAlertMessage(response.message || 'Operation successful');
        setShowAlert(true);
        fetchProjects();
      } else {
        setAlertMessage(response.message || 'Operation failed');
        setShowAlert(true);
      }
    });

    setShowEditAddModal(false);
  };

  const columns = useMemo(() => [
    { Header: "Proje İsmi", accessor: "projectName" },
    { Header: "Tarih", accessor: "date" },
    { Header: "Durum", accessor: "status" },
    {
      Header: " ",
      Cell: ({ row }) => (
        <div className="relative text-end">
          <button onClick={(e) => { e.stopPropagation(); setDropdownIndex(dropdownIndex === row.index ? null : row.index); }} className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800 rounded focus:outline-none focus:ring focus:ring-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6h.01M12 12h.01M12 18h.01M12 6a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM12 12a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM12 18a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
            </svg>
          </button>
          {dropdownIndex === row.index && (
            <div ref={dropdownRef} className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
              <button onClick={(e) => { e.stopPropagation(); toggleProjectDetails(row.original.id, row.index); setDropdownIndex(null); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Detayları {expandedRowIndex === row.index ? "Gizle" : "Göster"}
              </button>
              <button onClick={(e) => { e.stopPropagation(); openEditModal(row.original); setDropdownIndex(null); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Düzenle
              </button>
              <button onClick={(e) => { e.stopPropagation(); openDeleteModal(row.original.id); setDropdownIndex(null); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Sil
              </button>
            </div>
          )}
        </div>
      ),
      disableSortBy: true,
    }
  ], [expandedRowIndex, dropdownIndex]);

  const filteredData = useMemo(() => {
    if (!dateFilter || !dateFilter[0] || !dateFilter[1]) return projects;
    const [start, end] = dateFilter;
    return projects.filter(project => {
      const projectDate = new Date(project.date);
      return projectDate >= start && projectDate <= end;
    });
  }, [projects, dateFilter]);

  const data = useMemo(() => filteredData.map(project => ({
    ...project,
    date: new Date(project.date).toLocaleDateString(),
    status: project.status ? "Aktif" : "Pasif"
  })), [filteredData]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
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
  } = useTable(
    { columns, data, initialState: { pageIndex: 0, pageSize: 10 } },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  return (
    <Fragment>
      <div className="flex justify-center items-center bg-gray-100 min-h-screen">
        <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-md h-[calc(100vh-100px)] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-700">Proje Bilgileri</h2>
            <button onClick={openAddModal} className="px-6 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded focus:outline-none focus:ring focus:ring-green-300">
              Proje Ekle
            </button>
          </div>
          <div className="mb-4">
            <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} dateFilter={dateFilter} setDateFilter={setDateFilter} />
          </div>
          <div className="flex-grow overflow-hidden">
            <div className="h-full overflow-auto">
              <table {...getTableProps()} className="min-w-full leading-normal shadow-md rounded-lg">
                <thead className="bg-gray-700 sticky top-0 z-0">
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
                      <Fragment key={row.original.id}>
                        <tr {...row.getRowProps()} className="hover:bg-gray-200 transition duration-300 ease-in-out" onClick={() => toggleProjectDetails(row.original.id, row.index)}>
                          {row.cells.map(cell => (
                            <td {...cell.getCellProps()} className="px-6 py-4 border-b border-gray-300 text-sm text-gray-800">
                              {cell.render('Cell')}
                            </td>
                          ))}
                        </tr>
                        {expandedRowIndex === row.index && projectInfo && (
                          <tr>
                            <td colSpan={columns.length} className="bg-gray-100">
                              <div className="p-4">
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">Proje Detayları</h3>
                                <div className="space-y-2">
                                  <div className="border-l-4 border-blue-500 pl-3">
                                    <p className="text-gray-800 text-md">Proje Adı: <span className="font-normal text-gray-600">{projectInfo?.projectName}</span></p>
                                  </div>
                                  <div className="border-l-4 border-green-500 pl-3">
                                    <p className="text-gray-800 text-md">Proje Yeri: <span className="font-normal text-gray-600">{projectInfo?.projectLocation}</span></p>
                                  </div>
                                  <div className="border-l-4 border-yellow-500 pl-3">
                                    <p className="text-gray-800 text-md">Kura Çekme Süresi (saniye): <span className="font-normal text-gray-600">{projectInfo?.raffleTimeout}</span></p>
                                  </div>
                                  <div className="border-l-4 border-red-500 pl-3">
                                    <p className="text-gray-800 text-md">Asil Sayısı: <span className="font-normal text-gray-600">{projectInfo?.raffleUserCount}</span></p>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
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
              onChange={e => setPageSize(Number(e.target.value))}
              className="border border-gray-300 rounded py-2 px-4 focus:outline-none focus:border-blue-500"
            >
              {[10, 20, 30, 40, 50].map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        page='proje'
      />

      <EditAddModal
        isOpen={showEditAddModal}
        onClose={() => setShowEditAddModal(false)}
        onSubmit={handleSubmitForm}
        isEditMode={isEditMode}
        initialData={initialData}
      />

      {showAlert && (
        <AlertComponent
          message={alertMessage}
          isVisible={showAlert}
          autoHideDuration={1500}
          backgroundColor="bg-green-500"
          textColor="text-white"
          padding="p-4"
          position="top"
          onHide={() => setShowAlert(false)}
        />
      )}

      <BottomNav checkIfDbSelected={Boolean(projectInfo?.id)} isItRafflePage={false} />
    </Fragment>
  );
}

export default DatabasePage;
