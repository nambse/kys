import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaExchangeAlt } from 'react-icons/fa';
import { useDatabase } from '../context/DatabaseContext';
import SidebarNav from '../components/SidebarNav';

const katilimciData = [
    {
        "Kura Sıra No": "1",
        "ADI SOYADI": "A*** C**",
        "Konut Tipi": "",
        "Başvuru Türü": "Şehit Ailesi",
        "Banka Başvuru No": "00000001919350",
        "Başvuru Tarih": "",
        "T.C No": "3707*******",
        "Adı": "AYŞE",
        "Soyadı": "CAN"
    },
    {
        "Kura Sıra No": "2",
        "ADI SOYADI": "Y**** K*******",
        "Konut Tipi": "",
        "Başvuru Türü": "Şehit Ailesi",
        "Banka Başvuru No": "00000001941544",
        "Başvuru Tarih": "",
        "T.C No": "2657*******",
        "Adı": "YETER",
        "Soyadı": "KAHRAMAN"
    },
    {
        "Kura Sıra No": "3",
        "ADI SOYADI": "N***** Ö*****",
        "Konut Tipi": "",
        "Başvuru Türü": "Şehit Ailesi",
        "Banka Başvuru No": "00000002019724",
        "Başvuru Tarih": "",
        "T.C No": "2962*******",
        "Adı": "NECATİ",
        "Soyadı": "ÖZTÜRK"
    },
    {
        "Kura Sıra No": "4",
        "ADI SOYADI": "A*** C*****",
        "Konut Tipi": "",
        "Başvuru Türü": "Şehit Ailesi",
        "Banka Başvuru No": "00000002057807",
        "Başvuru Tarih": "",
        "T.C No": "4485*******",
        "Adı": "ADEM",
        "Soyadı": "COŞKUN"
    },
    {
        "Kura Sıra No": "5",
        "ADI SOYADI": "İ****** Ç********",
        "Konut Tipi": "",
        "Başvuru Türü": "Şehit Ailesi",
        "Banka Başvuru No": "00000002294078",
        "Başvuru Tarih": "",
        "T.C No": "2839*******",
        "Adı": "İBRAHİM",
        "Soyadı": "ÇOLAKOĞLU"
    },
    {
        "Kura Sıra No": "6",
        "ADI SOYADI": "F**** D*****",
        "Konut Tipi": "",
        "Başvuru Türü": "Şehit Ailesi",
        "Banka Başvuru No": "00000002301313",
        "Başvuru Tarih": "",
        "T.C No": "4258*******",
        "Adı": "FATİH",
        "Soyadı": "DURMUŞ"
    }
];

