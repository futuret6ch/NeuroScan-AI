import React, { useState } from 'react';
import { Brain, Lock, Mail, Eye, EyeOff, ShieldAlert, Key } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: any, token: string) => void;
  setCurrentPage: (page: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, setCurrentPage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid email or password.');
      }

      onLoginSuccess(data.user, data.token);
      setCurrentPage('dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to connect to the authentication server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '40px 20px',
      background: 'radial-gradient(circle at 10% 20%, rgba(21, 101, 192, 0.05) 0%, transparent 40%)'
    }}>
      <div className="card animate-fade-in" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '40px 32px',
        background: 'var(--bg-card)',
        borderRadius: '24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Logo and Intro */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'var(--primary)',
            color: '#FFFFFF',
            padding: '12px',
            borderRadius: '16px',
            display: 'flex',
            boxShadow: '0 8px 24px rgba(21, 101, 192, 0.25)'
          }}>
            <Brain size={28} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-primary)', margin: 0 }}>
              NeuroScan <span style={{ color: 'var(--primary)' }}>AI</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Secure Clinical Brain Screening Platform
            </p>
          </div>
        </div>

        {/* Diagnostic error box */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            textAlign: 'left'
          }}>
            <ShieldAlert size={18} style={{ color: 'var(--error)', flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '0.825rem', color: 'var(--error)', fontWeight: 600 }}>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Email */}
          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Hospital Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                placeholder="doctor@clinic.org or patient@clinic.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 38px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'var(--transition)'
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Secure Password
              </label>
              <button
                type="button"
                onClick={() => setCurrentPage('forgot-password')}
                style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}
              >
                Forgot Password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 38px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'var(--transition)'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '14px',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              fontSize: '0.95rem',
              fontWeight: 700,
              marginTop: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border)', paddingTop: '18px' }}>
          New patient or provider?{' '}
          <button
            onClick={() => setCurrentPage('register')}
            style={{ color: 'var(--primary)', fontWeight: 700 }}
          >
            Create an Account
          </button>
        </div>

        {/* Demo Credentials Alert Tip */}
        <div style={{
          background: 'var(--bg-subtle)',
          borderRadius: '12px',
          padding: '12px',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          textAlign: 'left',
          border: '1px dashed var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <strong style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Key size={12} /> Seeded Demo Logins:
          </strong>
          <span>• Patient: <code>patient@clinic.org</code> / <code>password123</code></span>
          <span>• Doctor: <code>doctor@clinic.org</code> / <code>password123</code></span>
          <span>• Admin: <code>admin@clinic.org</code> / <code>password123</code></span>
        </div>

      </div>
    </div>
  );
};
