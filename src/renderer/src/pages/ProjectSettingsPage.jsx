import React, { useState, useEffect, Fragment, useCallback } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { FaPlus, FaTrash } from 'react-icons/fa';
import AlertComponent from '../components/AlertComponent';
import Bubbles from '../components/ProjectSettingsPage/Bubbles';
import AttributesTable from '../components/ProjectSettingsPage/AttributesTable';
import { ReactSpreadsheetImport } from "react-spreadsheet-import";
import translations from '../translations/spreadsheetTranslations';
import ConfirmationModal from '../components/ProjectSettingsPage/ConfirmationModal';
import SidebarNav from '../components/SidebarNav';

const predefinedKatilimciAttributes = [
  { key: "sira_no", label: "SIRA NO" },
  { key: "ad_soyad", label: "AD SOYAD" },
  { key: "basvuru_no", label: "BAŞVURU NO" },
  { key: "asil_yedek", label: "ASİL YEDEK" },
  { key: "basvuru_kategorisi", label: "BAŞVURU KATEGORİSİ" },
  { key: "tc_kimlik_no", label: "TC KİMLİK NO" },
  { key: "il", label: "İL" },
  { key: "ilce", label: "İLÇE" },
  { key: "mahalle", label: "MAHALLE" },
  { key: "huid", label: "HUID" }
];

const predefinedKonutAttributes = [
  { key: "sira_no", label: "SIRA NO" },
  { key: "bb_no", label: "BB NO" },
  { key: "etap", label: "ETAP" },
  { key: "blok_no", label: "BLOK NO" },
  { key: "kat_no", label: "KAT NO" },
  { key: "daire_no", label: "DAİRE NO" },
  { key: "oda_sayisi", label: "ODA SAYISI" },
  { key: "brut", label: "BRÜT (m²)" }
];

