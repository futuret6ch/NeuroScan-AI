import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, ShieldAlert } from 'lucide-react';

export const Contact: React.FC = () => {
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSubject, setFormSubject] = useState('General Consultation');
  const [formMessage, setFormMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formName && formEmail && formMessage) {
      setIsSubmitted(true);
      // Reset form
      setFormName('');
      setFormEmail('');
      setFormMessage('');
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '60px 0', width: '100%' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        
        {/* Title Header */}
        <div style={{ textAlign: 'center' }}>
          <div className="badge badge-primary" style={{ marginBottom: '16px' }}>
            <span>Connect With Us</span>
          </div>
          <h2>Hospital Contacts & Support</h2>
          <p style={{ maxWidth: '640px', margin: '0 auto', color: 'var(--text-secondary)' }}>
            Have questions about clinical licensing, medical AI accuracy, or integration requirements? Our administration is here to assist.
          </p>
        </div>

        {/* Main Columns Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '30px',
          textAlign: 'left'
        }}>
          {/* Column 1: Hospital Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '1.25rem' }}>NeuroScan Headquarters</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                NeuroScan AI is headquartered inside the Boston Medical District, providing active technical integration support for medical systems worldwide.
              </p>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px', padding: 0, margin: 0, fontSize: '0.9rem' }}>
                <li style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <MapPin size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <span style={{ display: 'block', fontWeight: 600 }}>Physical Address</span>
                    <span style={{ color: 'var(--text-secondary)' }}>Medical Plaza Dr, Suite 402, Boston, MA 02115</span>
                  </div>
                </li>
                <li style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <Phone size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <span style={{ display: 'block', fontWeight: 600 }}>Helpline Phone</span>
                    <span style={{ color: 'var(--text-secondary)' }}>+1 (555) 019-2834 (Mon - Fri, 8AM - 6PM EST)</span>
                  </div>
                </li>
                <li style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <Mail size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <span style={{ display: 'block', fontWeight: 600 }}>Clinical Inquiries</span>
                    <span style={{ color: 'var(--text-secondary)' }}>oncology@neuroscan-ai.com</span>
                  </div>
                </li>
                <li style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <Clock size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <span style={{ display: 'block', fontWeight: 600 }}>Technical Support Hours</span>
                    <span style={{ color: 'var(--text-secondary)' }}>24/7 Server Maintenance Support Line for Enterprise APIs</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Compliance Banner */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start'
            }}>
              <ShieldAlert size={20} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>Notice to Patient Inquiries</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                  Please do not transmit personal protected MRI images or clinical records via the contact inquiry form. Contact our oncology coordinators directly through secure DICOM portals.
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Inquiry Form */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Send Clinical Inquiry</h3>
            
            {isSubmitted ? (
              <div className="animate-fade-in" style={{
                background: 'var(--success-bg)',
                border: '1.5px solid var(--success)',
                borderRadius: '10px',
                padding: '24px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                height: '100%',
                justifyContent: 'center'
              }}>
                <CheckCircle2 size={48} style={{ color: 'var(--success)' }} />
                <div>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '6px' }}>Inquiry Transmitted Successfully</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    Thank you. Your message has been encrypted and routed to our technical support desk. An oncology representative will follow up within 24 business hours.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name / Medical License ID</label>
                  <input 
                    type="text" 
                    required 
                    value={formName} 
                    onChange={(e) => setFormName(e.target.value)} 
                    placeholder="e.g. Dr. Jordan Reed"
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-subtle)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      transition: 'var(--transition)'
                    }}
                    className="input-focus-effect"
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Professional Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={formEmail} 
                    onChange={(e) => setFormEmail(e.target.value)} 
                    placeholder="e.g. j.reed@hospital.org"
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-subtle)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      transition: 'var(--transition)'
                    }}
                    className="input-focus-effect"
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Subject Area</label>
                  <select 
                    value={formSubject} 
                    onChange={(e) => setFormSubject(e.target.value)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-subtle)',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                  >
                    <option value="General Consultation">General Consultation</option>
                    <option value="AI Engine API Access">AI Engine API Integration</option>
                    <option value="DICOM System Syncing">DICOM Server Configuration</option>
                    <option value="Billing & Licensing">Hospital Licensing</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Message Description</label>
                  <textarea 
                    required 
                    rows={4}
                    value={formMessage} 
                    onChange={(e) => setFormMessage(e.target.value)} 
                    placeholder="Describe your inquiry details here..."
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-subtle)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      resize: 'vertical',
                      transition: 'var(--transition)'
                    }}
                    className="input-focus-effect"
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '12px', marginTop: '4px' }}>
                  <Send size={16} /> Submit Secure Inquiry
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Custom CSS Stylized Google Map Card */}
        <div>
          <h3 style={{ fontSize: '1.25rem', textAlign: 'left', marginBottom: '16px' }}>Office Location Map</h3>
          <div className="card" style={{
            height: '320px',
            background: 'var(--bg-subtle)',
            borderRadius: '16px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Map Grid Gridlines background */}
            <div style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.25,
              backgroundImage: 'linear-gradient(to right, var(--primary) 1px, transparent 1px), linear-gradient(to bottom, var(--primary) 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }} />

            {/* Stylized water / park outlines */}
            <div style={{
              position: 'absolute',
              top: '20%',
              left: '10%',
              width: '240px',
              height: '140px',
              background: 'var(--accent-light)',
              borderRadius: '60px',
              transform: 'rotate(-25deg)',
              opacity: 0.4
            }} />
            
            <div style={{
              position: 'absolute',
              bottom: '15%',
              right: '8%',
              width: '300px',
              height: '180px',
              background: 'rgba(16, 185, 129, 0.05)',
              borderRadius: '80px',
              transform: 'rotate(15deg)'
            }} />

            {/* Map Streets roads */}
            <div style={{ position: 'absolute', left: '50%', top: 0, width: '4px', height: '100%', background: 'var(--border)', opacity: 0.7 }} />
            <div style={{ position: 'absolute', top: '55%', left: 0, width: '100%', height: '4px', background: 'var(--border)', opacity: 0.7 }} />
            <div style={{ position: 'absolute', left: '25%', top: 0, width: '2px', height: '100%', background: 'var(--border)', opacity: 0.5, transform: 'rotate(45deg)' }} />
            
            {/* Map Marker Bouncing hospital pin */}
            <div style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 5,
              animation: 'bounce-pin 2s infinite ease-in-out'
            }}>
              <div style={{
                background: 'var(--primary)',
                color: '#FFFFFF',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                boxShadow: '0 4px 12px rgba(21, 101, 192, 0.4)',
                border: '2px solid #FFFFFF'
              }}>
                <MapPin size={24} />
              </div>
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginTop: '6px',
                boxShadow: 'var(--shadow-sm)',
                whiteSpace: 'nowrap'
              }}>
                NeuroScan AI HQ (Boston Clinical)
              </div>
            </div>

            {/* Scale indicator overlay */}
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              background: 'rgba(0, 0, 0, 0.6)',
              color: '#FFFFFF',
              fontSize: '0.675rem',
              padding: '2px 6px',
              borderRadius: '3px',
              fontFamily: 'var(--mono)'
            }}>
              Map scale: 50m | GPS: 42.3601° N, 71.0589° W
            </div>
          </div>
        </div>

      </div>
      <style>{`
        .input-focus-effect:focus {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 3px var(--accent-light);
        }
        @keyframes bounce-pin {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
};
