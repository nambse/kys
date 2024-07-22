import React, { useState, useEffect, Fragment } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { FaPlus, FaTrash, FaSave, FaFileExcel, FaUserFriends, FaHome, FaCog, FaTable, FaDice, FaEye } from 'react-icons/fa';
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

const defaultManuelKuraSettings = {
  layout: 'default',
  theme: {
    headerBgColor: '#2c3e50',
    headerTextColor: '#ecf0f1',
    rowEvenBgColor: '#f8f9fa',
    rowOddBgColor: '#e9ecef',
    textColor: '#2d3748',
    highlightColor: '#3498db',
    font: 'Roboto, sans-serif',
    cardBgColor: '#ffffff',
    cardBorderColor: '#e2e8f0',
    inputBorderColor: '#cbd5e0',
    inputFocusColor: '#3498db',
    buttonBgColor: '#3498db',
    buttonHoverColor: '#2980b9',
  },
  animations: {
    rowHover: true,
    cardHover: true,
    fadeIn: true,
  },
};

const ProjectSettingsPage = ({ onClose }) => {
  const { projectInfo } = useDatabase();
  const [activeTab, setActiveTab] = useState('katilimci');
  const [katilimciAttributes, setKatilimciAttributes] = useState([]);
  const [konutAttributes, setKonutAttributes] = useState([]);
  const [newKatilimciAttribute, setNewKatilimciAttribute] = useState('');
  const [newKonutAttribute, setNewKonutAttribute] = useState('');
  const [isKatilimciUpdating, setIsKatilimciUpdating] = useState(false);
  const [isKonutUpdating, setIsKonutUpdating] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('bg-red-500');
  const [isKatilimciImportOpen, setIsKatilimciImportOpen] = useState(false);
  const [isKonutImportOpen, setIsKonutImportOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [confirmType, setConfirmType] = useState('');
  const [manuelKuraSettings, setManuelKuraSettings] = useState(defaultManuelKuraSettings);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedKatilimciAttributes, setSelectedKatilimciAttributes] = useState([]);
  const [selectedKonutAttributes, setSelectedKonutAttributes] = useState([]);
  const [activeSettingsTab, setActiveSettingsTab] = useState('colors');

  useEffect(() => {
    fetchProjectSettings();
  }, [projectInfo.id]);

  const fetchProjectSettings = () => {
    window.electron.ipcRenderer.send('get-project-settings', projectInfo.id);
    window.electron.ipcRenderer.once('get-project-settings-response', (event, response) => {
      if (response.success && response.settings) {
        const { katilimciAttributes = [], konutAttributes = [], manuelKuraSettings = {} } = response.settings;
        setKatilimciAttributes(katilimciAttributes);
        setKonutAttributes(konutAttributes);
        setManuelKuraSettings({...defaultManuelKuraSettings, ...manuelKuraSettings});
        setSelectedKatilimciAttributes(manuelKuraSettings.selectedKatilimciAttributes || []);
        setSelectedKonutAttributes(manuelKuraSettings.selectedKonutAttributes || []);
      } else {
        console.error(response.message);
        setKatilimciAttributes([]);
        setKonutAttributes([]);
        setManuelKuraSettings(defaultManuelKuraSettings);
        setSelectedKatilimciAttributes([]);
        setSelectedKonutAttributes([]);
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
      checkAndCreateKonutlarTable(konutAttributes);
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
      checkAndCreateKonutlarTable(konutAttributes);
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

  const moveAttribute = (type, dragIndex, hoverIndex) => {
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
  };

  const onCloseImportModal = () => {
    setIsKatilimciImportOpen(false);
    setIsKonutImportOpen(false);
  };

  const onSubmitKatilimci = (data) => {
    const validData = data.validData || [];
    sendAndSaveKatilimciData(validData);
    setIsKatilimciImportOpen(false);
  };

  const onSubmitKonut = (data) => {
    const validData = data.validData || [];
    sendAndSaveKonutData(validData);
    setIsKonutImportOpen(false);
  };

  const sendAndSaveKatilimciData = (data) => {
    window.electron.ipcRenderer.send('add-katilimcilar', { projectId: projectInfo.id, data });

    window.electron.ipcRenderer.once('add-katilimcilar-response', (event, args) => {
      if (args.success) {
        setAlertMessage('Katılımcılar başarıyla kaydedildi.');
        setAlertType('bg-green-500');
        setShowAlert(true);
      } else {
        console.error(args.error);
        setAlertMessage('Katılımcı verisi kaydedilirken bir hata oluştu.');
        setAlertType('bg-red-500');
        setShowAlert(true);
      }
    });
  };

  const sendAndSaveKonutData = (data) => {
    window.electron.ipcRenderer.send('add-konutlar', { projectId: projectInfo.id, data });

    window.electron.ipcRenderer.once('add-konutlar-response', (event, args) => {
      if (args.success) {
        setAlertMessage('Konular başarıyla kaydedildi.');
        setAlertType('bg-green-500');
        setShowAlert(true);
      } else {
        console.error(args.error);
        setAlertMessage('Konut verisi kaydedilirken bir hata oluştu.');
        setAlertType('bg-red-500');
        setShowAlert(true);
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

  const checkAndCreateKonutlarTable = (konutAttributes) => {
    window.electron.ipcRenderer.send('check-konutlar-table', { projectId: projectInfo.id });

    window.electron.ipcRenderer.once('check-konutlar-table-response', (event, args) => {
      if (!args.exists) {
        createKonutlarTable(konutAttributes);
      }
    });
  };

  const createKonutlarTable = (konutAttributes) => {
    const keys = konutAttributes.map(attr => attr.key);
    console.log(keys)
    window.electron.ipcRenderer.send('create-konutlar-table', { projectId: projectInfo.id, attributes: keys });

    window.electron.ipcRenderer.once('create-konutlar-table-response', (event, args) => {
      if (args.success) {
        console.log('Konutlar table created successfully');
      } else {
        console.error(args);
      }
    });
  };

  const fieldsKatilimci = katilimciAttributes.map(attr => ({
    label: attr.label,
    key: attr.key,
    fieldType: { type: "input" },
    validations: [{ rule: "required", errorMessage: `${attr.label} is required` }]
  }));

  const fieldsKonut = konutAttributes.map(attr => ({
    label: attr.label,
    key: attr.key,
    fieldType: { type: "input" },
    validations: [{ rule: "required", errorMessage: `${attr.label} is required` }]
  }));

  const availableKatilimciAttributes = predefinedKatilimciAttributes.filter(attr => !katilimciAttributes.find(a => a.key === attr.key));
  const availableKonutAttributes = predefinedKonutAttributes.filter(attr => !konutAttributes.find(a => a.key === attr.key));

  const handleManuelKuraSettingsChange = (field, value) => {
    setManuelKuraSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleThemeChange = (key, value) => {
    setManuelKuraSettings(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        [key]: value
      }
    }));
  };

  const handleAnimationChange = (key, value) => {
    setManuelKuraSettings(prev => ({
      ...prev,
      animations: {
        ...prev.animations,
        [key]: value
      }
    }));
  };

  const handleAttributeSelection = (type, attribute) => {
    if (type === 'katilimci') {
      setSelectedKatilimciAttributes(prev => 
        prev.includes(attribute) ? prev.filter(a => a !== attribute) : [...prev, attribute]
      );
    } else {
      setSelectedKonutAttributes(prev => 
        prev.includes(attribute) ? prev.filter(a => a !== attribute) : [...prev, attribute]
      );
    }
  };

  const renderAttributeSelection = (type, attributes, selectedAttributes) => (
    <div className="mb-4">
      <h4 className="text-lg font-medium text-gray-700 mb-2">
        {type === 'katilimci' ? 'Katılımcı Özellikleri' : 'Konut Özellikleri'}
      </h4>
      {attributes.length === 0 ? (
        <p className="text-gray-500 italic">Henüz özellik eklenmemiş.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {attributes.map(attr => (
            <label key={attr.key} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedAttributes.includes(attr.key)}
                onChange={() => handleAttributeSelection(type, attr.key)}
                className="form-checkbox h-4 w-4 text-indigo-600"
              />
              <span>{attr.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );

  const renderPreview = () => {
    const commonStyles = {
      fontFamily: manuelKuraSettings.theme.font,
      color: manuelKuraSettings.theme.textColor,
    };

    const headerStyle = {
      backgroundColor: manuelKuraSettings.theme.headerBgColor,
      color: manuelKuraSettings.theme.headerTextColor,
      padding: '1rem',
    };

    const buttonStyle = {
      backgroundColor: manuelKuraSettings.theme.buttonBgColor,
      color: manuelKuraSettings.theme.headerTextColor,
      padding: '0.5rem 1rem',
      borderRadius: '0.25rem',
    };

    const inputStyle = {
      border: `1px solid ${manuelKuraSettings.theme.inputBorderColor}`,
      borderRadius: '0.25rem',
      padding: '0.25rem 0.5rem',
    };

    const cardStyle = {
      backgroundColor: manuelKuraSettings.theme.cardBgColor,
      border: `1px solid ${manuelKuraSettings.theme.cardBorderColor}`,
      borderRadius: '0.25rem',
      padding: '0.5rem',
      marginTop: '0.5rem',
    };

    const renderDefaultView = () => (
      <div className="border rounded p-4" style={commonStyles}>
        <div style={headerStyle}>
          <h2>Örnek Proje Manuel Kura Çekimi</h2>
        </div>
        <table className="w-full mt-4">
          <thead>
            <tr style={{backgroundColor: manuelKuraSettings.theme.rowEvenBgColor}}>
              <th className="p-2">Katılımcı Sıra No</th>
              <th className="p-2">Konut Sıra No</th>
              <th className="p-2">Katılımcı Bilgileri</th>
              <th className="p-2">Konut Bilgileri</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{backgroundColor: manuelKuraSettings.theme.rowOddBgColor}}>
              <td className="p-2"><input style={inputStyle} placeholder="1" /></td>
              <td className="p-2"><input style={inputStyle} placeholder="1" /></td>
              <td className="p-2">
                <div style={cardStyle}>
                  {selectedKatilimciAttributes.length === 0 ? (
                    <p className="italic text-gray-500">Özellik seçilmedi</p>
                  ) : (
                    selectedKatilimciAttributes.map(attrKey => {
                      const attr = katilimciAttributes.find(a => a.key === attrKey);
                      return <p key={attrKey}><strong>{attr ? attr.label : attrKey}:</strong> Örnek Değer</p>;
                    })
                  )}
                </div>
              </td>
              <td className="p-2">
                <div style={cardStyle}>
                  {selectedKonutAttributes.length === 0 ? (
                    <p className="italic text-gray-500">Özellik seçilmedi</p>
                  ) : (
                    selectedKonutAttributes.map(attrKey => {
                      const attr = konutAttributes.find(a => a.key === attrKey);
                      return <p key={attrKey}><strong>{attr ? attr.label : attrKey}:</strong> Örnek Değer</p>;
                    })
                  )}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );

    const renderExpandedView = () => (
      <div className="border rounded p-4" style={commonStyles}>
        <div style={headerStyle}>
          <h2>Örnek Proje Manuel Kura Çekimi</h2>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <input style={inputStyle} placeholder="Katılımcı Sıra No" className="w-full mb-2" />
            <div style={cardStyle}>
              <h3 className="font-bold">Katılımcı Bilgileri</h3>
              {selectedKatilimciAttributes.length === 0 ? (
                <p className="italic text-gray-500">Özellik seçilmedi</p>
              ) : (
                selectedKatilimciAttributes.map(attrKey => {
                  const attr = katilimciAttributes.find(a => a.key === attrKey);
                  return <p key={attrKey}><strong>{attr ? attr.label : attrKey}:</strong> Örnek Değer</p>;
                })
              )}
            </div>
          </div>
          <div>
            <input style={inputStyle} placeholder="Konut Sıra No" className="w-full mb-2" />
            <div style={cardStyle}>
              <h3 className="font-bold">Konut Bilgileri</h3>
              {selectedKonutAttributes.length === 0 ? (
                <p className="italic text-gray-500">Özellik seçilmedi</p>
              ) : (
                selectedKonutAttributes.map(attrKey => {
                  const attr = konutAttributes.find(a => a.key === attrKey);
                  return <p key={attrKey}><strong>{attr ? attr.label : attrKey}:</strong> Örnek Değer</p>;
                })
              )}
            </div>
          </div>
        </div>
      </div>
    );

    const renderTabularView = () => (
      <div className="border rounded p-4" style={commonStyles}>
        <div style={headerStyle}>
          <h2>Örnek Proje Manuel Kura Çekimi</h2>
        </div>
        <table className="w-full mt-4 text-sm">
          <thead>
            <tr style={{backgroundColor: manuelKuraSettings.theme.rowEvenBgColor}}>
              <th className="p-1">Katılımcı Sıra No</th>
              <th className="p-1">Konut Sıra No</th>
              {selectedKatilimciAttributes.map(attrKey => {
                const attr = katilimciAttributes.find(a => a.key === attrKey);
                return <th key={attrKey} className="p-1">{attr ? attr.label : attrKey}</th>;
              })}
              {selectedKonutAttributes.map(attrKey => {
                const attr = konutAttributes.find(a => a.key === attrKey);
                return <th key={attrKey} className="p-1">{attr ? attr.label : attrKey}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            <tr style={{backgroundColor: manuelKuraSettings.theme.rowOddBgColor}}>
              <td className="p-1"><input style={inputStyle} placeholder="1" className="w-full" /></td>
              <td className="p-1"><input style={inputStyle} placeholder="1" className="w-full" /></td>
              {selectedKatilimciAttributes.map(attrKey => (
                <td key={attrKey} className="p-1">Örnek Değer</td>
              ))}
              {selectedKonutAttributes.map(attrKey => (
                <td key={attrKey} className="p-1">Örnek Değer</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );

    return (
      <div>
        {manuelKuraSettings.layout === 'default' && renderDefaultView()}
        {manuelKuraSettings.layout === 'expanded' && renderExpandedView()}
        {manuelKuraSettings.layout === 'tabular' && renderTabularView()}
      </div>
    );
  };

  const renderKatilimciTab = () => (
    <div className="bg-white rounded-lg shadow-md mb-8 border border-gray-200">
      <div className="border-b border-gray-200 p-4 bg-blue-50">
        <h3 className="text-xl font-semibold text-gray-700 flex items-center">
          <FaUserFriends className="mr-2 text-blue-600" />
          Katılımcı Tablosu Başlıkları
        </h3>
      </div>
      <div className="p-6">
        <Bubbles items={availableKatilimciAttributes.map(attr => attr.label)} onClick={(item) => handleAddAttribute(predefinedKatilimciAttributes.find(attr => attr.label === item), setKatilimciAttributes, katilimciAttributes, setIsKatilimciUpdating)} />
        <div className="flex items-center mt-4 mb-4">
          <input
            type="text"
            value={newKatilimciAttribute}
            onChange={(e) => handleInputChange(setNewKatilimciAttribute, e.target.value)}
            placeholder="Yeni Başlık"
            className="border border-gray-300 rounded-md p-2 mr-2 w-1/4"
          />
          <button
            onClick={() => handleAddAttribute({ key: newKatilimciAttribute.replace(/\s+/g, '_').toLowerCase(), label: newKatilimciAttribute }, setKatilimciAttributes, katilimciAttributes, setIsKatilimciUpdating)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-300 flex items-center"
          >
            <FaPlus className="mr-2" /> Ekle
          </button>
        </div>
        <AttributesTable
          attributes={katilimciAttributes}
          onRemove={(attrKey) => handleRemoveAttribute(attrKey, setKatilimciAttributes, katilimciAttributes, setIsKatilimciUpdating)}
          moveAttribute={moveAttribute}
          type="katilimci"
        />
        <div className="flex space-x-4 mt-4">
          <button
            onClick={handleSaveKatilimciSettings}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors duration-300 flex items-center"
          >
            <FaSave className="mr-2" /> Katılımcı Ayarlarını Kaydet
          </button>
          <button
            onClick={() => setIsKatilimciImportOpen(true)}
            className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition-colors duration-300 flex items-center"
          >
            <FaFileExcel className="mr-2" /> Otomatik Excel Yükleme
          </button>
        </div>
      </div>
    </div>
  );

  const renderKonutTab = () => (
    <div className="bg-white rounded-lg shadow-md mb-8 border border-gray-200">
      <div className="border-b border-gray-200 p-4 bg-green-50">
        <h3 className="text-xl font-semibold text-gray-700 flex items-center">
          <FaHome className="mr-2 text-green-600" />
          Konut Tablosu Başlıkları
        </h3>
      </div>
      <div className="p-6">
        <Bubbles items={availableKonutAttributes.map(attr => attr.label)} onClick={(item) => handleAddAttribute(predefinedKonutAttributes.find(attr => attr.label === item), setKonutAttributes, konutAttributes, setIsKonutUpdating)} />
        <div className="flex items-center mt-4 mb-4">
          <input
            type="text"
            value={newKonutAttribute}
            onChange={(e) => handleInputChange(setNewKonutAttribute, e.target.value)}
            placeholder="Yeni Başlık"
            className="border border-gray-300 rounded-md p-2 mr-2 w-1/4"
          />
          <button
            onClick={() => handleAddAttribute({ key: newKonutAttribute.replace(/\s+/g, '_').toLowerCase(), label: newKonutAttribute }, setKonutAttributes, konutAttributes, setIsKonutUpdating)}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-300 flex items-center"
          >
            <FaPlus className="mr-2" /> Ekle
          </button>
        </div>
        <AttributesTable
          attributes={konutAttributes}
          onRemove={(attrKey) => handleRemoveAttribute(attrKey, setKonutAttributes, konutAttributes, setIsKonutUpdating)}
          moveAttribute={moveAttribute}
          type="konut"
        />
        <div className="flex space-x-4 mt-4">
          <button
            onClick={handleSaveKonutSettings}
            className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors duration-300 flex items-center"
          >
            <FaSave className="mr-2" /> Konut Ayarlarını Kaydet
          </button>
          <button
            onClick={() => setIsKonutImportOpen(true)}
            className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition-colors duration-300 flex items-center"
          >
            <FaFileExcel className="mr-2" /> Otomatik Excel Yükleme
          </button>
        </div>
      </div>
    </div>
  );

  const renderKuraTab = () => (
    <div className="bg-white rounded-lg shadow-md mb-8 border border-gray-200">
      <div className="border-b border-gray-200 p-4 bg-indigo-50">
        <h3 className="text-xl font-semibold text-gray-700 flex items-center">
          <FaTable className="mr-2 text-indigo-600" />
          Kura Sayfası Ayarları
        </h3>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <label className="text-sm font-medium text-gray-700 mr-2">Görünüm:</label>
            <select
              value={manuelKuraSettings.layout}
              onChange={(e) => handleManuelKuraSettingsChange('layout', e.target.value)}
              className="block w-36 pl-2 pr-8 py-1 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            >
              <option value="default">Varsayılan</option>
              <option value="expanded">Genişletilmiş</option>
              <option value="tabular">Tablo</option>
            </select>
          </div>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="bg-blue-500 text-white px-3 py-1 text-sm rounded-md hover:bg-blue-600 transition-colors duration-300 flex items-center"
          >
            <FaEye className="mr-1" /> {showPreview ? 'Önizlemeyi Gizle' : 'Önizleme Göster'}
          </button>
        </div>

        {showPreview && (
          <div className="mb-4 border rounded-lg bg-gray-50 p-2">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Önizleme</h4>
            <div className="overflow-auto">
              <div className="origin-top-left">
                {renderPreview()}
              </div>
            </div>
          </div>
        )}

        <div className="mb-4">
          <h4 className="text-lg font-medium text-gray-700 mb-2">
            Gösterilecek Özellikler
          </h4>
          {renderAttributeSelection('katilimci', katilimciAttributes, selectedKatilimciAttributes)}
          {renderAttributeSelection('konut', konutAttributes, selectedKonutAttributes)}
        </div>

        <button
          onClick={console.log('savee')}
          className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors duration-300 flex items-center"
        >
          <FaSave className="mr-2" /> Kura Tablosu Ayarlarını Kaydet
        </button>
      </div>
    </div>
  );

  const renderKuraSayfasiTab = () => (
    <div className="bg-white rounded-lg shadow-md mb-8 border border-gray-200">
      <div className="border-b border-gray-200 p-4 bg-indigo-50">
        <h3 className="text-xl font-semibold text-gray-700 flex items-center">
          <FaTable className="mr-2 text-indigo-600" />
          Kura Sayfası Ayarları
        </h3>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <label className="text-sm font-medium text-gray-700 mr-2">Görünüm:</label>
            <select
              value={manuelKuraSettings.layout}
              onChange={(e) => handleManuelKuraSettingsChange('layout', e.target.value)}
              className="block w-36 pl-2 pr-8 py-1 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            >
              <option value="default">Varsayılan</option>
              <option value="expanded">Genişletilmiş</option>
              <option value="tabular">Tablo</option>
            </select>
          </div>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="bg-blue-500 text-white px-3 py-1 text-sm rounded-md hover:bg-blue-600 transition-colors duration-300 flex items-center"
          >
            <FaEye className="mr-1" /> {showPreview ? 'Önizlemeyi Gizle' : 'Önizleme Göster'}
          </button>
        </div>
  
        {showPreview && (
          <div className="mb-4 border rounded-lg bg-gray-50 p-2">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Önizleme</h4>
            <div className="overflow-auto">
              <div className="origin-top-left">
                {renderPreview()}
              </div>
            </div>
          </div>
        )}

      <div className="mb-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-6">
          {['colors', 'theme', 'animations'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSettingsTab(tab)}
              className={`${
                activeSettingsTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
            >
              {tab === 'colors' ? 'Renkler' : tab === 'theme' ? 'Tema' : 'Animasyonlar'}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {activeSettingsTab === 'colors' &&
          Object.entries(manuelKuraSettings.theme)
            .filter(([key]) => key.includes('Color'))
            .map(([key, value]) => (
              <div key={key} className="flex items-center">
                <label className="text-sm font-medium text-gray-700 w-2/3">
                  {translateSetting(key)}
                </label>
                <input
                  type="color"
                  value={value}
                  onChange={(e) => handleThemeChange(key, e.target.value)}
                  className="ml-2 w-7 h-7 rounded border border-gray-300"
                />
              </div>
            ))}
        {activeSettingsTab === 'theme' &&
          Object.entries(manuelKuraSettings.theme)
            .filter(([key]) => !key.includes('Color'))
            .map(([key, value]) => (
              <div key={key} className="flex items-center">
                <label className="text-sm font-medium text-gray-700 w-2/3">
                  {translateSetting(key)}
                </label>
                {key === 'font' ? (
                  <select
                    value={value}
                    onChange={(e) => handleThemeChange(key, e.target.value)}
                    className="ml-2 w-1/3 px-2 py-1 text-sm border border-gray-300 rounded-md"
                  >
                    <option value="Roboto, sans-serif">Roboto</option>
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="Helvetica, sans-serif">Helvetica</option>
                    <option value="Times New Roman, serif">Times New Roman</option>
                    <option value="Courier New, monospace">Courier New</option>
                    <option value="Verdana, sans-serif">Verdana</option>
                    <option value="Georgia, serif">Georgia</option>
                    <option value="Palatino, serif">Palatino</option>
                    <option value="Garamond, serif">Garamond</option>
                    <option value="Bookman, serif">Bookman</option>
                    <option value="Comic Sans MS, cursive">Comic Sans MS</option>
                    <option value="Trebuchet MS, sans-serif">Trebuchet MS</option>
                    <option value="Arial Black, sans-serif">Arial Black</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleThemeChange(key, e.target.value)}
                    className="ml-2 w-1/3 px-2 py-1 text-sm border border-gray-300 rounded-md"
                  />
                )}
              </div>
            ))}
        {activeSettingsTab === 'animations' &&
          Object.entries(manuelKuraSettings.animations).map(([key, value]) => (
            <div key={key} className="flex items-center">
              <label className="text-sm font-medium text-gray-700 w-2/3">
                {translateSetting(key)}
              </label>
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handleAnimationChange(key, e.target.checked)}
                className="ml-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
            </div>
          ))}
      </div>

      <div className="mt-5 flex justify-center">
        <button
          onClick={saveManuelKuraSettings}
          className="bg-indigo-600 text-white px-5 py-2 text-sm rounded-md hover:bg-indigo-700 transition-colors duration-300 flex items-center"
        >
          <FaSave className="mr-2" /> Ayarları Kaydet
        </button>
      </div>
    </div>
  </div>
);

  const translateSetting = (key) => {
    const translations = {
      // Theme settings
      headerBgColor: "Başlık Arka Plan Rengi",
      headerTextColor: "Başlık Metin Rengi",
      rowEvenBgColor: "Çift Satır Arka Plan Rengi",
      rowOddBgColor: "Tek Satır Arka Plan Rengi",
      textColor: "Genel Metin Rengi",
      highlightColor: "Vurgulama Rengi",
      font: "Yazı Tipi",
      cardBgColor: "Kart Arka Plan Rengi",
      cardBorderColor: "Kart Kenarlık Rengi",
      inputBorderColor: "Giriş Alanı Kenarlık Rengi",
      inputFocusColor: "Giriş Alanı Odaklanma Rengi",
      buttonBgColor: "Düğme Arka Plan Rengi",
      buttonHoverColor: "Düğme Üzerine Gelme Rengi",
      // Animation settings
      rowHover: "Satır Üzerine Gelme Efekti",
      cardHover: "Kart Üzerine Gelme Efekti",
      fadeIn: "Yavaşça Görünme Efekti",
    };
    return translations[key] || key;
  };

  const saveManuelKuraSettings = () => {
    const updatedSettings = {
      ...manuelKuraSettings,
      selectedKatilimciAttributes,
      selectedKonutAttributes,
    };

    window.electron.ipcRenderer.send('save-project-settings', { 
      projectId: projectInfo.id, 
      settings: { 
        ...projectInfo.settings, 
        manuelKuraSettings: updatedSettings
      } 
    });

    window.electron.ipcRenderer.once('save-project-settings-response', (event, args) => {
      if (args.success) {
        setAlertMessage('Manuel Kura ayarları başarıyla kaydedildi.');
        setAlertType('bg-green-500');
        setShowAlert(true);
      } else {
        setAlertMessage('Manuel Kura ayarları kaydedilirken bir hata oluştu.');
        setAlertType('bg-red-500');
        setShowAlert(true);
      }
    });
  };

  return (
    <Fragment>
      <div className="flex justify-center items-center bg-gray-100 min-h-screen py-8">
        <div className="w-full max-w-7xl bg-white rounded-lg shadow-md overflow-hidden">
          <h2 className="text-3xl font-bold text-gray-800 p-6 text-center flex items-center justify-center border-b border-gray-200">
            <FaCog className="mr-2 text-blue-600" />
            {projectInfo.projectName} Kura Ayarları
          </h2>

          <div className="flex border-b border-gray-200">
            <button
              className={`py-3 px-6 font-semibold ${
                activeTab === 'katilimci' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('katilimci')}
            >
              Katılımcı Tablosu
            </button>
            <button
              className={`py-3 px-6 font-semibold ${
                activeTab === 'konut' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('konut')}
            >
              Konut Tablosu
            </button>
            <button
              className={`py-3 px-6 font-semibold ${
                activeTab === 'kura' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('kura')}
            >
              Kura Tablosu
            </button>
            <button
              className={`py-3 px-6 font-semibold ${
                activeTab === 'kuraSayfasi' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('kuraSayfasi')}
            >
              Kura Sayfası
            </button>
          </div>

          <div className="p-6 h-[calc(100vh-250px)] overflow-y-auto">
            {activeTab === 'katilimci' && renderKatilimciTab()}
            {activeTab === 'konut' && renderKonutTab()}
            {activeTab === 'kura' && renderKuraTab()}
            {activeTab === 'kuraSayfasi' && renderKuraSayfasiTab()}
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

          <ReactSpreadsheetImport
            isOpen={isKatilimciImportOpen}
            onClose={onCloseImportModal}
            onSubmit={onSubmitKatilimci}
            fields={fieldsKatilimci}
            translations={translations}
          />

          <ReactSpreadsheetImport
            isOpen={isKonutImportOpen}
            onClose={onCloseImportModal}
            onSubmit={onSubmitKonut}
            fields={fieldsKonut}
            translations={translations}
          />
        </div>

        <SidebarNav 
          checkIfDbSelected={projectInfo}
          selectedProject={projectInfo}
        />
      </div>
    </Fragment>
  );
}

export default ProjectSettingsPage;
