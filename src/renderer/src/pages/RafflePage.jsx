/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-key */
import { useMemo, useState, useEffect } from 'react';
import { useTable } from 'react-table';
import { useDatabase } from '../context/DatabaseContext';
import BottomNav from '../components/BottomNav';

function RafflePage() {
    const { importedKonutData, setImportedKonutData, importedKatilimciData, setImportedKatilimciData, projectInfo } = useDatabase();

    const [settings, setSettings] = useState({
        showDelete: true,
        columnsToShow: ['siraNo', 'adSoyad', 'tc', 'odaSayisi', 'katNo', 'etap'],
        tableStyle: {
            headerBgColor: 'bg-gray-100',
            headerTextColor: 'text-gray-600',
            rowBgColor: 'bg-white',
            rowTextColor: 'text-gray-800',
            borderColor: 'border-gray-200'
        }
    });
    const [tableData, setTableData] = useState([]);
    const [currentRaffleIndex, setCurrentRaffleIndex] = useState(-1);
    const [kalanKonut, setKalanKonut] = useState(projectInfo.raffleUserCount ? projectInfo.raffleUserCount : 0);

    const [currentKatilimciNo, setCurrentKatilimciNo] = useState(null);
    const [currentKonutNo, setCurrentKonutNo] = useState(null);
    const [isAnimatingKatilimci, setIsAnimatingKatilimci] = useState(false);
    const [isAnimatingKonut, setIsAnimatingKonut] = useState(false);

    const selectKatilimci = () => {
        const randomIndex = Math.floor(Math.random() * importedKatilimciData.length);
        const selectedKatilimci = importedKatilimciData[randomIndex];
        animateKatilimciSelection(selectedKatilimci.siraNo);
        setTimeout(() => {
            setTableData(currentData => [...currentData, { ...selectedKatilimci }]);
            setCurrentRaffleIndex(tableData.length);
        }, 3000);
    };

    const animateKatilimciSelection = (selectedNumber) => {
        setIsAnimatingKatilimci(true);
        let iterations = 0;
        const maxIterations = 300;
        const intervalId = setInterval(() => {
            setCurrentKatilimciNo(Math.floor(Math.random() * importedKatilimciData.length) + 1);
            iterations++;
            if (iterations >= maxIterations) {
                clearInterval(intervalId);
                setCurrentKatilimciNo(selectedNumber);
                setIsAnimatingKatilimci(false);
            }
        }, 10);
    };

    const selectKonut = () => {
        if (currentRaffleIndex >= 0) {
            const randomIndex = Math.floor(Math.random() * importedKonutData.length);
            const selectedKonut = importedKonutData[randomIndex];
            animateKonutSelection(selectedKonut.konutSiraNo);
            setTimeout(() => {
                setTableData(currentData => {
                    const newData = [...currentData];
                    newData[currentRaffleIndex] = { ...newData[currentRaffleIndex], ...selectedKonut };
                    return newData;
                });
                setKalanKonut(kalanKonut - 1);
            }, 3000);
        }
    };

    const animateKonutSelection = (selectedNumber) => {
        setIsAnimatingKonut(true);
        let iterations = 0;
        const maxIterations = 300;
        const intervalId = setInterval(() => {
            setCurrentKonutNo(Math.floor(Math.random() * importedKonutData.length) + 1);
            iterations++;
            if (iterations >= maxIterations) {
                clearInterval(intervalId);
                setCurrentKonutNo(selectedNumber);
                setIsAnimatingKonut(false);
            }
        }, 10);
    };

    const allColumns = {
        adSoyad: { Header: "ADI SOYADI", accessor: "adSoyad" },
        asilYedek: { Header: "ASİL/YEDEK", accessor: "asilYedek" },
        basvuruKategorisi: { Header: "BAŞVURU KATEGORİSİ", accessor: "basvuruKategorisi" },
        basvuruNo: { Header: "BAŞVURU NO", accessor: "basvuruNo" },
        il: { Header: "İL", accessor: "il" },
        ilce: { Header: "İLÇE", accessor: "ilce" },
        mahalle: { Header: "MAHALLE", accessor: "mahalle" },
        siraNo: { Header: "SIRA NO", accessor: "siraNo" },
        tc: { Header: "T.C. NO", accessor: "tc" },
        bbNo: { Header: "BB NO", accessor: "bbNo" },
        blokNo: { Header: "BLOK NO", accessor: "blokNo" },
        brüt: { Header: "BRÜT", accessor: "brüt" },
        daireNo: { Header: "DAİRE NO", accessor: "daireNo" },
        etap: { Header: "ETAP", accessor: "etap" },
        katNo: { Header: "KAT", accessor: "katNo" },
        odaSayisi: { Header: "DAİRE TİPİ", accessor: "odaSayisi" },
        konutSiraNo: { Header: "KONUT SIRA NO", accessor: "konutSiraNo" }
    };

    const columns = useMemo(() => {
        const dynamicColumns = settings.columnsToShow.map(columnKey => allColumns[columnKey]);
        if (settings.showDelete) {
            dynamicColumns.push({
                Header: '',
                id: 'delete',
                Cell: ({ row }) => (
                    <span onClick={() => {/* logic to handle delete */}}>
                        {/* Render delete icon here */}
                    </span>
                )
            });
        }
        return dynamicColumns;
    }, [settings]);

    const tableInstance = useTable({ columns, data: tableData });

    const shouldRenderTable = tableData && tableData.length > 0;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        window.electron.ipcRenderer.send('get-project-info', 'kys');
        window.electron.ipcRenderer.once('project-info-response', (event, response) => {
            if (response.success) {
                setProjectInfo(response.data);

                window.electron.ipcRenderer.send('get-katilimcilar', 'kys');
                window.electron.ipcRenderer.once('get-katilimcilar-response', (event, response) => {
                    if (response.success) {
                        setImportedKatilimciData(response.data);
                    } else {
                        console.error('Failed to fetch katilimci data:', response.error);
                    }
                });

                window.electron.ipcRenderer.send('get-konutlar', 'kys');
                window.electron.ipcRenderer.once('get-konutlar-response', (event, response) => {
                    if (response.success) {
                        setImportedKonutData(response.data);
                    } else {
                        console.error('Failed to fetch konut data:', response.error);
                    }
                });

            } else {
                console.error('Failed to fetch project info:', response.error);
                setProjectInfo(null);
            }
        });
    };

    return (
        <div className="flex flex-col h-screen">
            <div className="bg-gray-200 h-44 w-full"></div>
            <div className="flex flex-1">
                <div className="w-4/6 p-4">
                    {shouldRenderTable && (
                        <table {...tableInstance.getTableProps()} className="min-w-full leading-normal">
                            <thead>
                                {tableInstance.headerGroups.map(headerGroup => (
                                    <tr {...headerGroup.getHeaderGroupProps()}>
                                        {headerGroup.headers.map(column => (
                                            <th {...column.getHeaderProps()} className={`px-6 py-3 border-b ${settings.tableStyle.headerBgColor} text-left text-xs font-semibold ${settings.tableStyle.headerTextColor} uppercase tracking-wider ${settings.tableStyle.borderColor}`}>
                                                {column.render('Header')}
                                            </th>
                                        ))}
                                        {settings.showDelete && <th className={`px-6 py-3 border-b ${settings.tableStyle.headerBgColor} ${settings.tableStyle.borderColor}`}></th>}
                                    </tr>
                                ))}
                            </thead>
                            <tbody {...tableInstance.getTableBodyProps()}>
                                {tableInstance.rows.map(row => {
                                    tableInstance.prepareRow(row);
                                    return (
                                        <tr {...row.getRowProps()}>
                                            {row.cells.map(cell => (
                                                <td {...cell.getCellProps()} className={`px-6 py-4 border-b ${settings.tableStyle.rowBgColor} text-sm ${settings.tableStyle.rowTextColor} ${settings.tableStyle.borderColor}`}>
                                                    {cell.render('Cell')}
                                                </td>
                                            ))}
                                            {settings.showDelete && (
                                                <td className={`px-6 py-4 border-b ${settings.tableStyle.rowBgColor} text-sm ${settings.tableStyle.borderColor}`}>
                                                    {/* Render delete icon here */}
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="w-2/6 bg-gray-100 border-l border-gray-300 p-4 flex flex-col items-center">
                    <div className="flex items-center justify-center space-x-4 mb-8">
                        <div className="flex flex-col items-center">
                            <div className="text-xl font-semibold mb-2">Katılımcılar</div>
                            <div className="rounded-full bg-white border border-black h-56 w-56 flex items-center justify-center">
                                <div className={isAnimatingKatilimci ? "text-5xl font-bold" : "text-l font-bold"}>
                                    {isAnimatingKatilimci ? currentKatilimciNo :
                                        <div className='text-center'>
                                            Son Çekilen Katılımcı
                                            <div className='text-3xl pt-2'>{currentKatilimciNo}</div>
                                        </div>}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-xl font-semibold mb-2">Konutlar</div>
                            <div className="rounded-full bg-white border border-black h-56 w-56 flex items-center justify-center">
                                <div className={isAnimatingKonut ? "text-5xl font-bold" : "text-l font-bold"}>
                                    {isAnimatingKonut ? currentKonutNo :
                                        <div className='text-center'>
                                            Son Çekilen Konut
                                            <div className='text-3xl pt-2'>{currentKonutNo}</div>
                                        </div>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full mt-2 bg-white p-4 border border-gray-300 rounded-lg shadow-md text-xl">
                        <div className="flex items-center mb-4">
                            <div className="font-semibold text-gray-700">Toplam Konut Kura Sayısı:</div>
                            <div className="text-gray-600 pl-4">{projectInfo.raffleUserCount}</div>
                        </div>
                        <div className="flex items-center pl-5">
                            <div className="font-semibold text-gray-700">Kalan Konut Kura Sayısı:</div>
                            <div className="text-gray-600 pl-4">{kalanKonut}</div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center space-y-4 mt-14">
                        <div className="flex items-center space-x-2 pl-3">
                            <div className="text-lg font-semibold text-gray-700">Manuel Kura:</div>
                            <button onClick={selectKatilimci} className="bg-blue-500 text-white font-bold py-2 px-6 rounded hover:bg-blue-700 focus:outline-none focus:ring focus:border-blue-300 w-28">
                                Katılımcı
                            </button>
                            <button onClick={selectKonut} className="bg-green-500 text-white font-bold py-2 px-6 rounded hover:bg-green-700 focus:outline-none focus:ring focus:border-green-300 w-28">
                                Daire
                            </button>
                        </div>

                        <div className="flex items-center space-x-2">
                            <div className="text-lg font-semibold text-gray-700">Otomatik Kura:</div>
                            <button className="bg-red-500 text-white font-bold py-2 px-6 rounded hover:bg-red-700 focus:outline-none focus:ring focus:border-red-300 w-28">
                                Başlat
                            </button>
                            <button className="bg-yellow-500 text-white font-bold py-2 px-6 rounded hover:bg-yellow-700 focus:outline-none focus:ring focus:border-yellow-300 w-28">
                                Durdur
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <BottomNav isItRafflePage={true} />
        </div>
    );
}

export default RafflePage;
