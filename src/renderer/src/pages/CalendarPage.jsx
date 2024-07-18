import React, { useEffect, useState, useRef } from 'react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import trLocale from '@fullcalendar/core/locales/tr';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDatabase } from '../context/DatabaseContext';
import { FaArrowLeft, FaArrowRight, FaCalendarDay, FaCalendarWeek, FaCalendarAlt, FaChevronDown, FaTimes, FaEdit } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import RedirectModal from '../components/RedirectModal';
import SidebarNav from '../components/SidebarNav';
import EditAddModal from '../components/EditAddModal';
import AlertComponent from '../components/AlertComponent';

const CalendarPage = () => {
  const { projects, setProjects, projectInfo, setProjectInfo } = useDatabase();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('dayGridMonth');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [showEditAddModal, setShowEditAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const popupRef = useRef(null);
  const dropdownRef = useRef(null);
  const calendarRef = useRef(null);

  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState('');
  const [redirectPath, setRedirectPath] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const [initialData, setInitialData] = useState({
    formProjectName: '',
    formProjectLocation: '',
    formProjectOwner: '',
    formProjectBranch: '',
    formRaffleType: '',
    formRaffleCategory: '',
    formRaffleDate: '',
    formRaffleTime: '',
    formRaffleHouseCount: 0,
    formRaffleApplicantCount: 0,
    formRaffleTags: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const calendarEvents = projects.map(project => {
      const startDateTime = parseISO(`${project.raffleDate}T${project.raffleTime}`);
      return {
        title: project.projectName,
        start: startDateTime,
        extendedProps: {
          details: {
            projectName: project.projectName,
            raffleDate: project.raffleDate,
            raffleTime: project.raffleTime,
            id: project.id,
            location: project.projectLocation,
            owner: project.projectOwner,
            branch: project.projectBranch,
            type: project.raffleType,
            category: project.raffleCategory,
            houseCount: project.raffleHouseCount,
            applicantCount: project.raffleApplicantCount,
            tags: project.raffleTags,
          }
        }
      };
    });
    setEvents(calendarEvents);
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

  const fetchProjectDetails = (projectId) => {
    window.electron.ipcRenderer.send('get-project-details', projectId);
    window.electron.ipcRenderer.once('get-project-details-response', (event, response) => {
      if (response.success) {
        setProjectInfo(response.projectInfo);
      } else {
        console.error('Failed to fetch project details:', response.error);
      }
    });
  };

  const handleEventClick = (clickInfo) => {
    const { clientX, clientY } = clickInfo.jsEvent;
    const popupWidth = 600; // approximate width of the popup
    const screenWidth = window.innerWidth;
  
    // Determine if the click is too close to the right edge
    const isCloseToRightEdge = clientX + popupWidth > screenWidth;
  
    // Set popup position based on click position
    const leftPosition = isCloseToRightEdge ? clientX - popupWidth : clientX;
  
    setPopupPosition({ top: clientY, left: leftPosition });
    setSelectedEvent(clickInfo.event);
    fetchProjectDetails(clickInfo.event.extendedProps.details.id);
  };

  const handleDateClick = (info) => {
    const clickedDate = new Date(info.dateStr);
    setInitialData({
      formProjectName: '',
      formProjectLocation: '',
      formProjectOwner: '',
      formProjectBranch: '',
      formRaffleType: '',
      formRaffleCategory: '',
      formRaffleDate: clickedDate,
      formRaffleTime: '',
      formRaffleHouseCount: 0,
      formRaffleApplicantCount: 0,
      formRaffleTags: ''
    });
    setIsEditMode(false);
    setShowEditAddModal(true);
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

  const handlePrevClick = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.prev();
    setCurrentDate(calendarApi.getDate());
  };

  const handleNextClick = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.next();
    setCurrentDate(calendarApi.getDate());
  };

  const handleTodayClick = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.today();
    setCurrentDate(calendarApi.getDate());
  };

  const handleViewClick = (view) => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.changeView(view);
    setCurrentView(view);
    setDropdownOpen(false);
  };

  const handleDateChange = (date) => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.gotoDate(date);
    setCurrentDate(date);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const closePopup = () => {
    setSelectedEvent(null);
  };

  const handleClickOutside = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      closePopup();
    }
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
      requestData.id = projectInfo.id;
    }

    window.electron.ipcRenderer.send(ipcMessage, requestData);
    window.electron.ipcRenderer.once(`${ipcMessage}-response`, (event, response) => {
      if (response.success) {
        console.log(response)
        setAlertMessage(response.message || 'Operation successful');
        setShowAlert(true);
        fetchProjects();
        if (isEditMode && projectInfo && projectInfo.id === requestData.id) {
          setProjectInfo(response.project);
        }
      } else {
        setAlertMessage(response.message || 'Operation failed');
        setShowAlert(true);
      }
    });

    setShowEditAddModal(false);
  };

  const openEditModal = (project) => {
    setInitialData({
      formProjectName: project.projectName,
      formProjectLocation: project.location,
      formProjectOwner: project.owner,
      formProjectBranch: project.branch,
      formRaffleType: project.type,
      formRaffleCategory: project.category,
      formRaffleDate: project.raffleDate,
      formRaffleTime: project.raffleTime,
      formRaffleHouseCount: project.houseCount,
      formRaffleApplicantCount: project.applicantCount,
      formRaffleTags: project.tags
    });
    setIsEditMode(true);
    closePopup();
    setShowEditAddModal(true);
  };

  const renderCustomToolbar = () => {
    const viewOptions = [
      { view: 'dayGridMonth', label: 'Ay', icon: <FaCalendarAlt /> },
      { view: 'dayGridWeek', label: 'Hafta', icon: <FaCalendarWeek /> },
      { view: 'dayGridDay', label: 'Gün', icon: <FaCalendarDay /> },
    ];

    const currentViewOption = viewOptions.find(option => option.view === currentView);
    const otherViewOptions = viewOptions.filter(option => option.view !== currentView);

    const getDatePickerProps = () => {
      switch (currentView) {
        case 'dayGridDay':
          return {};
        case 'dayGridWeek':
          return { showWeekNumbers: true };
        case 'dayGridMonth':
          return { showMonthYearPicker: true };
        default:
          return {};
      }
    };

    return (
      <div className="grid grid-cols-3 items-center mb-6">
        <div className="flex justify-start items-center space-x-4 mb-4 md:mb-0">
          <button onClick={handlePrevClick} className="p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300">
            <FaArrowLeft />
          </button>
          <button onClick={handleNextClick} className="p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300">
            <FaArrowRight />
          </button>
          <button onClick={handleTodayClick} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none">
            Bugün
          </button>
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-700">Kura Takvimi</h2>
          <p className="text-gray-500">{format(currentDate, 'MMMM yyyy', { locale: tr })}</p>
        </div>
        <div className="flex justify-end items-center relative">
        <div className="relative z-10 mr-4">
            <DatePicker
              selected={currentDate}
              onChange={handleDateChange}
              className="ml-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 relative w-full text-center"
              dateFormat="dd.MM.yyyy"
              locale="tr"
              popperPlacement="bottom-end"
              popperClassName="z-50"
              {...getDatePickerProps()}
            />
          </div>
            <div ref={dropdownRef}>
              <button onClick={toggleDropdown} className="flex items-center p-2 rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300">
                {currentViewOption.icon} <span className="ml-2">{currentViewOption.label}</span> <FaChevronDown className="ml-2 mt-1" />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10" style={{ top: '100%' }}>
                  {otherViewOptions.map(option => (
                    <button
                      key={option.view}
                      onClick={() => handleViewClick(option.view)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      {option.icon} <span className="ml-2">{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
          </div>
        </div>
      </div>
    );
  };

  const renderEventContent = (eventInfo) => {
    const startTime = format(eventInfo.event.start, 'HH:mm', { locale: tr });
    const isDayView = currentView === 'dayGridDay';

    return (
      <div className={`${isDayView ? 'w-1/5' : 'w-4/5'} mx-auto p-2 bg-blue-600 text-white rounded-lg shadow-md transform transition-transform hover:scale-105 mt-2`}>
        <h3 className="text-sm font-semibold overflow-hidden">{eventInfo.event.title}</h3>
        <p className="text-xs">{startTime}</p>
      </div>
    );
  };

  return (
    <div className="h-screen bg-gray-100 flex justify-center items-center p-4">
      <div className="w-full max-w-7xl bg-white rounded-lg shadow-lg h-[90%]">
        <div className="p-6 h-full flex flex-col">
          {renderCustomToolbar()}
          <div className="flex-grow overflow-auto">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale={trLocale}
              events={events}
              eventClick={handleEventClick}
              headerToolbar={false}
              buttonText={{
                today: 'Bugün',
                month: 'Ay',
                week: 'Hafta',
                day: 'Gün',
              }}
              height="auto"
              contentHeight="auto"
              themeSystem="standard"
              eventContent={renderEventContent}
              dayMaxEvents={true}
              dateClick={handleDateClick} // Handle date click to open modal
              eventMouseEnter={(info) => {
                info.el.classList.add('bg-blue-700', 'text-white');
                info.el.style.transform = 'scale(1.05)';
                info.el.style.transition = 'transform 0.2s';
              }}
              eventMouseLeave={(info) => {
                info.el.classList.remove('bg-blue-700', 'text-white');
                info.el.style.transform = 'scale(1)';
              }}
              viewDidMount={(viewInfo) => {
                setCurrentView(viewInfo.view.type);
              }}
            />
          </div>
        </div>
      </div>
      {selectedEvent && (
        <div
          ref={popupRef}
          className="absolute bg-white p-4 rounded-lg shadow-lg"
          style={{ top: popupPosition.top, left: popupPosition.left, zIndex: 50, maxWidth: 600 }}
        >
          <button
            onClick={closePopup}
            className="absolute top-2 right-2 p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300"
          >
            <FaTimes />
          </button>
          <button
            onClick={() => openEditModal(selectedEvent.extendedProps.details)}
            className="absolute top-2 right-12 p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300"
          >
            <FaEdit />
          </button>
          <div className="p-4 bg-white shadow rounded-lg flex flex-col space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
              <span className="mr-2">📋</span>{selectedEvent.title} Kura Detayları
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="bg-green-100 p-2 rounded-lg flex items-center">
                <span className="mr-2 text-green-500">📍</span>
                <div>
                  <p className="text-xs text-green-700">Proje Yeri</p>
                  <p className="text-sm text-gray-800">{selectedEvent.extendedProps.details.location}</p>
                </div>
              </div>
              <div className="bg-purple-100 p-2 rounded-lg flex items-center">
                <span className="mr-2 text-purple-500">🏢</span>
                <div>
                  <p className="text-xs text-purple-700">Proje Şubesi</p>
                  <p className="text-sm text-gray-800">{selectedEvent.extendedProps.details.branch}</p>
                </div>
              </div>
              <div className="bg-yellow-100 p-2 rounded-lg flex items-center">
                <span className="mr-2 text-yellow-500">👷‍♂️</span>
                <div>
                  <p className="text-xs text-yellow-700">Proje Uzmanı</p>
                  <p className="text-sm text-gray-800">{selectedEvent.extendedProps.details.owner}</p>
                </div>
              </div>
              <div className="bg-red-100 p-2 rounded-lg flex items-center">
                <span className="mr-2 text-red-500">📂</span>
                <div>
                  <p className="text-xs text-red-700">Kura Kategorisi</p>
                  <p className="text-sm text-gray-800">{selectedEvent.extendedProps.details.category}</p>
                </div>
              </div>
              <div className="bg-purple-100 p-2 rounded-lg flex items-center">
                <span className="mr-2 text-purple-500">📅</span>
                <div>
                  <p className="text-xs text-purple-700">Kura Tarihi</p>
                  <p className="text-sm text-gray-800">{format(new Date(selectedEvent.start), 'dd-MM-yyyy')}</p>
                </div>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg flex items-center">
                <span className="mr-2 text-blue-500">⏰</span>
                <div>
                  <p className="text-xs text-blue-700">Kura Saati</p>
                  <p className="text-sm text-gray-800">{format(new Date(selectedEvent.start), 'HH:mm')}</p>
                </div>
              </div>
              <div className="bg-red-100 p-2 rounded-lg flex items-center">
                <span className="mr-2 text-red-500">🎫</span>
                <div>
                  <p className="text-xs text-red-700">Kura Türü</p>
                  <p className="text-sm text-gray-800">{selectedEvent.extendedProps.details.type}</p>
                </div>
              </div>
              <div className="bg-yellow-100 p-2 rounded-lg flex items-center">
                <span className="mr-2 text-yellow-500">🏠</span>
                <div>
                  <p className="text-xs text-yellow-700">Konut Sayısı</p>
                  <p className="text-sm text-gray-800">{selectedEvent.extendedProps.details.houseCount}</p>
                </div>
              </div>
              <div className="bg-green-100 p-2 rounded-lg flex items-center">
                <span className="mr-2 text-green-500">👥</span>
                <div>
                  <p className="text-xs text-green-700">Hak Sahibi Sayısı</p>
                  <p className="text-sm text-gray-800">{selectedEvent.extendedProps.details.applicantCount}</p>
                </div>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg flex items-center">
                <span className="mr-2 text-blue-500">🏷️</span>
                <div>
                  <p className="text-xs text-blue-700">Etiketler</p>
                  <p className="text-sm text-gray-800">{selectedEvent.extendedProps.details.tags}</p>
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
                onClick={() => checkKatilimcilarTable(selectedEvent.extendedProps.details.id)}
                className="flex items-center no-underline bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 mx-1 my-2"
              >
                Katılımcılar
                <span className="ml-2">👩🏻‍👨🏻‍👦🏻‍👧🏻</span>
              </button>
              <button
                onClick={() => checkKonutlarTable(selectedEvent.extendedProps.details.id)}
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
        </div>
      )}
      <RedirectModal
        isOpen={showRedirectModal}
        onClose={() => setShowRedirectModal(false)}
        message={redirectMessage}
        redirectPath={redirectPath}
        delay={5000}
      />
      <SidebarNav 
        selectedProject={projectInfo}
      />
      <EditAddModal
        isOpen={showEditAddModal}
        onClose={() => setShowEditAddModal(false)}
        onSubmit={handleSubmitForm}
        isEditMode={isEditMode}
        isCalendar={true}
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
    </div>
  );
};

export default CalendarPage;
