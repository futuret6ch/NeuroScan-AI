import React from 'react';
import { Activity, Cpu, Brain, Zap, HelpCircle, Eye, AlertCircle } from 'lucide-react';

export const About: React.FC = () => {
  const symptoms = [
    { name: 'Persistent Headaches', desc: 'Frequent, severe headaches that may change in pattern or worsen in the mornings.' },
    { name: 'Seizures', desc: 'Sudden onset of fits or convulsions in individuals with no previous history.' },
    { name: 'Cognitive Changes', desc: 'Difficulty concentrating, memory deficits, personality shifts, or speech problems.' },
    { name: 'Sensory Loss', desc: 'Gradual loss of sensation or movement in an arm, leg, or side of the body.' }
  ];

  const aiBenefits = [
    {
      title: 'Triage Acceleration',
      desc: 'Rapid screening flags critical anomalies immediately, lowering radiology queue times and prioritizing critical surgery cases.'
    },
    {
      title: 'Precision Localization',
      desc: 'CNN models map out pixel-level boundary masks, outlining fine tissue infiltrations that might be difficult to trace visually.'
    },
    {
      title: 'Subtle Pattern Recognition',
      desc: 'Deep learning recognizes subtle contrast shifts and micro-calcification shapes across multiple slices.'
    },
    {
      title: 'Workflow Automation',
      desc: 'Generates standardized reporting drafts including confidence interval percentages, optimizing clinical administration.'
    }
  ];

  return (
    <div className="animate-fade-in" style={{ padding: '60px 0', width: '100%' }}>
      <div className="container" style={{ maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '50px', textAlign: 'left' }}>
        
        {/* Page Header */}
        <div style={{ textAlign: 'center' }}>
          <div className="badge badge-primary" style={{ marginBottom: '16px' }}>
            <HelpCircle size={14} />
            <span>Clinical Knowledge Base</span>
          </div>
          <h2>About Brain Tumor Detection</h2>
          <p style={{ maxWidth: '640px', margin: '0 auto', color: 'var(--text-secondary)' }}>
            Understanding brain tumors, MRI diagnostics, and the role of artificial intelligence in improving clinical outcomes.
          </p>
        </div>

        {/* Section 1: Project Overview */}
        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Brain size={24} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.4rem' }}>Project Overview</h3>
          </div>
          <p style={{ fontSize: '0.975rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong>NeuroScan AI</strong> is a modern decision support tool designed to streamline MRI diagnostic workflows. By utilizing advanced convolutional neural networks (CNNs), the application assists radiologists and clinical teams in identifying, segmenting, and classifying brain tumor anomalies (Glioma, Meningioma, and Pituitary tumors). The platform provides rapid triaging, local pixel-level tumor marking, and instant electronic report drafts to optimize early detection cycles.
          </p>
        </section>

        {/* Section 2: What is a Brain Tumor & Symptoms */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
          
          {/* Column A: What is a Brain Tumor */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={22} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1.25rem' }}>What is a Brain Tumor?</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              A brain tumor is a mass or growth of abnormal cells in your brain. Brain tumors can be noncancerous (benign) or cancerous (malignant). They can start in your brain (primary brain tumors) or cancer can start in other parts of your body and spread to your brain (secondary, or metastatic, brain tumors). Early classification is crucial for determining surgical margins and chemo/radiation therapy guidelines.
            </p>
          </div>

          {/* Column B: Symptoms */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity size={22} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1.25rem' }}>Common Symptoms</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {symptoms.map((sym, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{sym.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>{sym.desc}</span>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* Section 3: Why MRI? */}
        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Eye size={24} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.4rem' }}>Why MRI (Magnetic Resonance Imaging)?</h3>
          </div>
          <p style={{ fontSize: '0.975rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Magnetic Resonance Imaging (MRI) is the gold standard modality for scanning intracranial structures. Unlike CT scans, which rely on ionizing radiation, MRI uses strong magnetic fields and radio waves to generate exceptionally detailed cross-sectional views of soft tissues. This high contrast resolution allows physicians to:
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginTop: '10px'
          }}>
            <div style={{ padding: '16px', background: 'var(--bg-subtle)', borderRadius: '8px', borderLeft: '3px solid var(--primary)' }}>
              <span style={{ fontWeight: 700, display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Tissue Contrast</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Differentiate normal gray/white matter from pathological mass density.</span>
            </div>
            <div style={{ padding: '16px', background: 'var(--bg-subtle)', borderRadius: '8px', borderLeft: '3px solid var(--primary)' }}>
              <span style={{ fontWeight: 700, display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Lesion Margins</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Clearly visualize tumor edges to assist neurosurgeons with surgical planning.</span>
            </div>
            <div style={{ padding: '16px', background: 'var(--bg-subtle)', borderRadius: '8px', borderLeft: '3px solid var(--primary)' }}>
              <span style={{ fontWeight: 700, display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Multi-Modalities</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>T1-contrast, T2, and FLAIR modalities evaluate edema and fluid boundaries.</span>
            </div>
          </div>
        </section>

        {/* Section 4: Benefits of AI Detection */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <Cpu size={24} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.4rem' }}>Clinical Benefits of AI-Assisted Screening</h3>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
            gap: '24px'
          }} className="ai-benefits-grid">
            {aiBenefits.map((benefit, idx) => (
              <div key={idx} style={{
                display: 'flex',
                gap: '16px',
                padding: '20px',
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                borderRadius: '12px'
              }}>
                <div style={{
                  background: 'var(--bg-subtle)',
                  color: 'var(--primary)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Zap size={20} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{benefit.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
      <style>{`
        @media (max-width: 480px) {
          .ai-benefits-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
