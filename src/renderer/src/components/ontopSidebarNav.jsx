import { useState, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDatabase } from '../context/DatabaseContext';
import { FaTimes } from 'react-icons/fa';
import { TbLayoutNavbarCollapse, TbLayoutBottombarCollapse } from "react-icons/tb";

import RedirectModal from './RedirectModal';

const AppLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-6 h-6 mr-3 -ml-1" viewBox="0 0 24 24">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zM11 18H8v-2h3v2zm0-4H8v-2h3v2zm0-4H8V8h3v2zm5 8h-3v-2h3v2zm0-4h-3v-2h3v2zm0-4h-3V8h3v2z"/>
  </svg>
);

function SidebarNav({ checkIfDbSelected = true, isItRafflePage = false }) {
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState('');
  const [redirectPath, setRedirectPath] = useState('');

  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  const { projectInfo, setProjectInfo } = useDatabase();
  const navigate = useNavigate();

  const handleClearProject = () => {
    setProjectInfo(null);
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

  return (
    <Fragment>
      <div className="fixed bottom-0 left-0 flex flex-col items-start z-10 p-4 space-y-2 transition-transform transform" style={{ transition: 'transform 0.3s ease-in-out' }}>
        <div className={`flex flex-col items-start ${isMenuVisible ? 'flex' : 'hidden'} space-y-2`}>
          <div className="w-full relative">
            <div className="bg-gray-800 text-white font-semibold py-2 px-4 rounded-t-lg text-center shadow-md flex items-center justify-center">
              <AppLogo />
              <div className="flex flex-col items-start">
                <span>Kura Yönetim</span>
                <span>Sistemi</span>
              </div>
            </div>
            {isMenuVisible && (
              <div className="absolute -top-5 left-0 w-full flex justify-center">
                <button
                  onClick={toggleMenu}
                  className="bg-gray-800 hover:bg-gray-700 text-white rounded-t-lg w-full py-1 flex justify-center items-center focus:outline-none"
                >
                  <TbLayoutBottombarCollapse size={18} />
                </button>
              </div>
            )}
          </div>
          <Link to="/" className="no-underline bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 w-full flex items-center shadow-md">
            📋 Proje Listesi
          </Link>
          <Link to="/takvim" className="no-underline bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 w-full flex items-center shadow-md">
            📆 Takvim
          </Link>
          {checkIfDbSelected && (
            <Fragment>
              {projectInfo && (
                <div className="w-full relative">
                  <div className="bg-gray-700 text-white font-semibold py-2 px-2 text-center shadow-md relative mt-2" style={{ maxWidth: '180px', wordWrap: 'break-word', whiteSpace: 'normal' }}>
                    <button 
                      onClick={handleClearProject} 
                      className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-gray-600 hover:bg-gray-500 text-white rounded-full p-1 focus:outline-none"
                    >
                      <FaTimes />
                    </button>
                    <span className="font-bold text-blue-400">Seçilen Proje:</span> <br /> {projectInfo?.projectName}
                  </div>
                  <div className="flex flex-col items-start bg-gray-600 text-white w-full rounded-b-lg shadow-md">
                    <Link to="/projeayarlari" className="no-underline hover:bg-gray-700 py-2 px-4 transition duration-300 w-full flex items-center">
                      🛠️ Kura Ayarları
                    </Link>
                    <button
                      onClick={() => checkKatilimcilarTable(projectInfo.id)}
                      className="no-underline hover:bg-gray-700 py-2 px-4 transition duration-300 w-full flex items-center"
                    >
                      👨‍👩‍👧‍👦 Katılımcılar
                    </button>
                    <button 
                      onClick={() => checkKonutlarTable(projectInfo.id)}
                      className="no-underline hover:bg-gray-700 py-2 px-4 transition duration-300 w-full flex items-center"
                    >
                      🏘️ Konutlar
                    </button>
                    <Link to="/raffle" className="no-underline hover:bg-gray-700 py-2 px-4 transition duration-300 w-full flex items-center rounded-b-lg">
                      🧮 Kura
                    </Link>
                  </div>
                </div>
              )}
            </Fragment>
          )}
        </div>
        {!isMenuVisible && (
          <button
            onClick={toggleMenu}
            className={`border-none bg-gray-700 text-white p-2 rounded-full hover:bg-gray-800 focus:outline-none mt-2 transition duration-300 shadow-md`}
          >
            <TbLayoutNavbarCollapse size={28} />
          </button>
        )}
        {
          /*    Alternative styling for the closed state

                {!isMenuVisible && (
                    <div className={`flex flex-col items-start ${!isMenuVisible ? 'flex' : 'hidden'} space-y-2`}>
                      <div className="w-full">
                        <div className="bg-gray-800 text-white font-semibold py-2 px-4 rounded-b-lg text-center shadow-md flex items-center justify-center relative">
                          <AppLogo />
                          <div className="flex flex-col items-start">
                            <span>Kura Yönetim</span>
                            <span>Sistemi</span>
                          </div>
                        {!isMenuVisible && (
                          <button
                            onClick={toggleMenu}
                            className="absolute top-1 right-0 transform translate-x-1/2 -translate-y-1/2 bg-gray-600 hover:bg-gray-700 text-white rounded-full p-1 focus:outline-none"
                          >
                  <TbLayoutNavbarCollapse size={18}/>
                </button>
              )}
          */
        }
      </div>
      <RedirectModal
        isOpen={showRedirectModal}
        onClose={() => setShowRedirectModal(false)}
        message={redirectMessage}
        redirectPath={redirectPath}
        delay={5000}
      />
    </Fragment>
  );
}

export default SidebarNav;
