import React, { useState } from 'react';
import { Brain, Mail, ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ForgotPasswordProps {
  setCurrentPage: (page: string) => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ setCurrentPage }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetCompleted, setResetCompleted] = useState(false);

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Email lookup failed.');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to request reset link.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Reset failed.');
      }

      setResetCompleted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.');
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
      background: 'radial-gradient(circle at 50% 50%, rgba(21, 101, 192, 0.04) 0%, transparent 50%)'
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
        
        {/* Navigation back */}
        <button
          onClick={() => setCurrentPage('login')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            alignSelf: 'flex-start',
            fontWeight: 700
          }}
        >
          <ArrowLeft size={14} /> Back to Sign In
        </button>

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'var(--primary)',
            color: '#FFFFFF',
            padding: '12px',
            borderRadius: '16px',
            display: 'flex'
          }}>
            <Brain size={28} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--text-primary)', margin: 0 }}>
              Credentials Recovery
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Restore access to your NeuroScan profile
            </p>
          </div>
        </div>

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
            <ShieldAlert size={18} style={{ color: 'var(--error)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.825rem', color: 'var(--error)', fontWeight: 600 }}>{error}</span>
          </div>
        )}

        {/* State 1: Forgot Password Form */}
        {!success && !resetCompleted && (
          <form onSubmit={handleSendLink} style={{ display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'left' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Account Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  required
                  placeholder="doctor@clinic.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 38px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem'
                  }}
                />
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loading ? 'Processing...' : 'Send Recovery Token'}
            </button>
          </form>
        )}

        {/* State 2: Simulated Reset Password Form */}
        {success && !resetCompleted && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
            <div style={{
              background: 'rgba(52, 211, 153, 0.08)',
              border: '1px solid rgba(52, 211, 153, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <CheckCircle2 size={20} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block' }}>Token Issued (Demo Mode)</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  A secure recovery token has been initialized for <code>{email}</code>. You can reset your password immediately below.
                </span>
              </div>
            </div>

            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Define New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="New Secure Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem'
                  }}
                />
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {loading ? 'Updating Password...' : 'Save New Password'}
              </button>
            </form>
          </div>
        )}

        {/* State 3: Password Reset Successful */}
        {resetCompleted && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <CheckCircle2 size={48} style={{ color: 'var(--success)' }} />
            <div>
              <strong style={{ fontSize: '1rem', color: 'var(--text-primary)', display: 'block' }}>Password Restored Successfully</strong>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                Your clinical security credentials have been updated. You can now log in using your new password.
              </p>
            </div>
            <button
              onClick={() => setCurrentPage('login')}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', borderRadius: '10px' }}
            >
              Sign In Now
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
