import { useState, useEffect, lazy, Suspense } from 'react';
import { Layout } from './components/Layout';
import { Detection } from './pages/Detection';
import { Report } from './pages/Report';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NotificationContainer } from './components/NotificationToast';

// Lazy load non-critical sections for performance code-splitting
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const Analytics = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })));

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
  
  // Clinical notes
  clinicalNotes?: string;
  doctorApproved?: boolean;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
}

const LoadingFallback = () => (
  <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-secondary)' }}>
    <div className="animate-spin" style={{
      width: '32px',
      height: '32px',
      border: '3px solid var(--border)',
      borderTopColor: 'var(--primary)',
      borderRadius: '50%',
      margin: '0 auto 16px auto'
    }} />
    <p style={{ fontWeight: 600 }}>Loading diagnostic module...</p>
  </div>
);

const NotFoundPage = ({ setCurrentPage }: { setCurrentPage: (page: string) => void }) => (
  <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-primary)' }}>
    <div style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <h2 style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--primary)', margin: 0 }}>404</h2>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Case Record Not Found</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
        The requested diagnostic path or file register does not exist on this network directory.
      </p>
      <button onClick={() => setCurrentPage('dashboard')} className="btn btn-primary" style={{ padding: '10px 20px' }}>
        Return to Dashboard
      </button>
    </div>
  </div>
);

function App() {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('neuroscan_token');
  });
  
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('neuroscan_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentPage, setCurrentPage] = useState<string>(() => {
    const savedToken = localStorage.getItem('neuroscan_token');
    return savedToken ? 'dashboard' : 'login';
  });

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

  const handleLoginSuccess = (userData: any, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('neuroscan_user', JSON.stringify(userData));
    localStorage.setItem('neuroscan_token', userToken);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('neuroscan_user');
    localStorage.removeItem('neuroscan_token');
    setCurrentPage('login');
  };

  const handleUpdateUser = (updatedUser: any) => {
    setUser(updatedUser);
    localStorage.setItem('neuroscan_user', JSON.stringify(updatedUser));
  };

  const handleScanComplete = (result: ScanResult & { imgUrl?: string; name: string }) => {
    setScanResult(result);
    setCurrentPage('report');
  };

  const handleSelectReport = (result: ScanResult) => {
    setScanResult(result);
    setCurrentPage('report');
  };

  const renderPage = () => {
    // Session Guard: redirect protected tabs to login if not authenticated
    const protectedPages = ['dashboard', 'detection', 'report', 'profile', 'analytics'];
    if (!token && protectedPages.includes(currentPage)) {
      return <Login onLoginSuccess={handleLoginSuccess} setCurrentPage={setCurrentPage} />;
    }

    switch (currentPage) {
      case 'login':
        return <Login onLoginSuccess={handleLoginSuccess} setCurrentPage={setCurrentPage} />;
      case 'register':
        return <Register onRegisterSuccess={handleLoginSuccess} setCurrentPage={setCurrentPage} />;
      case 'forgot-password':
        return <ForgotPassword setCurrentPage={setCurrentPage} />;
      case 'profile':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <Profile 
              user={user} 
              token={token || ''} 
              onUpdateUser={handleUpdateUser} 
              onLogout={handleLogout} 
            />
          </Suspense>
        );
      case 'dashboard':
        return (
          <Dashboard 
            user={user} 
            token={token || ''} 
            onSelectReport={handleSelectReport} 
            setCurrentPage={setCurrentPage} 
          />
        );
      case 'analytics':
        // Guard check: restrict analytics to administrators only
        if (user?.role !== 'Administrator') {
          return (
            <Dashboard 
              user={user} 
              token={token || ''} 
              onSelectReport={handleSelectReport} 
              setCurrentPage={setCurrentPage} 
            />
          );
        }
        return (
          <Suspense fallback={<LoadingFallback />}>
            <Analytics token={token || ''} />
          </Suspense>
        );
      case 'home':
        // Safe redirect to Dashboard
        return (
          <Dashboard 
            user={user} 
            token={token || ''} 
            onSelectReport={handleSelectReport} 
            setCurrentPage={setCurrentPage} 
          />
        );
      case 'detection':
        return <Detection onScanComplete={handleScanComplete} setCurrentPage={setCurrentPage} />;
      case 'report':
        return <Report scanResult={scanResult} setCurrentPage={setCurrentPage} />;
      case 'archive':
        return <Report scanResult={scanResult} setCurrentPage={setCurrentPage} initialTab="archive" />;
      default:
        // Wildecard 404 handler for unrecognized paths
        return <NotFoundPage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <ErrorBoundary>
      <Layout
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        user={user}
        onLogout={handleLogout}
      >
        {renderPage()}
      </Layout>
      <NotificationContainer />
    </ErrorBoundary>
  );
}

export default App;
