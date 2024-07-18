import React, { useState, useEffect, Fragment, useMemo, useRef } from 'react';
import { useTable, usePagination, useGlobalFilter, useSortBy } from 'react-table';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import tr from 'date-fns/locale/tr'; // Import the Turkish locale from date-fns
import { format } from 'date-fns';
import { useDatabase } from '../context/DatabaseContext';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import EditAddModal from '../components/EditAddModal';
import AlertComponent from '../components/AlertComponent';
import RedirectModal from '../components/RedirectModal';
import { Link, useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import trLocale from '@fullcalendar/core/locales/tr';
import SidebarNav from '../components/SideBarNav';

// Register the Turkish locale with react-datepicker
registerLocale('tr', tr);

const GlobalFilter = ({ globalFilter, setGlobalFilter, dateFilter, setDateFilter }) => {
  const [startDate, endDate] = dateFilter || [null, null];

  return (
    <div className="flex space-x-4 items-center mb-4">
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
        dateFormat="dd.MM.yyyy"
        className="mt-1 block w-auto px-6 text-center py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm z-20"
        locale="tr"
      />
    </div>
  );
};

function DashboardPage() {
  const { projectInfo, setProjectInfo, projects, setProjects } = useDatabase();
  const navigate = useNavigate();
  const calendarRef = useRef(null);

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
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState('');
  const [redirectPath, setRedirectPath] = useState('');
  const dropdownRef = useRef(null);

  const [currentView, setCurrentView] = useState('dayGridMonth');
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchProjects();
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, []);

  useEffect(() => {
    setEvents(
      projects.map((project) => ({
        title: project.projectName,
        start: project.raffleDate,
        id: project.id,
      }))
    );
  }, [projects]);

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
      formProjectOwner: project.projectOwner || '',
      formProjectBranch: project.projectBranch || 'Talep Örgütlenme Şubesi',
      formRaffleType: project.raffleType || '',
      formRaffleCategory: project.raffleCategory || '',
      formRaffleDate: project.raffleDate ? format(new Date(project.raffleDate), 'dd-MM-yyyy') : '',
      formRaffleTime: project.raffleTime || '',
      formRaffleHouseCount: project.raffleHouseCount || 0,
      formRaffleApplicantCount: project.raffleApplicantCount || 0,
      formRaffleTags: project.raffleTags || ''
    });
    setCurrentProjectId(project.id);
    setIsEditMode(true);
    setShowEditAddModal(true);
  };

  const openAddModal = () => {
    setInitialData({
      formProjectName: '',
      formProjectLocation: '',
      formProjectOwner: '',
      formProjectBranch: 'Talep Örgütlenme Şubesi',
      formRaffleType: '',
      formRaffleCategory: '',
      formRaffleDate: '',
      formRaffleTime: '',
      formRaffleHouseCount: 0,
      formRaffleApplicantCount: 0,
      formRaffleTags: ''
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
    const { formProjectName, formProjectLocation, formProjectOwner, formProjectBranch, formRaffleType, formRaffleCategory, formRaffleDate, formRaffleTime, formRaffleHouseCount, formRaffleApplicantCount, formRaffleTags } = formData;

    const ipcMessage = isEditMode ? 'edit-project' : 'add-project';
    const requestData = {
      projectName: formProjectName,
      projectLocation: formProjectLocation,
      projectOwner: formProjectOwner,
      projectBranch: formProjectBranch,
      raffleType: formRaffleType,
      raffleCategory: formRaffleCategory,
      raffleDate: formRaffleDate,
      raffleTime: formRaffleTime,
      raffleHouseCount: formRaffleHouseCount,
      raffleApplicantCount: formRaffleApplicantCount,
      raffleTags: formRaffleTags
    };

    if (isEditMode) {
      requestData.id = currentProjectId;
    }

    window.electron.ipcRenderer.send(ipcMessage, requestData);
    window.electron.ipcRenderer.once(`${ipcMessage}-response`, (event, response) => {
      if (response.success) {
        setAlertMessage(response.message || 'Operation successful');
        setShowAlert(true);
        fetchProjects();
        setProjectInfo(response.projectInfo); // Update project info with the edited information
      } else {
        setAlertMessage(response.message || 'Operation failed');
        setShowAlert(true);
      }
    });

    setShowEditAddModal(false);
  };

  const checkKatilimcilarTable = (projectId) => {
    window.electron.ipcRenderer.send('check-katilimcilar-table', { projectId });
    window.electron.ipcRenderer.once('check-katilimcilar-table-response', (event, response) => {
      if (response.success) {
        if (response.exists) {
          navigate('/katilimci');
        } else {
          setRedirectMessage('Katılımcılar tablosu oluşturulmadı. Proje ayarlarına yönlendiriliyorsunuz. Lütfen katılımcı tablosu başlıklarını belirleyin, daha sonrasında katılımcı bilgilerini yükleyin.');
          setRedirectPath('/projeayarlari');
          setShowRedirectModal(true);
        }
      } else {
        console.error('Failed to check katilimcilar table:', response.message);
      }
    });
  };

  const checkKonutlarTable = (projectId) => {
    window.electron.ipcRenderer.send('check-konutlar-table', { projectId });
    window.electron.ipcRenderer.once('check-konutlar-table-response', (event, response) => {
      if (response.success) {
        if (response.exists) {
          navigate('/konut');
        } else {
          setRedirectMessage('Konut tablosu oluşturulmadı. Proje ayarlarına yönlendiriliyorsunuz. Lütfen konut tablosu başlıklarını belirleyin, daha sonrasında konut bilgilerini yükleyin.');
          setRedirectPath('/projeayarlari');
          setShowRedirectModal(true);
        }
      } else {
        console.error('Failed to check konutlar table:', response.message);
      }
    });
  };

  const handleDateClick = (arg) => {
    setDateFilter([arg.date, arg.date]);
    if (calendarRef.current) {
      calendarRef.current.getApi().changeView('dayGridDay', arg.date);
    }
  };

  const handleEventClick = (arg) => {
    const project = projects.find((proj) => proj.id === arg.event.id);
    if (project) {
      toggleProjectDetails(project.id, projects.indexOf(project));
    }
  };

  const columns = useMemo(() => [
    { Header: "Proje İsmi", accessor: "projectName" },
    { Header: "Tarih", accessor: "raffleDate" },
    { Header: "Saat", accessor: "raffleTime" },
    { Header: "Durum", accessor: "status" },
    { Header: "Proje Şubesi", accessor: "projectBranch" },
    { Header: "Proje Uzmanı", accessor: "projectOwner" },
    {
      Header: " ",
      Cell: ({ row }) => {
        const isSelectedProject = projectInfo && projectInfo.id === row.original.id;
        return (
          <div className="relative text-end flex items-center justify-end space-x-2">
            <div className="mr-2 w-16">
              {isSelectedProject && (
                <span className="px-2 py-1 bg-green-200 text-green-800 text-xs font-semibold rounded">
                  Seçildi
                </span>
              )}
            </div>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                setDropdownIndex(dropdownIndex === row.index ? null : row.index); 
              }} 
              className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800 rounded focus:outline-none focus:ring focus:ring-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6h.01M12 12h.01M12 18h.01M12 6a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM12 12a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM12 18a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
              </svg>
            </button>
            {dropdownIndex === row.index && (
              <div ref={dropdownRef} className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    toggleProjectDetails(row.original.id, row.index); 
                    setDropdownIndex(null); 
                  }} 
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Detayları {expandedRowIndex === row.index ? "Gizle" : "Göster"}
                </button>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    openEditModal(row.original); 
                    setDropdownIndex(null); 
                  }} 
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Düzenle
                </button>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    openDeleteModal(row.original.id); 
                    setDropdownIndex(null); 
                  }} 
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sil
                </button>
              </div>
            )}
          </div>
        );
      },
      disableSortBy: true,
    }
  ], [projectInfo, expandedRowIndex, dropdownIndex]);

  const filteredData = useMemo(() => {
    if (!dateFilter || !dateFilter[0] || !dateFilter[1]) return projects;
    const [start, end] = dateFilter;
  
    return projects.filter(project => {
      const projectDate = new Date(project.raffleDate).setHours(0, 0, 0, 0);
      const startDate = new Date(start).setHours(0, 0, 0, 0);
      const endDate = new Date(end).setHours(0, 0, 0, 0);
  
      if (startDate === endDate) {
        return projectDate === startDate;
      }
  
      return projectDate >= startDate && projectDate <= endDate;
    });
  }, [projects, dateFilter]);

  const data = useMemo(() => filteredData.map(project => {
    const raffleDate = new Date(project.raffleDate);
    const raffleTime = project.raffleTime ? project.raffleTime.split(':') : [];
    const raffleDateTime = new Date(
      raffleDate.getFullYear(),
      raffleDate.getMonth(),
      raffleDate.getDate(),
      raffleTime[0] ? parseInt(raffleTime[0]) : 0,
      raffleTime[1] ? parseInt(raffleTime[1]) : 0
    );
    const today = new Date();
  
    return {
      ...project,
      raffleDate: format(raffleDate, 'dd.MM.yyyy'),
      status: raffleDateTime < today ? "Kura Çekildi" : "Kura Planlandı"
    };
  }), [filteredData]);

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
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 10 },
      globalFilter: (rows, columns, filterValue) => {
        if (!filterValue) return rows;
  
        return rows.filter(row => {
          const project = row.original;
  
          // Check each project detail for the filter value
          const details = [
            project.projectName,
            project.projectLocation,
            project.projectOwner,
            project.projectBranch,
            project.raffleType,
            project.raffleCategory,
            project.raffleDate,
            project.raffleTime,
            project.raffleHouseCount,
            project.raffleApplicantCount,
            project.raffleTags
          ];
  
          return details.some(detail => 
            String(detail).toLowerCase().includes(filterValue.toLowerCase())
          );
        });
      }
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  return (
    <Fragment>
      <div className="flex justify-center items-center bg-gray-100 min-h-screen">
        <div className="w-full max-w-5xl p-6 bg-white rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-700">Dashboard</h2>
            <button onClick={openAddModal} className="px-6 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded focus:outline-none focus:ring focus:ring-green-300">
              Proje Ekle
            </button>
          </div>
          
          <div className="mb-4">
            <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} dateFilter={dateFilter} setDateFilter={setDateFilter} />
          </div>

          <div className="mb-4">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView={currentView}
              locale={trLocale}
              events={events}
              ref={calendarRef}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,dayGridWeek,dayGridDay'
              }}
              height="auto"
              contentHeight={500}
            />
          </div>

          <div className="flex-grow overflow-hidden mt-6">
            <div className="h-full overflow-auto">
              <table {...getTableProps()} className="min-w-full leading-normal shadow-md rounded-lg">
                <thead className="bg-gray-700 sticky top-0 z-10">
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
                            <td colSpan={columns.length} className="bg-gray-100 rounded-lg">
                              <div className="p-4 bg-white shadow rounded-lg flex flex-col space-y-4">
                                <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
                                  <span className="mr-2">📋</span> Kura Detayları
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                  <div className="bg-green-100 p-2 rounded-lg flex items-center">
                                    <span className="mr-2 text-green-500">📍</span>
                                    <div>
                                      <p className="text-xs text-green-700">Proje Yeri</p>
                                      <p className="text-sm text-gray-800">{projectInfo?.projectLocation}</p>
                                    </div>
                                  </div>
                                  <div className="bg-purple-100 p-2 rounded-lg flex items-center">
                                    <span className="mr-2 text-purple-500">🏢</span>
                                    <div>
                                      <p className="text-xs text-purple-700">Proje Şubesi</p>
                                      <p className="text-sm text-gray-800">{projectInfo?.projectBranch}</p>
                                    </div>
                                  </div>
                                  <div className="bg-yellow-100 p-2 rounded-lg flex items-center">
                                    <span className="mr-2 text-yellow-500">👷‍♂️</span>
                                    <div>
                                      <p className="text-xs text-yellow-700">Proje Uzmanı</p>
                                      <p className="text-sm text-gray-800">{projectInfo?.projectOwner}</p>
                                    </div>
                                  </div>
                                  <div className="bg-purple-100 p-2 rounded-lg flex items-center">
                                    <span className="mr-2 text-purple-500">📂</span>
                                    <div>
                                      <p className="text-xs text-purple-700">Kura Kategorisi</p>
                                      <p className="text-sm text-gray-800">{projectInfo?.raffleCategory}</p>
                                    </div>
                                  </div>
                                  <div className="bg-red-100 p-2 rounded-lg flex items-center">
                                    <span className="mr-2 text-red-500">📅</span>
                                    <div>
                                      <p className="text-xs text-red-700">Kura Tarihi</p>
                                      <p className="text-sm text-gray-800">{format(new Date(projectInfo?.raffleDate), 'dd-MM-yyyy')}</p>
                                    </div>
                                  </div>
                                  <div className="bg-blue-100 p-2 rounded-lg flex items-center">
                                    <span className="mr-2 text-blue-500">⏰</span>
                                    <div>
                                      <p className="text-xs text-blue-700">Kura Saati</p>
                                      <p className="text-sm text-gray-800">{projectInfo?.raffleTime}</p>
                                    </div>
                                  </div>
                                  <div className="bg-red-100 p-2 rounded-lg flex items-center">
                                    <span className="mr-2 text-red-500">🎫</span>
                                    <div>
                                      <p className="text-xs text-red-700">Kura Türü</p>
                                      <p className="text-sm text-gray-800">{projectInfo?.raffleType}</p>
                                    </div>
                                  </div>
                                  <div className="bg-yellow-100 p-2 rounded-lg flex items-center">
                                    <span className="mr-2 text-yellow-500">🏠</span>
                                    <div>
                                      <p className="text-xs text-yellow-700">Konut Sayısı</p>
                                      <p className="text-sm text-gray-800">{projectInfo?.raffleHouseCount}</p>
                                    </div>
                                  </div>
                                  <div className="bg-green-100 p-2 rounded-lg flex items-center">
                                    <span className="mr-2 text-green-500">👥</span>
                                    <div>
                                      <p className="text-xs text-green-700">Hak Sahibi Sayısı</p>
                                      <p className="text-sm text-gray-800">{projectInfo?.raffleApplicantCount}</p>
                                    </div>
                                  </div>
                                  <div className="bg-blue-100 p-2 rounded-lg flex items-center">
                                    <span className="mr-2 text-blue-500">🏷️</span>
                                    <div>
                                      <p className="text-xs text-blue-700">Etiketler</p>
                                      <p className="text-sm text-gray-800">{projectInfo?.raffleTags}</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-4 flex flex-wrap justify-end">
                                  <Link
                                    to="/projeayarlari"
                                    className="flex items-center no-underline bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 mx-1 my-2"
                                  >
                                    Ayarlar
                                    <span className="ml-2">⚙️</span>
                                  </Link>
                                  <button
                                    onClick={() => checkKatilimcilarTable(projectInfo.id)}
                                    className="flex items-center no-underline bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 mx-1 my-2"
                                  >
                                    Katılımcılar
                                    <span className="ml-2">👩🏻‍👨🏻‍👦🏻‍👧🏻</span>
                                  </button>
                                  <button
                                    onClick={() => checkKonutlarTable(projectInfo.id)}
                                    className="flex items-center no-underline bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 mx-1 my-2"
                                  >
                                    Konutlar
                                    <span className="ml-2">🏘️</span>
                                  </button>
                                  <Link
                                    to="/raffle"
                                    className="flex items-center no-underline bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 mx-1 my-2"
                                  >
                                    Kura
                                    <span className="ml-2">🎰</span>
                                  </Link>
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
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 19l7-7-7-7"></path></svg>
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

      <RedirectModal
        isOpen={showRedirectModal}
        onClose={() => setShowRedirectModal(false)}
        message={redirectMessage}
        redirectPath={redirectPath}
        delay={5000}
      />

      <SidebarNav 
      checkIfDbSelected={projectInfo}
      selectedProject={projectInfo}
      />
    </Fragment>
  );
}

export default DashboardPage;
