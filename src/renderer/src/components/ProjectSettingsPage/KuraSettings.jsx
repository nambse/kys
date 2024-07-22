import React, { useState, useEffect } from 'react';
import { FaTable, FaEye, FaSave, FaCog } from 'react-icons/fa';

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

const KuraSettings = ({ projectInfo, handleAlert }) => {
  const [manuelKuraSettings, setManuelKuraSettings] = useState(defaultManuelKuraSettings);
  const [showPreview, setShowPreview] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('colors');
  const [selectedKatilimciAttributes, setSelectedKatilimciAttributes] = useState([]);
  const [selectedKonutAttributes, setSelectedKonutAttributes] = useState([]);
  const [katilimciAttributes, setKatilimciAttributes] = useState([]);
  const [konutAttributes, setKonutAttributes] = useState([]);
  const [activeKuraTab, setActiveKuraTab] = useState('tablo');

  useEffect(() => {
    fetchKuraSettings();
  }, [projectInfo.id]);

  const fetchKuraSettings = () => {
    window.electron.ipcRenderer.send('get-project-settings', projectInfo.id);
    window.electron.ipcRenderer.once('get-project-settings-response', (event, response) => {
      if (response.success && response.settings) {
        const { manuelKuraSettings = {}, katilimciAttributes = [], konutAttributes = [] } = response.settings;
        setManuelKuraSettings({...defaultManuelKuraSettings, ...manuelKuraSettings});
        setSelectedKatilimciAttributes(manuelKuraSettings.selectedKatilimciAttributes || []);
        setSelectedKonutAttributes(manuelKuraSettings.selectedKonutAttributes || []);
        setKatilimciAttributes(katilimciAttributes);
        setKonutAttributes(konutAttributes);
      } else {
        console.error(response.message);
      }
    });
  };

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

  const saveKuraSettings = () => {
    window.electron.ipcRenderer.send('get-project-settings', projectInfo.id);
    window.electron.ipcRenderer.once('get-project-settings-response', (event, response) => {
      if (response.success && response.settings) {
        const updatedSettings = {
          ...response.settings,
          manuelKuraSettings: {
            ...manuelKuraSettings,
            selectedKatilimciAttributes,
            selectedKonutAttributes,
          }
        };
        
        window.electron.ipcRenderer.send('save-project-settings', { 
          projectId: projectInfo.id, 
          settings: updatedSettings 
        });
      } else {
        console.error('Failed to get current project settings');
        handleAlert('Mevcut ayarlar alınamadı. Lütfen tekrar deneyin.', 'bg-red-500');
        return;
      }
  
      window.electron.ipcRenderer.once('save-project-settings-response', (event, args) => {
        if (args.success) {
          handleAlert('Manuel Kura ayarları başarıyla kaydedildi.', 'bg-green-500');
        } else {
          console.error('Error saving settings:', args.error);
          handleAlert('Manuel Kura ayarları kaydedilirken bir hata oluştu.', 'bg-red-500');
        }
      });
    });
  };

  const translateSetting = (key) => {
    const translations = {
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
      rowHover: "Satır Üzerine Gelme Efekti",
      cardHover: "Kart Üzerine Gelme Efekti",
      fadeIn: "Yavaşça Görünme Efekti",
    };
    return translations[key] || key;
  };

  return (
    <div className="bg-white rounded-lg shadow-md mb-8 border border-gray-200">
      <div className="border-b border-gray-200 p-4 bg-indigo-50">
        <h3 className="text-xl font-semibold text-gray-700 flex items-center">
          <FaTable className="mr-2 text-indigo-600" />
          Kura Ayarları
        </h3>
      </div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          <button
            className={`py-3 px-6 font-semibold flex items-center ${
              activeKuraTab === 'tablo' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'
            }`}
            onClick={() => setActiveKuraTab('tablo')}
          >
            <FaTable className="mr-2" />
            Kura Tablosu
          </button>
          <button
            className={`py-3 px-6 font-semibold flex items-center ${
              activeKuraTab === 'sayfa' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'
            }`}
            onClick={() => setActiveKuraTab('sayfa')}
          >
            <FaCog className="mr-2" />
            Kura Sayfası Görünümü
          </button>
        </nav>
      </div>
      <div className="p-4 space-y-4">
        {activeKuraTab === 'tablo' && (
          <>
            <div className="mb-4">
              <h4 className="text-lg font-medium text-gray-700 mb-2">
                Gösterilecek Özellikler
              </h4>
              {renderAttributeSelection('katilimci', katilimciAttributes, selectedKatilimciAttributes)}
              {renderAttributeSelection('konut', konutAttributes, selectedKonutAttributes)}
            </div>
          </>
        )}
        {activeKuraTab === 'sayfa' && (
          <>
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
          </>
        )}

        <div className="mt-5 flex justify-center">
          <button
            onClick={saveKuraSettings}
            className="bg-indigo-600 text-white px-5 py-2 text-sm rounded-md hover:bg-indigo-700 transition-colors duration-300 flex items-center"
          >
            <FaSave className="mr-2" /> Ayarları Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};

export default KuraSettings;