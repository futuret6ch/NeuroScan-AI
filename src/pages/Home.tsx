import React from 'react';
import { ArrowRight, ShieldCheck, Zap, Award, FileSpreadsheet, Eye, Cpu, Activity } from 'lucide-react';

interface HomeProps {
  setCurrentPage: (page: string) => void;
}

export const Home: React.FC<HomeProps> = ({ setCurrentPage }) => {
  const stats = [
    { value: '99.4%', label: 'AI Model Accuracy' },
    { value: '< 10s', label: 'Screening Time' },
    { value: '15,000+', label: 'MRIs Processed' },
    { value: '100%', label: 'Data Encryption' }
  ];

  const features = [
    {
      icon: <Zap size={28} style={{ color: 'var(--primary)' }} />,
      title: 'Fast Detection',
      desc: 'Complete analysis of multi-axial MRI scans in under 10 seconds, helping doctors make rapid triage decisions.'
    },
    {
      icon: <Award size={28} style={{ color: 'var(--primary)' }} />,
      title: 'High Accuracy',
      desc: 'Deep learning neural network trained on over 50,000 clinically validated datasets achieves a 99.4% AUC score.'
    },
    {
      icon: <Eye size={28} style={{ color: 'var(--primary)' }} />,
      title: 'MRI Analysis',
      desc: 'Supports axial, sagittal, and coronal T1-weighted, T2-weighted, and FLAIR MRI scan modalities.'
    },
    {
      icon: <Cpu size={28} style={{ color: 'var(--primary)' }} />,
      title: 'AI Assisted Screening',
      desc: 'Highlights potential anomalous areas and segments tumor mass structures automatically for radiologist review.'
    },
    {
      icon: <FileSpreadsheet size={28} style={{ color: 'var(--primary)' }} />,
      title: 'Download Medical Reports',
      desc: 'Generates structured, professional clinical PDF reports including confidence gauges and radiology summaries.'
    },
    {
      icon: <ShieldCheck size={28} style={{ color: 'var(--primary)' }} />,
      title: 'Secure Image Processing',
      desc: 'All data is processed strictly in compliance with HIPAA privacy standards. Your uploads are fully sandboxed.'
    }
  ];

  const workflowSteps = [
    { id: 1, label: 'Upload MRI', desc: 'Drag & drop your DICOM/PNG/JPG MRI scans securely.' },
    { id: 2, label: 'AI Processing', desc: 'Neural network scans cross-sectional brain images.' },
    { id: 3, label: 'Tumor Detection', desc: 'Identify benign, malignant, or normal tissues.' },
    { id: 4, label: 'Confidence Score', desc: 'Calculate AI confidence interval percentage.' },
    { id: 5, label: 'Medical Report', desc: 'Download fully structured diagnosis reports.' }
  ];

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      {/* Hero Section */}
      <section className="bg-grid-pattern" style={{
        padding: '80px 0',
        borderBottom: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow Effects */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '5%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(66, 165, 245, 0.15) 0%, transparent 70%)',
          zIndex: 1,
          pointerEvents: 'none'
        }} />
        
        <div className="container" style={{
          position: 'relative',
          zIndex: 2,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          alignItems: 'center',
          gap: '48px'
        }}>
          {/* Hero Left Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
            <div className="badge badge-primary">
              <Activity size={14} />
              <span>Next-Gen Diagnostic Support</span>
            </div>
            <h1 style={{ 
              fontSize: 'clamp(2.5rem, 5vw, 3.75rem)', 
              fontWeight: 800,
              color: 'var(--text-primary)',
              lineHeight: 1.15
            }}>
              AI-Powered <br />
              <span style={{ 
                background: 'linear-gradient(to right, var(--primary), var(--accent))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Brain Tumor
              </span> <br />
              Detection System
            </h1>
            <p style={{ 
              fontSize: '1.15rem', 
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: '540px'
            }}>
              Empowering neurologists and radiologists with clinically-focused deep learning tools. Detect, segment, and draft reports on brain tumor anomalies in under 10 seconds.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '10px' }}>
              <button 
                onClick={() => setCurrentPage('detection')} 
                className="btn btn-primary"
                style={{ padding: '14px 28px' }}
              >
                Upload MRI Scan <ArrowRight size={18} />
              </button>
              <button 
                onClick={() => setCurrentPage('about')} 
                className="btn btn-outline"
                style={{ padding: '14px 28px' }}
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Hero Right Visual (MRI Scanner Illustration) */}
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            {/* Holographic scanner mockup */}
            <div className="hero-illustration-wrapper" style={{
              position: 'relative',
              width: '100%',
              maxWidth: '440px',
              aspectRatio: '1',
              borderRadius: '24px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-premium)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden'
            }}>
              {/* Pulse Scanner Line */}
              <div className="scanner-line" style={{ height: '3px', top: '40%', opacity: 0.8 }} />
              
              {/* Glowing Scan Box */}
              <div style={{
                position: 'absolute',
                border: '1.5px solid var(--accent)',
                borderRadius: '50%',
                width: '60%',
                height: '60%',
                top: '20%',
                left: '20%',
                boxShadow: '0 0 30px rgba(66, 165, 245, 0.1)',
                animation: 'pulse-glow 3s infinite ease-in-out'
              }} />

              {/* Brain SVG Vector */}
              <svg 
                viewBox="0 0 100 100" 
                style={{ 
                  width: '75%', 
                  height: '75%', 
                  fill: 'none', 
                  stroke: 'var(--primary)', 
                  strokeWidth: '0.8',
                  opacity: 0.85
                }}
              >
                {/* Outlines of Left and Right Cerebral Hemispheres */}
                <path d="M 50,15 
                         C 35,15 20,25 20,45 
                         C 20,60 25,65 30,70 
                         C 32,72 35,70 38,72
                         C 40,74 42,85 50,85 
                         C 58,85 60,74 62,72
                         C 65,70 68,72 70,70 
                         C 75,65 80,60 80,45 
                         C 80,25 65,15 50,15 Z" 
                      strokeDasharray="2,2" 
                      stroke="var(--accent)"
                      strokeWidth="0.5"
                />
                <path d="M 50,15 
                         C 38,15 25,23 23,43 
                         C 22,58 27,62 31,67 
                         C 33,69 34,70 35,73
                         C 37,76 39,83 50,83
                         C 61,83 63,76 65,73
                         C 66,70 67,69 69,67
                         C 73,62 78,58 77,43
                         C 75,23 62,15 50,15 Z" 
                      strokeWidth="1.2"
                />
                {/* Ventricles / Internal details */}
                <path d="M 50,25 C 44,28 44,38 48,43 C 44,48 42,54 48,59 C 48,65 50,72 50,75" strokeWidth="0.7" />
                <path d="M 50,25 C 56,28 56,38 52,43 C 56,48 58,54 52,59 C 52,65 50,72 50,75" strokeWidth="0.7" />
                
                {/* Lobes partitioning curves */}
                <path d="M 23,45 C 32,45 38,40 45,43" strokeWidth="0.6" strokeDasharray="1,1" />
                <path d="M 77,45 C 68,45 62,40 55,43" strokeWidth="0.6" strokeDasharray="1,1" />
                <path d="M 27,58 C 36,54 42,55 48,52" strokeWidth="0.6" strokeDasharray="1,1" />
                <path d="M 73,58 C 64,54 58,55 52,52" strokeWidth="0.6" strokeDasharray="1,1" />
                
                {/* Glowing Tumor Box overlay in vector to look highly authentic */}
                <circle cx="65" cy="50" r="6" stroke="var(--error)" strokeWidth="1" fill="rgba(239, 68, 68, 0.15)" />
                <line x1="65" y1="36" x2="65" y2="44" stroke="var(--error)" strokeWidth="0.5" />
                <line x1="65" y1="56" x2="65" y2="64" stroke="var(--error)" strokeWidth="0.5" />
                <line x1="51" y1="50" x2="59" y2="50" stroke="var(--error)" strokeWidth="0.5" />
                <line x1="71" y1="50" x2="79" y2="50" stroke="var(--error)" strokeWidth="0.5" />
              </svg>
              
              {/* Scan Info Display */}
              <div style={{
                marginTop: '12px',
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                borderTop: '1px solid var(--border)',
                paddingTop: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }} />
                  <span>AI Active</span>
                </div>
                <span>Patient ID: NSC-2938</span>
                <span style={{ color: 'var(--error)', fontWeight: 600 }}>TUMOR DETECTED (98%)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        padding: '40px 0',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            textAlign: 'center'
          }}>
            {stats.map((stat, idx) => (
              <div key={idx} style={{ padding: '16px' }}>
                <h3 style={{
                  fontSize: 'clamp(2rem, 4vw, 2.75rem)',
                  color: 'var(--primary)',
                  fontWeight: 800,
                  fontFamily: 'var(--font-display)',
                  marginBottom: '4px'
                }}>
                  {stat.value}
                </h3>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '90px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div className="badge badge-primary" style={{ marginBottom: '16px' }}>
              <span>Robust System Capabilities</span>
            </div>
            <h2 style={{ marginBottom: '16px' }}>Advanced Technology Architecture</h2>
            <p style={{ maxWidth: '640px', margin: '0 auto', color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
              Engineered with medical professionals in mind, our system delivers enterprise-grade deep learning tools directly to your clinical browser.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '30px'
          }}>
            {features.map((feat, idx) => (
              <div className="card" key={idx} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                textAlign: 'left'
              }}>
                <div style={{
                  background: 'var(--bg-subtle)',
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {feat.icon}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{feat.title}</h3>
                <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="bg-grid-pattern" style={{ padding: '90px 0', background: 'var(--bg-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div className="badge badge-primary" style={{ marginBottom: '16px' }}>
              <span>Seamless Clinical Flow</span>
            </div>
            <h2>Simple, Secure AI Pipeline</h2>
            <p style={{ maxWidth: '640px', margin: '0 auto', color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
              Designed to fit directly into existing clinical screening workflows without complex local hardware.
            </p>
          </div>

          {/* Workflow Pipeline Display */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '30px',
            position: 'relative',
            marginTop: '20px'
          }} className="workflow-grid">
            {workflowSteps.map((step, idx) => (
              <div key={step.id} style={{
                flex: '1 1 200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '12px',
                position: 'relative'
              }}>
                {/* Node Number bubble */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '1.2rem',
                  boxShadow: '0 4px 12px rgba(21, 101, 192, 0.25)',
                  zIndex: 2
                }}>
                  {step.id}
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '8px' }}>{step.label}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '180px' }}>
                  {step.desc}
                </p>

                {/* Connecting arrow line on desktop */}
                {idx < workflowSteps.length - 1 && (
                  <div className="workflow-connector" style={{
                    position: 'absolute',
                    top: '24px',
                    left: 'calc(50% + 24px)',
                    width: 'calc(100% - 48px)',
                    height: '2px',
                    background: 'dashed var(--primary)',
                    borderTop: '2px dashed var(--border)',
                    zIndex: 1
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Responsive layout corrections */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.15;
            box-shadow: 0 0 30px rgba(66, 165, 245, 0.1);
          }
          50% {
            transform: scale(1.03);
            opacity: 0.35;
            box-shadow: 0 0 45px rgba(66, 165, 245, 0.25);
          }
        }
        @media (max-width: 900px) {
          .workflow-connector {
            display: none !important;
          }
          .workflow-grid {
            flex-direction: column !important;
            align-items: center !important;
          }
        }
      `}</style>
    </div>
  );
};
