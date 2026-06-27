import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Detection } from './pages/Detection';
import { Report } from './pages/Report';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Dashboard } from './pages/Dashboard';

interface ScanResult {
  hasTumor: boolean;
  type: string;
  confidence: number;
  location: { x: number; y: number; r: number } | null;
  recommendation: string;
  findings: string;
  imgUrl?: string;
  name?: string;
  
  // Custom metadata fields saved in history
  date?: string;
  time?: string;
  patientName?: string;
  patientAge?: string;
  patientGender?: string;
  doctorName?: string;
  hospitalName?: string;
  scanId?: string;
  duration?: string;
  resolution?: string;
  model?: string;
  dataset?: string;
  engine?: string;
  symptoms?: string;
  nextStep?: string;
  specialist?: string;
  description?: string;
  riskLevel?: 'Low' | 'Medium' | 'High';
  fileName?: string;
  fileSize?: string;
}

function App() {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  // Sync Dark/Light mode theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleScanComplete = (result: ScanResult & { imgUrl?: string; name: string }) => {
    setScanResult(result);
    setCurrentPage('report');
  };

  const handleSelectReport = (result: ScanResult) => {
    setScanResult(result);
    setCurrentPage('report');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onSelectReport={handleSelectReport} setCurrentPage={setCurrentPage} />;
      case 'home':
        return <Home setCurrentPage={setCurrentPage} />;
      case 'detection':
        return <Detection onScanComplete={handleScanComplete} setCurrentPage={setCurrentPage} />;
      case 'report':
        return <Report scanResult={scanResult} setCurrentPage={setCurrentPage} />;
      case 'about':
        return <About />;
      case 'contact':
        return <Contact />;
      default:
        return <Dashboard onSelectReport={handleSelectReport} setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;
