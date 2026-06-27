import React, { useState, useEffect } from 'react';
import { Bell, Trash2, CheckCircle, AlertTriangle, Info, ShieldAlert, ArrowLeft } from 'lucide-react';

interface NotificationLog {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface NotificationsPageProps {
  setCurrentPage?: (page: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ setCurrentPage }) => {
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('neuroscan_notifications_log');
    if (saved) {
      setNotifications(JSON.parse(saved));
    } else {
      // Seed default logs for realistic presentation
      const defaultLogs: NotificationLog[] = [
        {
          id: 'n1',
          type: 'success',
          title: 'System Deployment Active',
          message: 'NeuroScan AI Version 4.3.0 initialized successfully. All serverless workflow node routes online.',
          timestamp: new Date(Date.now() - 3600000 * 2).toLocaleString(),
          read: false
        },
        {
          id: 'n2',
          type: 'info',
          title: 'Database Synchronized',
          message: 'Seeded diagnostic parameters for Eleanor Vance successfully synchronized with local storage.',
          timestamp: new Date(Date.now() - 3600000 * 5).toLocaleString(),
          read: true
        },
        {
          id: 'n3',
          type: 'success',
          title: 'Physician Review Signed',
          message: 'Dr. Robert Carter signed and approved diagnosis for Scan ID s1001 (Glioma).',
          timestamp: new Date(Date.now() - 3600000 * 24).toLocaleString(),
          read: true
        }
      ];
      localStorage.setItem('neuroscan_notifications_log', JSON.stringify(defaultLogs));
      setNotifications(defaultLogs);
    }
  }, []);

  const handleClearAll = () => {
    localStorage.setItem('neuroscan_notifications_log', JSON.stringify([]));
    setNotifications([]);
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    localStorage.setItem('neuroscan_notifications_log', JSON.stringify(updated));
    setNotifications(updated);
  };

  return (
    <div style={{ padding: '30px 20px', maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {setCurrentPage && (
            <button 
              onClick={() => setCurrentPage('dashboard')} 
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '4px' }}
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell size={24} style={{ color: 'var(--primary)' }} /> System Notifications
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleMarkAllRead} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.825rem' }}>
            Mark All Read
          </button>
          <button onClick={handleClearAll} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.825rem', color: 'var(--error)' }}>
            <Trash2 size={14} /> Clear All
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {notifications.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Bell size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.5 }} />
            <p style={{ fontWeight: 600, margin: 0 }}>No new system notifications.</p>
            <p style={{ fontSize: '0.75rem', marginTop: '6px' }}>Diagnostic logs and clinician scheduling alerts will appear here.</p>
          </div>
        ) : (
          notifications.map((n) => {
            const icons = {
              success: <CheckCircle size={18} style={{ color: 'var(--success)' }} />,
              warning: <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />,
              info: <Info size={18} style={{ color: 'var(--primary)' }} />,
              error: <ShieldAlert size={18} style={{ color: 'var(--error)' }} />
            };

            return (
              <div 
                key={n.id} 
                className="card"
                style={{
                  padding: '16px 20px',
                  background: 'var(--bg-card)',
                  borderLeft: `4px solid ${
                    n.type === 'success' ? 'var(--success)' : 
                    n.type === 'warning' ? 'var(--warning)' : 
                    n.type === 'error' ? 'var(--error)' : 'var(--primary)'
                  }`,
                  opacity: n.read ? 0.75 : 1,
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                  transition: 'opacity 0.2s ease'
                }}
              >
                <div style={{ marginTop: '2px', flexShrink: 0 }}>{icons[n.type]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {n.title} {!n.read && <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--error)', marginLeft: '6px' }} />}
                    </h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{n.timestamp}</span>
                  </div>
                  <p style={{ margin: '6px 0 0 0', fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {n.message}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