const ProjectSettingsPage = ({ onClose }) => {
  const { projectInfo } = useDatabase();
  const [katilimciAttributes, setKatilimciAttributes] = useState([]);
  const [konutAttributes, setKonutAttributes] = useState([]);
  const [newKatilimciAttribute, setNewKatilimciAttribute] = useState('');
  const [newKonutAttribute, setNewKonutAttribute] = useState('');
  const [isKatilimciUpdating, setIsKatilimciUpdating] = useState(false);
  const [isKonutUpdating, setIsKonutUpdating] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('bg-red-500');
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [confirmType, setConfirmType] = useState('');

  useEffect(() => {
    fetchProjectSettings();
  }, [projectInfo.id]);

  const fetchProjectSettings = () => {
    window.electron.ipcRenderer.send('get-project-settings', projectInfo.id);
    window.electron.ipcRenderer.once('get-project-settings-response', (event, response) => {
      if (response.success && response.settings) {
        const { katilimciAttributes = [], konutAttributes = [] } = response.settings;
        setKatilimciAttributes(katilimciAttributes);
        setKonutAttributes(konutAttributes);
      } else {
        console.error(response.message);
        setKatilimciAttributes([]);
        setKonutAttributes([]);
      }
    });
  };

  const handleSaveKatilimciSettings = () => {
    if (isKatilimciUpdating) {
      setConfirmType('katilimci');
      setIsConfirmationModalOpen(true);
    } else {
      saveSettings('katilimciAttributes', katilimciAttributes, 'Katılımcı');
      checkAndCreateKatilimcilarTable(katilimciAttributes);
    }
  };

  const handleSaveKonutSettings = () => {
    if (isKonutUpdating) {
      setConfirmType('konut');
      setIsConfirmationModalOpen(true);
    } else {
      saveSettings('konutAttributes', konutAttributes, 'Konut');
    }
  };

  const handleConfirm = () => {
    setIsConfirmationModalOpen(false);
    if (confirmType === 'katilimci') {
      window.electron.ipcRenderer.send('delete-katilimci-table', projectInfo.id);
      saveSettings('katilimciAttributes', katilimciAttributes, 'Katılımcı');
      checkAndCreateKatilimcilarTable(katilimciAttributes);
    } else if (confirmType === 'konut') {
      window.electron.ipcRenderer.send('delete-konut-table', projectInfo.id);
      saveSettings('konutAttributes', konutAttributes, 'Konut');
    }
  };

  const handleCancel = () => {
    setIsConfirmationModalOpen(false);
  };

  const saveSettings = (type, attributes, typeName) => {
    const settings = { [type]: attributes };

    window.electron.ipcRenderer.send('get-project-settings', projectInfo.id);
    window.electron.ipcRenderer.once('get-project-settings-response', (event, response) => {
      if (response.success && response.settings) {
        const updatedSettings = { ...response.settings, ...settings };
        window.electron.ipcRenderer.send('save-project-settings', { projectId: projectInfo.id, settings: updatedSettings });
      } else {
        const initialSettings = { katilimciAttributes: [], konutAttributes: [] };
        initialSettings[type] = attributes;
        window.electron.ipcRenderer.send('save-project-settings', { projectId: projectInfo.id, settings: initialSettings });
      }

      window.electron.ipcRenderer.once('save-project-settings-response', (event, args) => {
        if (args.success) {
          setAlertMessage(`${typeName} ayarları başarıyla kaydedildi.`);
          setAlertType('bg-green-500');
          setShowAlert(true);
          if (type === 'katilimciAttributes') setIsKatilimciUpdating(false);
          if (type === 'konutAttributes') setIsKonutUpdating(false);
        } else {
          setAlertMessage(args.message);
          setAlertType('bg-red-500');
          setShowAlert(true);
        }
      });
    });
  };

  const handleAddAttribute = (attribute, setAttributes, attributes, setUpdating) => {
    if (attribute && !attributes.find(attr => attr.key === attribute.key)) {
      setAttributes([...attributes, attribute]);
      setUpdating(true);
    }
  };

  const handleRemoveAttribute = (attributeKey, setAttributes, attributes, setUpdating) => {
    const newAttributes = attributes.filter(attr => attr.key !== attributeKey);
    setAttributes(newAttributes);
    setUpdating(true);
  };

  const handleInputChange = (setter, value) => setter(value);

  const moveAttribute = useCallback((type, dragIndex, hoverIndex) => {
    if (type === 'katilimci') {
      setKatilimciAttributes((prevAttributes) => {
        const newAttributes = [...prevAttributes];
        const [reorderedItem] = newAttributes.splice(dragIndex, 1);
        newAttributes.splice(hoverIndex, 0, reorderedItem);
        return newAttributes;
      });
      setIsKatilimciUpdating(true);
    } else {
      setKonutAttributes((prevAttributes) => {
        const newAttributes = [...prevAttributes];
        const [reorderedItem] = newAttributes.splice(dragIndex, 1);
        newAttributes.splice(hoverIndex, 0, reorderedItem);
        return newAttributes;
      });
      setIsKonutUpdating(true);
    }
  }, []);

  const onCloseImportModal = () => {
    setIsOpen(false);
  };

  const onSubmit = (data) => {
    const validData = data.validData || [];
    sendAndSaveData(validData);
    setIsOpen(false);
  };

  const sendAndSaveData = (data) => {
    setIsLoading(true);
    window.electron.ipcRenderer.send('add-katilimcilar', { projectId: projectInfo.id, data });

    window.electron.ipcRenderer.once('add-katilimcilar-response', (event, args) => {
      if (args.success) {
        setAlertMessage('Veriler başarıyla kaydedildi.');
        setAlertType('bg-green-500');
        setShowAlert(true);
      } else {
        console.error(args.error);
        setAlertMessage('Veri kaydedilirken bir hata oluştu.');
        setAlertType('bg-red-500');
        setShowAlert(true);
      }
      setIsLoading(false);
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

  const fields = katilimciAttributes.map(attr => ({
    label: attr.label,
    key: attr.key,
    fieldType: { type: "input" },
    validations: [{ rule: "required", errorMessage: `${attr.label} is required` }]
  }));

  const availableKatilimciAttributes = predefinedKatilimciAttributes.filter(attr => !katilimciAttributes.find(a => a.key === attr.key));
  const availableKonutAttributes = predefinedKonutAttributes.filter(attr => !konutAttributes.find(a => a.key === attr.key));

  return (
    <Fragment>
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="p-8 bg-gray-50 min-h-screen max-w-7xl w-full">
          <h2 className="text-4xl font-bold text-gray-800 mb-8">{projectInfo.projectName} Kura Ayarları</h2>

          <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">Katılımcı Tablosu Başlıkları</h3>
            <Bubbles items={availableKatilimciAttributes.map(attr => attr.label)} onClick={(item) => handleAddAttribute(predefinedKatilimciAttributes.find(attr => attr.label === item), setKatilimciAttributes, katilimciAttributes, setIsKatilimciUpdating)} />
            <div className="flex items-center mb-4">
              <input
                type="text"
                value={newKatilimciAttribute}
                onChange={(e) => handleInputChange(setNewKatilimciAttribute, e.target.value)}
                placeholder="Yeni Başlık"
                className="border border-gray-300 rounded-md p-2 mr-2 w-1/4"
              />
              <button
                onClick={() => handleAddAttribute({ key: newKatilimciAttribute.replace(/\s+/g, '_').toLowerCase(), label: newKatilimciAttribute }, setKatilimciAttributes, katilimciAttributes, setIsKatilimciUpdating)}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                <FaPlus />
              </button>
            </div>
              <AttributesTable
              attributes={katilimciAttributes}
              onRemove={(attrKey) => handleRemoveAttribute(attrKey, setKatilimciAttributes, katilimciAttributes, setIsKatilimciUpdating)}
              moveAttribute={moveAttribute}
              type="katilimci"
              />
            <div className="flex space-x-4">
              <button
                onClick={handleSaveKatilimciSettings}
                className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-700 mt-4"
              >
                Katılımcı Ayarlarını Kaydet
              </button>
              <button
                onClick={() => setIsOpen(true)}
                className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-700 mt-4"
              >
                Otomatik Excel Yükleme
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">Konut Tablosu Başlıkları</h3>
            <Bubbles items={availableKonutAttributes.map(attr => attr.label)} onClick={(item) => handleAddAttribute(predefinedKonutAttributes.find(attr => attr.label === item), setKonutAttributes, konutAttributes, setIsKonutUpdating)} />
            <div className="flex items-center mb-4">
              <input
                type="text"
                value={newKonutAttribute}
                onChange={(e) => handleInputChange(setNewKonutAttribute, e.target.value)}
                placeholder="Yeni Başlık"
                className="border border-gray-300 rounded-md p-2 mr-2 w-1/4"
              />
              <button
                onClick={() => handleAddAttribute({ key: newKonutAttribute.replace(/\s+/g, '_').toLowerCase(), label: newKonutAttribute }, setKonutAttributes, konutAttributes, setIsKonutUpdating)}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                <FaPlus />
              </button>
            </div>
              <AttributesTable
                attributes={konutAttributes}
                onRemove={(attrKey) => handleRemoveAttribute(attrKey, setKonutAttributes, konutAttributes, setIsKonutUpdating)}
                moveAttribute={moveAttribute}
                type="konut"
              />
            <button
              onClick={handleSaveKonutSettings}
              className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-700 mt-4"
            >
              Konut Ayarlarını Kaydet
            </button>
          </div>

          {showAlert && (
            <AlertComponent
              message={alertMessage}
              isVisible={showAlert}
              autoHideDuration={1500}
              backgroundColor={alertType}
              textColor="text-white"
              padding="p-8"
              position="top"
              onHide={() => setShowAlert(false)}
            />
          )}

          <ConfirmationModal
            isOpen={isConfirmationModalOpen}
            title="Onayla"
            message="Bu işlem mevcut verileri silecektir. Devam etmek istiyor musunuz?"
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        </div>
        
        <ReactSpreadsheetImport
          isOpen={isOpen}
          onClose={onCloseImportModal}
          onSubmit={onSubmit}
          fields={fields}
          translations={translations}
        />
        
        <SidebarNav 
        checkIfDbSelected={projectInfo}
        selectedProject={projectInfo}
        />
      </div>
    </Fragment>
  );
}

export default ProjectSettingsPage;
