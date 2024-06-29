import { createContext, useState, useContext } from 'react';

const DatabaseContext = createContext();

export const useDatabase = () => useContext(DatabaseContext);

export const DatabaseProvider = ({ children }) => {
    const [projectInfo, setProjectInfo] = useState(null);
    const [katilimciData, setKatilimciData] = useState([]);
    const [konutData, setKonutData] = useState([]);
    const [settingsData, setSettingsData] = useState([]);
    const [projects, setProjects] = useState([]);

    const value = {
        projectInfo,
        setProjectInfo,
        katilimciData,
        setKatilimciData,
        konutData,
        setKonutData,
        settingsData,
        setSettingsData,
        projects,
        setProjects
    };

    return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
};
