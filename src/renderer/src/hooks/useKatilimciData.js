import { useState, useEffect } from 'react';

export const useKatilimciData = (projectId) => {
  const [importedKatilimciData, setImportedKatilimciData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [attributes, setAttributes] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    fetchProjectSettings();
  }, []);

  const fetchProjectSettings = () => {
    window.electron.ipcRenderer.send('get-project-settings', projectId);
    window.electron.ipcRenderer.once('get-project-settings-response', (event, response) => {
      if (response.success && response.settings) {
        const katilimciAttributes = response.settings.katilimciAttributes || [];
        setAttributes(katilimciAttributes);
        createKatilimcilarTable(katilimciAttributes);
      } else {
        console.error(response.message);
      }
    });
  };

  const createKatilimcilarTable = (katilimciAttributes) => {
    window.electron.ipcRenderer.send('create-katilimcilar-table', { projectId, attributes: katilimciAttributes });
    window.electron.ipcRenderer.once('create-katilimcilar-table-response', (event, args) => {
      if (args.success) {
        fetchData();
      } else {
        console.error(args.message);
      }
    });
  };

  const fetchData = () => {
    setIsLoading(true);
    window.electron.ipcRenderer.send('get-katilimcilar', projectId);
    window.electron.ipcRenderer.once('get-katilimcilar-response', (event, response) => {
      if (response.success) {
        setImportedKatilimciData(response.data);
        setIsLoading(false);
      } else {
        console.error(response.error);
        setIsLoading(false);
      }
    });
  };

  const sendAndSaveData = (data) => {
    setIsLoading(true);
    window.electron.ipcRenderer.send('add-katilimcilar', { projectId, data });

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

  const handleDeleteData = () => {
    window.electron.ipcRenderer.send('delete-katilimcilar', projectId);

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
  };

  return {
    importedKatilimciData,
    isLoading,
    attributes,
    alertMessage,
    showAlert,
    setShowAlert,
    sendAndSaveData,
    handleDeleteData,
  };
};
