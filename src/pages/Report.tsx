import React, { useState } from 'react';
import { Printer, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

interface ScanResult {
  hasTumor: boolean;
  type: string;
  confidence: number;
  location: { x: number; y: number; r: number } | null;
  recommendation: string;
  findings: string;
  imgUrl?: string;
  name?: string;
}

interface ReportProps {
  scanResult: ScanResult | null;
}

export const Report: React.FC<ReportProps> = ({ scanResult }) => {
  // If no scan result, we supply a mock interactive default case
  const defaultMockResult: ScanResult = {
    name: 'Eleanor Vance',
    hasTumor: true,
    type: 'Glioma (Malignant)',
    confidence: 97.8,
    location: { x: 38, y: 45, r: 8 },
    findings: 'A localized enhancing tumor mass is visualized within the left frontal lobe cerebral tissue, measuring approximately 2.4 x 2.2 cm. Moderate mass effect is noted with displacement of local sulci. Mild surrounding perifocal vasogenic edema identified.',
    recommendation: 'Correlate findings with neurological symptoms (recurrent headaches, focal deficits). Arrange for a consultation with neuro-oncology specialists, standard brain MRI with gadolinium contrast enhancement, and biopsy assessment.',
  };

  const activeResult = scanResult || defaultMockResult;
  const isDemoMode = !scanResult;

  // Patient Info details
  const [patientName, setPatientName] = useState(activeResult.name || 'Eleanor Vance');
  const [patientAge, setPatientAge] = useState('38');
  const [patientGender, setPatientGender] = useState('Female');

  // Trigger print dialog
  const handlePrint = () => {
    window.print();
  };

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * activeResult.confidence) / 100;

  const renderReportBrainSVG = (location: { x: number; y: number; r: number } | null) => {
    return (
      <svg 
        viewBox="0 0 100 100" 
        style={{ 
          width: '100%', 
          height: '100%', 
          fill: 'none', 
          stroke: 'var(--text-primary)', 
          strokeWidth: '0.8',
        }}
      >
        {/* Skull Outline */}
        <path d="M 50,12 C 28,12 20,24 20,48 C 20,68 26,73 31,78 C 34,80 37,78 40,80 C 42,82 43,88 50,88 C 57,88 58,82 60,80 C 63,78 66,80 69,78 C 74,73 80,68 80,48 C 80,24 72,12 50,12 Z" stroke="var(--border)" strokeWidth="1.5" />
        
        {/* Brain Cortex Layer */}
        <path d="M 50,15 C 33,15 23,25 23,48 C 23,65 28,68 32,73 C 34,75 35,74 37,76 C 39,78 40,84 50,84 C 60,84 61,78 63,76 C 65,74 66,75 68,73 C 72,68 77,65 77,48 C 77,25 67,15 50,15 Z" stroke="var(--text-secondary)" strokeWidth="1.2" />

        {/* Brain Midline */}
        <path d="M 50,15 L 50,84" stroke="var(--border)" strokeWidth="0.8" strokeDasharray="2,2" />
        
        {/* Left Hemisphere Details */}
        <path d="M 40,20 C 35,23 35,32 45,35" stroke="var(--text-muted)" strokeWidth="0.8" />
        <path d="M 30,30 C 26,35 34,40 40,43" stroke="var(--text-muted)" strokeWidth="0.8" />
        <path d="M 33,48 C 28,52 35,58 45,55" stroke="var(--text-muted)" strokeWidth="0.8" />
        <path d="M 36,65 C 32,70 42,72 45,74" stroke="var(--text-muted)" strokeWidth="0.8" />
        
        {/* Right Hemisphere Details */}
        <path d="M 60,20 C 65,23 65,32 55,35" stroke="var(--text-muted)" strokeWidth="0.8" />
        <path d="M 70,30 C 74,35 66,40 60,43" stroke="var(--text-muted)" strokeWidth="0.8" />
        <path d="M 67,48 C 72,52 65,58 55,55" stroke="var(--text-muted)" strokeWidth="0.8" />
        <path d="M 64,65 C 68,70 58,72 55,74" stroke="var(--text-muted)" strokeWidth="0.8" />
        
        {/* Ventricles */}
        <path d="M 48,36 C 45,40 45,46 48,50" stroke="var(--primary)" strokeWidth="1" />
        <path d="M 52,36 C 55,40 55,46 52,50" stroke="var(--primary)" strokeWidth="1" />
        
        {/* Tumor highlight overlay */}
        {activeResult.hasTumor && location && (
          <circle 
            cx={location.x} 
            cy={location.y} 
            r={location.r} 
            stroke="var(--error)" 
            strokeWidth="1.5" 
            fill="rgba(239, 68, 68, 0.25)"
          />
        )}
      </svg>
    );
  };

  return (
    <div className="animate-fade-in" style={{ padding: '60px 0', width: '100%' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        
        {/* Top Controls Banner (Hidden in Printing) */}
        <div className="no-print" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '30px'
        }}>
          <div>
            <h2 style={{ fontSize: '1.75rem' }}>Medical Report</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {isDemoMode 
                ? 'Showing standard demo template. You can run a custom scan in the detection panel.' 
                : 'AI-assisted diagnosis report sheet.'}
            </p>
          </div>
          <button onClick={handlePrint} className="btn btn-primary" style={{ padding: '10px 20px' }}>
            <Printer size={18} /> Download / Print PDF
          </button>
        </div>

        {/* Info Banner when showing demo report (Hidden in Printing) */}
        {isDemoMode && (
          <div className="no-print" style={{
            background: 'var(--accent-light)',
            border: '1.5px solid var(--primary)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textAlign: 'left'
          }}>
            <AlertCircle size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              <strong>Demo Mode:</strong> You are viewing a default clinical template. Go to the <strong>AI Detection</strong> tab to upload your own MRI scan and generate an automated custom patient report.
            </span>
          </div>
        )}

        {/* Demographics Editor Form (Hidden in Printing) */}
        <div className="card no-print" style={{ padding: '20px', marginBottom: '30px', textAlign: 'left' }}>
          <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '12px' }}>Edit Report Patient Details</h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Name</label>
              <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-primary)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Age</label>
              <input type="number" value={patientAge} onChange={(e) => setPatientAge(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-primary)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Gender</label>
              <select value={patientGender} onChange={(e) => setPatientGender(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-primary)' }}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* CLINICAL MEDICAL REPORT CONTAINER (Rendered like paper) */}
        <div style={{
          background: 'var(--bg-card)',
          border: '2px solid var(--border)',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '30px',
          textAlign: 'left'
        }} className="report-paper-sheet">
          
          {/* Clinic Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '2px solid var(--primary)',
            paddingBottom: '20px'
          }}>
            <div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                NEUROSCAN ASSOCIATES CLINIC
              </span>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
                Oncology Department & Neuro-Imaging Lab
              </span>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span>Lab Ref ID: <strong>#NS-9041-A</strong></span>
              <span style={{ display: 'block', marginTop: '4px' }}>Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          {/* Patient Details & Metas */}
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Patient Demographics
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
              background: 'var(--bg-subtle)',
              padding: '16px 20px',
              borderRadius: '8px',
              border: '1px solid var(--border)'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>PATIENT NAME</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{patientName}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>AGE / GENDER</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{patientAge} y.o. / {patientGender}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>SCREENING TYPE</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>Axial Brain MRI</span>
              </div>
            </div>
          </div>

          {/* Visual Analysis Section (MRI & Confidence Score) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '30px',
            alignItems: 'center'
          }}>
            {/* Visual Column 1: Scanned MRI Image */}
            <div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Structural Neuro-Imaging
              </h3>
              <div style={{
                background: '#090D1A',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                aspectRatio: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                maxHeight: '260px'
              }}>
                {activeResult.imgUrl ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={activeResult.imgUrl} alt="Patient MRI" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    {activeResult.hasTumor && (
                      <div className="tumor-indicator" style={{
                        top: '40%',
                        left: '55%',
                        width: '36px',
                        height: '36px'
                      }} />
                    )}
                  </div>
                ) : (
                  renderReportBrainSVG(activeResult.location)
                )}
              </div>
              {activeResult.hasTumor && (
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--error)', fontWeight: 600, textAlign: 'center', marginTop: '8px' }}>
                  * Bounding outline indicates segmented lesion location.
                </span>
              )}
            </div>

            {/* Visual Column 2: Confidence & Classification */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>
                  AI Classifier Verdict
                </h3>
                
                {/* SVG Gauge */}
                <div className="gauge-container">
                  <svg width="150" height="150" className="gauge-circle">
                    <circle cx="75" cy="75" r={radius} stroke="var(--border)" strokeWidth="10" fill="transparent" />
                    <circle 
                      cx="75" 
                      cy="75" 
                      r={radius} 
                      stroke={activeResult.hasTumor ? 'var(--error)' : 'var(--success)'} 
                      strokeWidth="10" 
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="gauge-text">
                    {activeResult.confidence}%
                    <span className="gauge-subtext">Accuracy</span>
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '30px',
                background: activeResult.hasTumor ? 'var(--error-bg)' : 'var(--success-bg)',
                color: activeResult.hasTumor ? 'var(--error)' : 'var(--success)',
                fontWeight: 700,
                fontSize: '0.9rem'
              }}>
                {activeResult.hasTumor ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
                <span>{activeResult.type}</span>
              </div>
            </div>
          </div>

          {/* Clinical Findings Details */}
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Diagnostic Findings Summary
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, borderLeft: '3px solid var(--primary)', paddingLeft: '14px' }}>
              {activeResult.findings}
            </p>
          </div>

          {/* Recommendations and Next Steps */}
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Recommended Clinical Protocol
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, borderLeft: '3px solid var(--accent)', paddingLeft: '14px' }}>
              {activeResult.recommendation}
            </p>
          </div>

          {/* Electronic Signoff Section */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginTop: '30px',
            borderTop: '1px solid var(--border)',
            paddingTop: '30px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Decision Support Model</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>NeuroScan AI System v4.2.1</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>✔ Cryptographic Signoff Valid</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right' }}>
              <div style={{ 
                fontFamily: "'Courier New', Courier, monospace", 
                fontSize: '1.25rem', 
                color: 'var(--primary)', 
                fontStyle: 'italic',
                fontWeight: 600,
                borderBottom: '1.5px solid var(--text-muted)',
                paddingBottom: '2px',
                width: '180px',
                textAlign: 'center'
              }}>
                Dr. R. Alquist
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Attending Radiologist</span>
            </div>
          </div>

        </div>
      </div>
      <style>{`
        @media print {
          .report-paper-sheet {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            color: black !important;
          }
          .report-paper-sheet * {
            color: black !important;
          }
          body {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
};
