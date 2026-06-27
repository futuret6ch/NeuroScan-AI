import React, { useState, useEffect } from 'react';
import { 
  Brain, Sun, Moon, Menu, X, Shield, Mail, Phone, MapPin, Bell, 
  Settings, HelpCircle, LogOut, User, Sliders, CheckCheck, Trash2,
  CheckCircle, AlertTriangle, Info, ShieldAlert
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  user: any;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  currentPage,
  setCurrentPage,
  darkMode,
  setDarkMode,
  user,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Load custom notifications from localStorage or seed defaults
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('neuroscan_notifications_log');
    if (saved) {
      setNotifications(JSON.parse(saved));
    } else {
      const defaultLogs = [
        { id: 'n1', type: 'success', title: 'MRI Analysis Complete', message: 'MRI scan analysis finished successfully.', read: false, timestamp: '10m ago' },
        { id: 'n2', type: 'success', title: 'Medical Report Generated', message: 'Diagnosis approved by clinic supervisor.', read: false, timestamp: '1h ago' },
        { id: 'n3', type: 'info', title: 'Recent AI Scan', message: 'Model verified case telemetry s1001.', read: true, timestamp: '2h ago' },
        { id: 'n4', type: 'warning', title: 'System Alert', message: 'Offline detection fallback node active.', read: true, timestamp: '1d ago' },
        { id: 'n5', type: 'info', title: 'Report Downloaded', message: 'Diagnostic report sheet exported as PDF.', read: true, timestamp: '2d ago' }
      ];
      localStorage.setItem('neuroscan_notifications_log', JSON.stringify(defaultLogs));
      setNotifications(defaultLogs);
    }
  }, []);

  const saveNotifications = (updated: any[]) => {
    setNotifications(updated);
    localStorage.setItem('neuroscan_notifications_log', JSON.stringify(updated));
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const handleClearAll = () => {
    saveNotifications([]);
  };

  const navItems = user ? [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'detection', label: 'AI Detection' },
    { id: 'report', label: 'Medical Reports' }
  ] : [
    { id: 'login', label: 'Sign In' }
  ];

  const handleNavClick = (pageId: string) => {
    setCurrentPage(pageId);
    setMobileMenuOpen(false);
    setNotificationsOpen(false);
    setProfileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header / Navbar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        transition: 'var(--transition)'
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '80px'
        }}>
          {/* Logo */}
          <div 
            onClick={() => handleNavClick(user ? 'dashboard' : 'login')} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <div style={{
              background: 'var(--primary)',
              color: '#FFFFFF',
              padding: '10px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(21, 101, 192, 0.2)'
            }}>
              <Brain size={24} />
            </div>
            <div>
              <span style={{ 
                fontFamily: 'var(--font-display)', 
                fontWeight: 800, 
                fontSize: '1.4rem', 
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                display: 'block',
                lineHeight: 1
              }}>
                NeuroScan <span style={{ color: 'var(--primary)' }}>AI</span>
              </span>
              <span style={{ 
                fontSize: '0.675rem', 
                color: 'var(--text-muted)', 
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginTop: '2px',
                display: 'block'
              }}>
                Brain Tumor Screen
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav style={{ display: 'none', alignItems: 'center', gap: '32px' }} className="desktop-nav">
            <ul style={{ display: 'flex', listStyle: 'none', gap: '28px', margin: 0, padding: 0 }}>
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavClick(item.id)}
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      color: currentPage === item.id ? 'var(--primary)' : 'var(--text-secondary)',
                      position: 'relative',
                      padding: '8px 0',
                      transition: 'var(--transition)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {item.label}
                    {currentPage === item.id && (
                      <span style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        height: '2px',
                        background: 'var(--primary)',
                        borderRadius: '2px'
                      }} />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Tools Area: Theme Toggle, Notification Bell, Profile Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative' }}>
            
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle Dark Mode"
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                padding: '10px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'var(--transition)',
                cursor: 'pointer'
              }}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notification Bell with Dropdown */}
            {user && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    setProfileOpen(false);
                  }}
                  aria-label="View Notifications"
                  style={{
                    position: 'relative',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    padding: '10px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'var(--transition)',
                    cursor: 'pointer'
                  }}
                >
                  <Bell size={18} />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      background: 'var(--error)',
                      color: '#FFFFFF',
                      borderRadius: '50%',
                      width: '15px',
                      height: '15px',
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '50px',
                    right: 0,
                    width: '320px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 100,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {/* Dropdown Header */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--border)',
                      background: 'var(--bg-subtle)'
                    }}>
                      <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        Notifications ({notifications.filter(n => !n.read).length} unread)
                      </span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={handleMarkAllRead} 
                          title="Mark all read"
                          style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                        >
                          <CheckCheck size={14} />
                        </button>
                        <button 
                          onClick={handleClearAll} 
                          title="Clear all"
                          style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Dropdown List */}
                    <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          No notifications.
                        </div>
                      ) : (
                        notifications.map((n) => {
                          const icon = n.type === 'success' ? <CheckCircle size={14} style={{ color: 'var(--success)' }} /> :
                                       n.type === 'warning' ? <AlertTriangle size={14} style={{ color: 'var(--warning)' }} /> :
                                       n.type === 'error' ? <ShieldAlert size={14} style={{ color: 'var(--error)' }} /> :
                                       <Info size={14} style={{ color: 'var(--primary)' }} />;
                          return (
                            <div 
                              key={n.id} 
                              onClick={() => {
                                const updated = notifications.map(x => x.id === n.id ? { ...x, read: true } : x);
                                saveNotifications(updated);
                              }}
                              style={{
                                display: 'flex',
                                gap: '10px',
                                padding: '12px 16px',
                                borderBottom: '1px solid var(--border)',
                                cursor: 'pointer',
                                background: n.read ? 'transparent' : 'rgba(99, 102, 241, 0.04)',
                                transition: 'background 0.15s ease',
                                textAlign: 'left'
                              }}
                            >
                              <div style={{ marginTop: '2px' }}>{icon}</div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ fontSize: '0.8rem', fontWeight: n.read ? 600 : 800, color: 'var(--text-primary)' }}>{n.title}</span>
                                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{n.timestamp}</span>
                                </div>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.725rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>{n.message}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Dropdown Footer */}
                    <button 
                      onClick={() => {
                        setNotificationsOpen(false);
                        setCurrentPage('report');
                      }}
                      style={{
                        padding: '10px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textAlign: 'center',
                        border: 'none',
                        background: 'var(--bg-subtle)',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        borderTop: '1px solid var(--border)',
                        width: '100%',
                        transition: 'color 0.15s ease'
                      }}
                    >
                      View All Notifications
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Profile Avatar with Dropdown */}
            {user && (
              <div style={{ position: 'relative' }}>
                <div
                  onClick={() => {
                    setProfileOpen(!profileOpen);
                    setNotificationsOpen(false);
                  }}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: '#FFFFFF',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: '2px solid var(--border)',
                    overflow: 'hidden',
                    userSelect: 'none'
                  }}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="Profile avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>

                {/* Profile Dropdown */}
                {profileOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '50px',
                    right: 0,
                    width: '200px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 100,
                    padding: '8px 0',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <button 
                      onClick={() => handleNavClick('profile')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 16px',
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <User size={16} style={{ color: 'var(--primary)' }} /> My Profile
                    </button>
                    <button 
                      onClick={() => { setProfileOpen(false); alert('Account Settings Simulation.'); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 16px',
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <Settings size={16} style={{ color: 'var(--text-muted)' }} /> Account Settings
                    </button>
                    <button 
                      onClick={() => { setProfileOpen(false); alert('Preferences configuration.'); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 16px',
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <Sliders size={16} style={{ color: 'var(--text-muted)' }} /> Preferences
                    </button>
                    <button 
                      onClick={() => { setProfileOpen(false); alert('Help Center & Documentation.'); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 16px',
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <HelpCircle size={16} style={{ color: 'var(--text-muted)' }} /> Help
                    </button>
                    <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
                    <button 
                      onClick={() => {
                        setProfileOpen(false);
                        onLogout();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 16px',
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        color: 'var(--error)',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Actions Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="hamburger-btn"
              style={{
                color: 'var(--text-primary)',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '80px',
            left: 0,
            width: '100%',
            background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border)',
            padding: '20px 24px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 40,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px', padding: 0, margin: 0 }}>
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavClick(item.id)}
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      color: currentPage === item.id ? 'var(--primary)' : 'var(--text-secondary)',
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 0',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>

      {/* Hospital Footer */}
      <footer style={{
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        padding: '60px 0 30px 0',
        marginTop: 'auto',
        transition: 'var(--transition)'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '40px',
            marginBottom: '40px'
          }}>
            {/* Column 1: Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  background: 'var(--primary)',
                  color: '#FFFFFF',
                  padding: '6px',
                  borderRadius: '8px',
                  display: 'flex'
                }}>
                  <Brain size={18} />
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                  NeuroScan <span style={{ color: 'var(--primary)' }}>AI</span>
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Advanced deep learning technology integrated with clinical MRI screening to support neuro-oncologists with fast, high-accuracy early detection and analysis.
              </p>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <Shield size={14} style={{ color: 'var(--success)' }} />
                <span>HIPAA Compliant & Secure Image Processing</span>
              </div>
            </div>

            {/* Column 2: Navigation links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
                Quick Links
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', padding: 0, margin: 0, fontSize: '0.9rem' }}>
                {navItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavClick(item.id)}
                      style={{ color: 'var(--text-secondary)', fontWeight: 500 }}
                      className="footer-link-hover"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Contact details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
                Hospital HQ
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0, margin: 0, fontSize: '0.9rem' }}>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <MapPin size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <span>Medical Plaza Dr, Suite 402, Boston, MA 02115</span>
                </li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <Phone size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <span>+1 (555) 019-2834</span>
                </li>
                <li style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <Mail size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <span>oncology@neuroscan-ai.com</span>
                </li>
              </ul>
            </div>
          </div>

          <hr style={{ border: 0, borderTop: '1px solid var(--border)', marginBottom: '30px' }} />

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '0.825rem',
            color: 'var(--text-muted)'
          }}>
            <span>© {new Date().getFullYear()} NeuroScan AI. All rights reserved.</span>
            <div style={{ display: 'flex', gap: '20px' }}>
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#medical-disclaimer">Medical Disclaimer</a>
            </div>
          </div>
          
          <p style={{ 
            fontSize: '0.75rem', 
            color: 'var(--text-muted)', 
            marginTop: '20px', 
            textAlign: 'center',
            lineHeight: 1.5,
            border: '1px solid var(--border)',
            padding: '12px',
            borderRadius: '8px',
            background: 'var(--bg-subtle)'
          }}>
            <strong>Important Medical Disclaimer:</strong> NeuroScan AI is an artificial intelligence decision support screening system designed to assist healthcare professionals. It does not replace professional clinical evaluation, MRI interpretation by a certified radiologist, or medical consultation.
          </p>
        </div>
      </footer>

      {/* Add layout style fixes for responsive navigation */}
      <style>{`
        @media (min-width: 769px) {
          .desktop-nav {
            display: flex !important;
          }
          .hamburger-btn {
            display: none !important;
          }
        }
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .hamburger-btn {
            display: flex !important;
          }
        }
        .footer-link-hover:hover {
          color: var(--primary) !important;
          transform: translateX(4px);
        }
        .footer-link-hover {
          transition: var(--transition);
        }
      `}</style>
    </div>
  );
};
