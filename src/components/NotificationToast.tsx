import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

// Global dispatcher helper
export const notify = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
  const event = new CustomEvent('neuroscan-notification', {
    detail: { type, title, message, id: Math.random().toString(36).substring(2, 9) }
  });
  window.dispatchEvent(event);
};

export const NotificationContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleNewNotification = (e: Event) => {
      const detail = (e as CustomEvent).detail as ToastMessage;
      setToasts(prev => [...prev, detail]);
      
      // Auto dismiss after 4 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== detail.id));
      }, 4000);
    };

    window.addEventListener('neuroscan-notification', handleNewNotification);
    return () => {
      window.removeEventListener('neuroscan-notification', handleNewNotification);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      maxWidth: '360px',
      width: '100%',
      pointerEvents: 'none'
    }}>
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle size={18} style={{ color: 'var(--success)' }} />,
          error: <AlertCircle size={18} style={{ color: 'var(--error)' }} />,
          warning: <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />,
          info: <Info size={18} style={{ color: 'var(--primary)' }} />
        };

        const bgColors = {
          success: 'rgba(52, 211, 153, 0.08)',
          error: 'rgba(239, 68, 68, 0.08)',
          warning: 'rgba(245, 158, 11, 0.08)',
          info: 'rgba(99, 102, 241, 0.08)'
        };

        const borders = {
          success: '1px solid rgba(52, 211, 153, 0.2)',
          error: '1px solid rgba(239, 68, 68, 0.2)',
          warning: '1px solid rgba(245, 158, 11, 0.2)',
          info: '1px solid rgba(99, 102, 241, 0.2)'
        };

        return (
          <div
            key={toast.id}
            style={{
              display: 'flex',
              gap: '12px',
              background: 'var(--bg-card)',
              backgroundColor: bgColors[toast.type],
              border: borders[toast.type],
              borderRadius: '12px',
              padding: '14px 16px',
              boxShadow: 'var(--shadow-md)',
              backdropFilter: 'blur(16px)',
              pointerEvents: 'auto',
              animation: 'slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              textAlign: 'left'
            }}
          >
            <div style={{ flexShrink: 0, marginTop: '2px' }}>
              {icons[toast.type]}
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.825rem', fontWeight: 800, color: 'var(--text-primary)' }}>{toast.title}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{toast.message}</span>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '2px',
                flexShrink: 0,
                alignSelf: 'flex-start'
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
