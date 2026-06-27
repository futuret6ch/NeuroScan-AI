import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[CRITICAL] - Interface caught runtime error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-app)',
          padding: '24px',
          fontFamily: 'Inter, system-ui, sans-serif',
          color: 'var(--text-primary)'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            padding: '40px 30px',
            borderRadius: '24px',
            maxWidth: '480px',
            width: '100%',
            textAlign: 'center',
            boxShadow: 'var(--shadow-lg)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--error)'
            }}>
              <AlertCircle size={32} />
            </div>

            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Interface Diagnostic Fault</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                The NeuroScan AI diagnostic UI client encountered an unexpected runtime failure. The console logs have recorded this event.
              </p>
            </div>

            {this.state.error && (
              <div style={{
                width: '100%',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                color: 'var(--error)',
                textAlign: 'left',
                maxHeight: '100px',
                overflowY: 'auto'
              }}>
                {this.state.error.toString()}
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                fontSize: '0.875rem'
              }}
            >
              <RefreshCw size={14} /> Reload Interface
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
