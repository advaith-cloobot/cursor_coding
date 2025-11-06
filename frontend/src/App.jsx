import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Home from './pages/Home';
import LockerDetail from './pages/LockerDetail';
import TransactionLedger from './pages/TransactionLedger';
import LockerDashboard from './pages/LockerDashboard';
import AssetDetailPage from './pages/AssetDetailPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/locker/:lockerId" element={<LockerDetail />} />
          <Route path="/locker/:lockerId/dashboard" element={<LockerDashboard />} />
          <Route path="/asset/:assetId" element={<AssetDetailPage />} />
          <Route path="/transactions" element={<TransactionLedger />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