const konutData = [
        {
            "SIRA NO": " 1 ",
            "BB NO": "32251943",
            "BLOK NO": "DB-1",
            "KAT NO": "1.KAT",
            "DAİRE NO": "5",
            "ODA SAYISI": "3+1",
            "BRÜT (m²)": "105,86"
        },
        {
            "SIRA NO": " 2 ",
            "BB NO": "32251963",
            "BLOK NO": "DK-1",
            "KAT NO": "1.KAT",
            "DAİRE NO": "7",
            "ODA SAYISI": "2+1",
            "BRÜT (m²)": "85,86"
        },
        {
            "SIRA NO": " 3 ",
            "BB NO": "32251950",
            "BLOK NO": "DK-1",
            "KAT NO": "4.KAT",
            "DAİRE NO": "18",
            "ODA SAYISI": "2+1",
            "BRÜT (m²)": "85,86"
        },
        {
            "SIRA NO": " 4 ",
            "BB NO": "32252183",
            "BLOK NO": "DK-3",
            "KAT NO": "ZEMİN",
            "DAİRE NO": "1",
            "ODA SAYISI": "2+1",
            "BRÜT (m²)": "85,86"
        },
        {
            "SIRA NO": " 5 ",
            "BB NO": "32252181",
            "BLOK NO": "DK-3",
            "KAT NO": "ZEMİN",
            "DAİRE NO": "4",
            "ODA SAYISI": "2+1",
            "BRÜT (m²)": "85,86"
        },
        {
            "SIRA NO": " 6 ",
            "BB NO": "32252177",
            "BLOK NO": "DK-3",
            "KAT NO": "1.KAT",
            "DAİRE NO": "5",
            "ODA SAYISI": "2+1",
            "BRÜT (m²)": "85,86"
        },
        {
            "SIRA NO": " 7 ",
            "BB NO": "32252164",
            "BLOK NO": "DK-3",
            "KAT NO": "4.KAT",
            "DAİRE NO": "18",
            "ODA SAYISI": "2+1",
            "BRÜT (m²)": "85,86"
        },
        {
            "SIRA NO": " 8 ",
            "BB NO": "32252184",
            "BLOK NO": "DK-4",
            "KAT NO": "4.KAT",
            "DAİRE NO": "19",
            "ODA SAYISI": "2+1",
            "BRÜT (m²)": "85,86"
        },
        {
            "SIRA NO": " 9 ",
            "BB NO": "32252211",
            "BLOK NO": "DK-5",
            "KAT NO": "3.KAT",
            "DAİRE NO": "14",
            "ODA SAYISI": "2+1",
            "BRÜT (m²)": "85,86"
        },
        {
            "SIRA NO": " 10 ",
            "BB NO": "32251742",
            "BLOK NO": "L1-2",
            "KAT NO": "1.KAT",
            "DAİRE NO": "6",
            "ODA SAYISI": "2+1",
            "BRÜT (m²)": "88,56"
        }
    ];

    const ManuelKuraPage = () => {
        const { projectInfo } = useDatabase();
        const [raffleRows, setRaffleRows] = useState([
          { katilimciSiraNo: '', konutSiraNo: '' },
          { katilimciSiraNo: '', konutSiraNo: '' }
        ]);
        const [settings, setSettings] = useState({
          layout: 'default',
          theme: {
            headerBgColor: '#1a202c',
            headerTextColor: '#ffffff',
            rowEvenBgColor: '#f7fafc',
            rowOddBgColor: '#edf2f7',
            textColor: '#2d3748',
            highlightColor: '#4299e1',
            font: 'Arial, sans-serif',
          },
        });
      
        const inputRefs = useRef([]);
        const rowRefs = useRef([]);
        const [activeCell, setActiveCell] = useState(null);
        const tableRef = useRef(null);
      
        useEffect(() => {
          inputRefs.current = inputRefs.current.slice(0, raffleRows.length * 2);
          rowRefs.current = rowRefs.current.slice(0, raffleRows.length);
        }, [raffleRows]);
      
        const handleInputChange = (index, field, value) => {
          const updatedRows = [...raffleRows];
          updatedRows[index][field] = value;
          setRaffleRows(updatedRows);
        };
      
        const fetchData = (index, field) => {
          const updatedRows = [...raffleRows];
          const value = updatedRows[index][field];
      
          if (field === 'katilimciSiraNo') {
            const katilimci = katilimciData.find(k => k['Kura Sıra No'] === value);
            if (katilimci) {
              updatedRows[index].katilimciBilgileri = katilimci;
            } else {
              updatedRows[index].katilimciBilgileri = null;
            }
          } else if (field === 'konutSiraNo') {
            const konut = konutData.find(k => k['SIRA NO'].trim() === value);
            if (konut) {
              updatedRows[index].konutBilgileri = konut;
            } else {
              updatedRows[index].konutBilgileri = null;
            }
          }
      
          if (index === updatedRows.length - 2 && updatedRows[index].katilimciSiraNo && updatedRows[index].konutSiraNo) {
            updatedRows.push({ katilimciSiraNo: '', konutSiraNo: '' });
          }
      
          setRaffleRows(updatedRows);
        };

        const scrollToRow = useCallback((rowIndex) => {
          if (rowRefs.current[rowIndex]) {
            rowRefs.current[rowIndex].scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
            });
          }
        }, []);

        const createNewRowIfNeeded = (currentRowIndex) => {
            if (currentRowIndex === raffleRows.length - 2) {
              setRaffleRows(prev => [...prev, { katilimciSiraNo: '', konutSiraNo: '' }]);
            }
          };
        
        const moveToNextRow = (currentRowIndex) => {
          createNewRowIfNeeded(currentRowIndex);
          setTimeout(() => {
            const nextRowIndex = currentRowIndex + 1;
            inputRefs.current[nextRowIndex * 2]?.focus();
            scrollToRow(nextRowIndex);
          }, 0);
        };

        const handleKeyDown = (event, rowIndex, field) => {
            const currentIndex = rowIndex * 2 + (field === 'katilimciSiraNo' ? 0 : 1);
        
            switch (event.key) {
              case 'Enter':
                event.preventDefault();
                if (field === 'katilimciSiraNo') {
                  inputRefs.current[currentIndex + 1]?.focus();
                } else {
                  moveToNextRow(rowIndex);
                }
                break;
              case 'ArrowRight':
                event.preventDefault();
                if (field === 'konutSiraNo') {
                  moveToNextRow(rowIndex);
                } else {
                  inputRefs.current[currentIndex + 1]?.focus();
                }
                break;
              case 'ArrowDown':
                event.preventDefault();
                if (rowIndex === raffleRows.length - 2 && field === 'konutSiraNo') {
                  moveToNextRow(rowIndex);
                } else {
                  inputRefs.current[Math.min(inputRefs.current.length - 1, currentIndex + 2)]?.focus();
                }
                break;
              case 'ArrowUp':
                event.preventDefault();
                inputRefs.current[Math.max(0, currentIndex - 2)]?.focus();
                break;
              case 'ArrowLeft':
                if (event.target.selectionStart === 0) {
                  event.preventDefault();
                  inputRefs.current[Math.max(0, currentIndex - 1)]?.focus();
                }
                break;
            }
          };
      
          const handleFocus = (index, field) => {
            setActiveCell({ index, field });
            scrollToRow(index);
          };
        
      
          const handleBlur = (index, field) => {
            if (activeCell && activeCell.index === index && activeCell.field === field) {
              fetchData(index, field);
              setActiveCell(null);
            }
          };
        
          const handleCellClick = (rowIndex, field) => {
            if (field === 'konutSiraNo' && rowIndex === raffleRows.length - 2) {
              moveToNextRow(rowIndex);
            }
          };
      
        const toggleLayout = () => {
          setSettings(prev => ({
            ...prev,
            layout: prev.layout === 'default' ? 'expanded' : 'default',
          }));
        };
      
        const renderRow = (row, index) => {
          if (index >= raffleRows.length - 1) return null;
      
          const rowStyle = {
            backgroundColor: index % 2 === 0 ? settings.theme.rowEvenBgColor : settings.theme.rowOddBgColor,
            color: settings.theme.textColor,
          };
      
          return (
            <tr key={index} ref={el => rowRefs.current[index] = el} style={rowStyle} className="transition-all duration-300 ease-in-out">
              <td className="px-4 py-2">
                <input
                  ref={el => inputRefs.current[index * 2] = el}
                  type="text"
                  value={row.katilimciSiraNo}
                  onChange={(e) => handleInputChange(index, 'katilimciSiraNo', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index, 'katilimciSiraNo')}
                  onFocus={() => handleFocus(index, 'katilimciSiraNo')}
                  onBlur={() => handleBlur(index, 'katilimciSiraNo')}
                  onClick={() => handleCellClick(index, 'katilimciSiraNo')}
                  className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  placeholder="Katılımcı Sıra No"
                />
              </td>
              <td className="px-4 py-2">
                <input
                  ref={el => inputRefs.current[index * 2 + 1] = el}
                  type="text"
                  value={row.konutSiraNo}
                  onChange={(e) => handleInputChange(index, 'konutSiraNo', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index, 'konutSiraNo')}
                  onFocus={() => handleFocus(index, 'konutSiraNo')}
                  onBlur={() => handleBlur(index, 'konutSiraNo')}
                  onClick={() => handleCellClick(index, 'konutSiraNo')}
                  className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                  placeholder="Konut Sıra No"
                />
              </td>
              <td className="px-4 py-2">
                {row.katilimciBilgileri && (
                  <div className="animate-fade-in">
                    <p><strong>Ad Soyad:</strong> {row.katilimciBilgileri['ADI SOYADI']}</p>
                    <p><strong>T.C. No:</strong> {row.katilimciBilgileri['T.C No']}</p>
                    <p><strong>Başvuru Türü:</strong> {row.katilimciBilgileri['Başvuru Türü']}</p>
                  </div>
                )}
              </td>
              <td className="px-4 py-2">
                {row.konutBilgileri && (
                  <div className="animate-fade-in">
                    <p><strong>Blok No:</strong> {row.konutBilgileri['BLOK NO']}</p>
                    <p><strong>Daire No:</strong> {row.konutBilgileri['DAİRE NO']}</p>
                    <p><strong>Oda Sayısı:</strong> {row.konutBilgileri['ODA SAYISI']}</p>
                  </div>
                )}
              </td>
            </tr>
          );
        };
      
        const renderExpandedRow = (row, index) => {
          if (index >= raffleRows.length - 1) return null;
      
          const rowStyle = {
            backgroundColor: index % 2 === 0 ? settings.theme.rowEvenBgColor : settings.theme.rowOddBgColor,
            color: settings.theme.textColor,
          };
      
          return (
            <tr key={index} style={rowStyle}>
              <td className="px-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      ref={el => inputRefs.current[index * 2] = el}
                      type="text"
                      value={row.katilimciSiraNo}
                      onChange={(e) => handleInputChange(index, 'katilimciSiraNo', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index, 'katilimciSiraNo')}
                      onFocus={() => handleFocus(index, 'katilimciSiraNo')}
                      onBlur={() => handleBlur(index, 'katilimciSiraNo')}
                      onClick={() => handleCellClick(index, 'katilimciSiraNo')}
                      className="w-full border rounded px-2 py-1 mb-2"
                      placeholder="Katılımcı Sıra No"
                    />
                    {row.katilimciBilgileri && (
                      <div className="bg-blue-100 p-2 rounded">
                        <h3 className="font-bold">Katılımcı Bilgileri</h3>
                        <p><strong>Ad Soyad:</strong> {row.katilimciBilgileri['ADI SOYADI']}</p>
                        <p><strong>T.C. No:</strong> {row.katilimciBilgileri['T.C No']}</p>
                        <p><strong>Başvuru Türü:</strong> {row.katilimciBilgileri['Başvuru Türü']}</p>
                        <p><strong>Banka Başvuru No:</strong> {row.katilimciBilgileri['Banka Başvuru No']}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      ref={el => inputRefs.current[index * 2 + 1] = el}
                      type="text"
                      value={row.konutSiraNo}
                      onChange={(e) => handleInputChange(index, 'konutSiraNo', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index, 'konutSiraNo')}
                      onFocus={() => handleFocus(index, 'konutSiraNo')}
                      onBlur={() => handleBlur(index, 'konutSiraNo')}
                      onClick={() => handleCellClick(index, 'konutSiraNo')}
                      className="w-full border rounded px-2 py-1 mb-2"
                      placeholder="Konut Sıra No"
                    />
                    {row.konutBilgileri && (
                      <div className="bg-green-100 p-2 rounded">
                        <h3 className="font-bold">Konut Bilgileri</h3>
                        <p><strong>Blok No:</strong> {row.konutBilgileri['BLOK NO']}</p>
                        <p><strong>Kat No:</strong> {row.konutBilgileri['KAT NO']}</p>
                        <p><strong>Daire No:</strong> {row.konutBilgileri['DAİRE NO']}</p>
                        <p><strong>Oda Sayısı:</strong> {row.konutBilgileri['ODA SAYISI']}</p>
                        <p><strong>Brüt Alan:</strong> {row.konutBilgileri['BRÜT (m²)']} m²</p>
                      </div>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          );
        };
      
        return (
          <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-white shadow-md sticky top-0 z-10">
              <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">
                  {projectInfo.projectName} Manuel Kura Çekimi
                </h1>
                <button
                  onClick={toggleLayout}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center transition-colors duration-300"
                >
                  <FaExchangeAlt className="mr-2" />
                  Toggle Layout
                </button>
              </div>
            </header>
            <main className="flex-grow overflow-hidden">
              <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="overflow-x-auto">
                  <table ref={tableRef} className="min-w-full bg-white" style={{fontFamily: settings.theme.font}}>
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        {settings.layout === 'default' ? (
                          <>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Katılımcı Sıra No</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Konut Sıra No</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Katılımcı Bilgileri</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Konut Bilgileri</th>
                          </>
                        ) : (
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kura Bilgileri</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {raffleRows.map((row, index) => 
                        settings.layout === 'default' ? renderRow(row, index) : renderExpandedRow(row, index)
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </main>
            <SidebarNav selectedProject={projectInfo} />
          </div>
        );
      };
      
      export default ManuelKuraPage;