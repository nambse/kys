import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { DatabaseProvider  } from './context/DatabaseContext';
import DatabasePage from './pages/DatabasePage';
import KatilimciPage from './pages/KatilimciPage';
import KonutPage from './pages/KonutPage';
import RafflePage from './pages/RafflePage';

import './assets/index.css'

function App() {
 return (
  <DatabaseProvider>
    <Router>
      <Routes>
        <Route path="/" element={<DatabasePage />} />
        <Route path="/katilimci" element={<KatilimciPage />} />
        <Route path="/konut" element={<KonutPage />} />
        <Route path="/raffle" element={<RafflePage />} />
      </Routes>
    </Router>
  </DatabaseProvider>
  );
 }

export default App;