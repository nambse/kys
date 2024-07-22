import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { FaExchangeAlt, FaCog, FaUser, FaHome } from 'react-icons/fa';
import { useDatabase } from '../context/DatabaseContext';
import SidebarNav from '../components/SidebarNav';
import LivestreamBox from '../components/LivestreamBox';

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
        });
      
        const inputRefs = useRef([]);
        const rowRefs = useRef([]);
        const [activeCell, setActiveCell] = useState(null);
        const tableRef = useRef(null);
        const expandedRowRefs = useRef([]);
        const cardRefs = useRef([]);
        const [livestreamSize, setLivestreamSize] = useState({ width: 320, height: 240 });
        const [livestreamPosition, setLivestreamPosition] = useState({ x: window.innerWidth - 340, y: window.innerHeight - 260 });
        const [showLivestream, setShowLivestream] = useState(true);

        useEffect(() => {
          inputRefs.current = inputRefs.current.slice(0, raffleRows.length * 2);
          rowRefs.current = rowRefs.current.slice(0, raffleRows.length);
        }, [raffleRows]);
      
        useEffect(() => {
          let previousHeight = document.documentElement.scrollHeight;
        
          const scrollToBottomIfNeeded = () => {
            const currentHeight = document.documentElement.scrollHeight;
            if (currentHeight > previousHeight) {
              window.scrollTo({ top: currentHeight, behavior: 'smooth' });
            }
            previousHeight = currentHeight;
          };
        
          const resizeObserver = new ResizeObserver(() => {
            scrollToBottomIfNeeded();
          });
        
          resizeObserver.observe(document.documentElement);
        
          window.addEventListener('resize', scrollToBottomIfNeeded);
        
          return () => {
            resizeObserver.unobserve(document.documentElement);
            window.removeEventListener('resize', scrollToBottomIfNeeded);
          };
        }, []);
        
        useLayoutEffect(() => {
          if (settings.layout === 'default' || settings.layout === 'expanded') {
            cardRefs.current.forEach((rowCards, index) => {
              if (rowCards[0] && rowCards[1]) {
                const height = Math.max(rowCards[0].offsetHeight, rowCards[1].offsetHeight);
                rowCards[0].style.height = `${height}px`;
                rowCards[1].style.height = `${height}px`;
              }
            });
          }
        }, [raffleRows, settings.layout]);

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
            // Remove this condition to prevent creating a new row on click
            // if (field === 'konutSiraNo' && rowIndex === raffleRows.length - 2) {
            //   moveToNextRow(rowIndex);
            // }
          };
      
          const toggleLayout = () => {
            setSettings(prev => ({
              ...prev,
              layout: prev.layout === 'default' ? 'expanded' : (prev.layout === 'expanded' ? 'tabular' : 'default'),
            }));
          };
      
        const toggleSettings = () => {
          // This function would open a settings modal or sidebar
          console.log('Toggle settings');
        };

        const applyRowAnimation = (index) => {
          if (settings.animations.rowHover) {
            return `hover:bg-opacity-80 transition-all duration-300 ${
              index % 2 === 0 ? 'hover:bg-blue-50' : 'hover:bg-blue-100'
            }`;
          }
          return '';
        };

        const applyCardAnimation = () => {
          if (settings.animations.cardHover) {
            return 'hover:shadow-lg transition-shadow duration-300';
          }
          return '';
        };

        const renderCard = (content, icon, bgColor, index, cardIndex) => (
          <div 
            ref={el => {
              if (!cardRefs.current[index]) cardRefs.current[index] = [];
              cardRefs.current[index][cardIndex] = el;
            }}
            className={`${bgColor} p-2 rounded shadow ${applyCardAnimation()} ${settings.animations.fadeIn ? 'animate-fade-in' : ''}`}
          >
            <div className="flex h-full">
              <div className="w-1/6 flex items-center justify-center">
                {icon}
              </div>
              <div className="w-5/6 flex items-center">
                <div>
                  {content}
                </div>
              </div>
            </div>
          </div>
        );

        const renderRow = (row, index) => {
          if (index >= raffleRows.length - 1) return null;

          const rowStyle = {
            backgroundColor: index % 2 === 0 ? settings.theme.rowEvenBgColor : settings.theme.rowOddBgColor,
            color: settings.theme.textColor,
          };

          const katilimciContent = row.katilimciBilgileri && (
            <>
              <p><strong>Ad Soyad:</strong> {row.katilimciBilgileri['ADI SOYADI']}</p>
              <p><strong>T.C. No:</strong> {row.katilimciBilgileri['T.C No']}</p>
              <p><strong>Başvuru Türü:</strong> {row.katilimciBilgileri['Başvuru Türü']}</p>
            </>
          );

          const konutContent = row.konutBilgileri && (
            <>
              <p><strong>Blok No:</strong> {row.konutBilgileri['BLOK NO']}</p>
              <p><strong>Daire No:</strong> {row.konutBilgileri['DAİRE NO']}</p>
              <p><strong>Oda Sayısı:</strong> {row.konutBilgileri['ODA SAYISI']}</p>
              <p><strong>Brüt Alan:</strong> {row.konutBilgileri['BRÜT (m²)']} m²</p>
            </>
          );

          return (
            <tr key={index} ref={el => rowRefs.current[index] = el} style={rowStyle} className={`${applyRowAnimation(index)}`}>
              <td className="px-4 py-2 w-1/6">
                <input
                  ref={el => inputRefs.current[index * 2] = el}
                  type="text"
                  value={row.katilimciSiraNo}
                  onChange={(e) => handleInputChange(index, 'katilimciSiraNo', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index, 'katilimciSiraNo')}
                  onFocus={() => handleFocus(index, 'katilimciSiraNo')}
                  onBlur={() => handleBlur(index, 'katilimciSiraNo')}
                  onClick={() => handleCellClick(index, 'katilimciSiraNo')}
                  className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 transition-all duration-300`}
                  style={{
                    borderColor: settings.theme.inputBorderColor,
                    color: settings.theme.textColor,
                  }}
                  placeholder="Katılımcı Sıra No"
                />
              </td>
              <td className="px-4 py-2 w-1/6">
                <input
                  ref={el => inputRefs.current[index * 2 + 1] = el}
                  type="text"
                  value={row.konutSiraNo}
                  onChange={(e) => handleInputChange(index, 'konutSiraNo', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index, 'konutSiraNo')}
                  onFocus={() => handleFocus(index, 'konutSiraNo')}
                  onBlur={() => handleBlur(index, 'konutSiraNo')}
                  onClick={() => handleCellClick(index, 'konutSiraNo')}
                  className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 transition-all duration-300`}
                  style={{
                    borderColor: settings.theme.inputBorderColor,
                    color: settings.theme.textColor,
                  }}
                  placeholder="Konut Sıra No"
                />
              </td>
              <td className="px-4 py-2 w-1/3">
                {row.katilimciBilgileri && renderCard(katilimciContent, <FaUser className="text-3xl text-blue-500" />, 'bg-blue-50', index, 0)}
              </td>
              <td className="px-4 py-2 w-1/3">
                {row.konutBilgileri && renderCard(konutContent, <FaHome className="text-3xl text-green-500" />, 'bg-green-50', index, 1)}
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
        
          const katilimciContent = row.katilimciBilgileri && (
            <>
              <p><strong>Ad Soyad:</strong> {row.katilimciBilgileri['ADI SOYADI']}</p>
              <p><strong>T.C. No:</strong> {row.katilimciBilgileri['T.C No']}</p>
              <p><strong>Başvuru Türü:</strong> {row.katilimciBilgileri['Başvuru Türü']}</p>
              <p><strong>Banka Başvuru No:</strong> {row.katilimciBilgileri['Banka Başvuru No']}</p>
            </>
          );

          const konutContent = row.konutBilgileri && (
            <>
              <p><strong>Blok No:</strong> {row.konutBilgileri['BLOK NO']}</p>
              <p><strong>Kat No:</strong> {row.konutBilgileri['KAT NO']}</p>
              <p><strong>Daire No:</strong> {row.konutBilgileri['DAİRE NO']}</p>
              <p><strong>Oda Sayısı:</strong> {row.konutBilgileri['ODA SAYISI']}</p>
              <p><strong>Brüt Alan:</strong> {row.konutBilgileri['BRÜT (m²)']} m²</p>
            </>
          );
        
          return (
            <tr key={index} style={rowStyle}>
              <td className="px-4 py-4">
                <div ref={el => expandedRowRefs.current[index] = el} className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
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
                      <div className={`bg-blue-50 p-3 rounded shadow-sm flex-grow ${applyCardAnimation()} ${settings.animations.fadeIn ? 'animate-fade-in' : ''}`}>
                        <h3 className="font-bold text-lg mb-2 flex items-center">
                          <FaUser className="mr-2" /> Katılımcı Bilgileri
                        </h3>
                        {katilimciContent}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
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
                      <div className={`bg-green-50 p-3 rounded shadow-sm flex-grow ${applyCardAnimation()} ${settings.animations.fadeIn ? 'animate-fade-in' : ''}`}>
                        <h3 className="font-bold text-lg mb-2 flex items-center">
                          <FaHome className="mr-2" /> Konut Bilgileri
                        </h3>
                        {konutContent}
                      </div>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          );
        };  

        const renderTabularRow = (row, index) => {
          if (index >= raffleRows.length - 1) return null;
        
          const rowStyle = {
            backgroundColor: index % 2 === 0 ? settings.theme.rowEvenBgColor : settings.theme.rowOddBgColor,
            color: settings.theme.textColor,
          };
        
          return (
            <tr key={index} ref={el => rowRefs.current[index] = el} style={rowStyle} className={`${applyRowAnimation(index)}`}>
              <td className="px-2 py-2 w-[8%]">
                <input
                  ref={el => inputRefs.current[index * 2] = el}
                  type="text"
                  value={row.katilimciSiraNo}
                  onChange={(e) => handleInputChange(index, 'katilimciSiraNo', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index, 'katilimciSiraNo')}
                  onFocus={() => handleFocus(index, 'katilimciSiraNo')}
                  onBlur={() => handleBlur(index, 'katilimciSiraNo')}
                  onClick={() => handleCellClick(index, 'katilimciSiraNo')}
                  className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 transition-all duration-300`}
                  style={{
                    borderColor: settings.theme.inputBorderColor,
                    color: settings.theme.textColor,
                  }}
                  placeholder="Katılımcı Sıra No"
                />
              </td>
              <td className="px-2 py-2 w-[8%]">
                <input
                  ref={el => inputRefs.current[index * 2 + 1] = el}
                  type="text"
                  value={row.konutSiraNo}
                  onChange={(e) => handleInputChange(index, 'konutSiraNo', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index, 'konutSiraNo')}
                  onFocus={() => handleFocus(index, 'konutSiraNo')}
                  onBlur={() => handleBlur(index, 'konutSiraNo')}
                  onClick={() => handleCellClick(index, 'konutSiraNo')}
                  className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 transition-all duration-300`}
                  style={{
                    borderColor: settings.theme.inputBorderColor,
                    color: settings.theme.textColor,
                  }}
                  placeholder="Konut Sıra No"
                />
              </td>
              <td className="px-2 py-2 w-[18%]">{row.katilimciBilgileri ? row.katilimciBilgileri['ADI SOYADI'] : ''}</td>
              <td className="px-2 py-2 w-[12%]">{row.katilimciBilgileri ? row.katilimciBilgileri['T.C No'] : ''}</td>
              <td className="px-2 py-2 w-[14%]">{row.katilimciBilgileri ? row.katilimciBilgileri['Başvuru Türü'] : ''}</td>
              <td className="px-2 py-2 w-[10%]">{row.konutBilgileri ? row.konutBilgileri['BLOK NO'] : ''}</td>
              <td className="px-2 py-2 w-[10%]">{row.konutBilgileri ? row.konutBilgileri['DAİRE NO'] : ''}</td>
              <td className="px-2 py-2 w-[10%]">{row.konutBilgileri ? row.konutBilgileri['ODA SAYISI'] : ''}</td>
              <td className="px-2 py-2 w-[10%]">{row.konutBilgileri ? row.konutBilgileri['BRÜT (m²)'] : ''}</td>
            </tr>
          );
        };
      
        const handleLivestreamResize = (size) => {
          setLivestreamSize(size);
        };

        const handleLivestreamDrag = (position) => {
          setLivestreamPosition(position);
        };

        const handleLivestreamClose = () => {
          setShowLivestream(false);
        };

        const calculateMainContentStyle = () => {
          if (!showLivestream) return {};
          
          const rightEdge = window.innerWidth - livestreamPosition.x;
          const marginRight = Math.max(rightEdge, livestreamSize.width) + 20; // 20px extra padding
          
          return {
            marginRight: `${marginRight}px`,
            maxWidth: `calc(100% - ${marginRight}px)`,
          };
        };

        return (
          <div className="min-h-screen bg-gray-100 flex flex-col relative" style={{fontFamily: settings.theme.font}}>
            <header className="shadow-md sticky top-0 z-10" style={{backgroundColor: settings.theme.headerBgColor}}>
              <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                <h1 className="text-3xl font-bold" style={{color: settings.theme.headerTextColor}}>
                  {projectInfo.projectName} Manuel Kura Çekimi
                </h1>
                <div>
                  <button
                    onClick={toggleLayout}
                    className="mr-4 text-white font-bold py-2 px-4 rounded inline-flex items-center transition-colors duration-300"
                    style={{
                      backgroundColor: settings.theme.buttonBgColor,
                      ':hover': {
                        backgroundColor: settings.theme.buttonHoverColor,
                      },
                    }}
                  >
                    <FaExchangeAlt className="mr-2" />
                    {settings.layout === 'default' ? 'Genişletilmiş Görünüm' : 
                     settings.layout === 'expanded' ? 'Tablo Görünümü' : 'Varsayılan Görünüm'}
                  </button>
                  <button
                    onClick={toggleSettings}
                    className="text-white font-bold py-2 px-4 rounded inline-flex items-center transition-colors duration-300"
                    style={{
                      backgroundColor: settings.theme.buttonBgColor,
                      ':hover': {
                        backgroundColor: settings.theme.buttonHoverColor,
                      },
                    }}
                  >
                    <FaCog className="mr-2" />
                    Ayarlar
                  </button>
                </div>
              </div>
            </header>
            <main className="flex-grow overflow-hidden">
              <div 
                className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 transition-all duration-300"
                style={calculateMainContentStyle()}
              >
                <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                  <table ref={tableRef} className="min-w-full" style={{fontFamily: settings.theme.font}}>
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        {settings.layout === 'default' ? (
                          <>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Katılımcı Sıra No</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Konut Sıra No</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Katılımcı Bilgileri</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Konut Bilgileri</th>
                          </>
                        ) : settings.layout === 'expanded' ? (
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kura Bilgileri</th>
                        ) : (
                          <>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%]">Katılımcı Sıra No</th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%]">Konut Sıra No</th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[18%]">Ad Soyad</th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]">T.C. No</th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[14%]">Başvuru Türü</th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">Blok No</th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">Daire No</th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">Oda Sayısı</th>
                            <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">Brüt Alan</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {raffleRows.map((row, index) => 
                        settings.layout === 'default' ? renderRow(row, index) : 
                        settings.layout === 'expanded' ? renderExpandedRow(row, index) : 
                        renderTabularRow(row, index)
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </main>
            <SidebarNav selectedProject={projectInfo} />
            {showLivestream && (
              <LivestreamBox 
                onResize={handleLivestreamResize} 
                onDrag={handleLivestreamDrag} 
                onClose={handleLivestreamClose}
                initialPosition={livestreamPosition}
                initialSize={livestreamSize}
              />
            )}
          </div>
        );
      };
      
      export default ManuelKuraPage;