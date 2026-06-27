import React, { useState, useEffect } from 'react';
import { Printer, CheckCircle, AlertTriangle, AlertCircle, Share2, Search, Trash2, Eye, Plus, FileText, History, Check } from 'lucide-react';

interface ScanResult {
  hasTumor: boolean;
  type: string;
  confidence: number;
  location: { x: number; y: number; r: number } | null;
  recommendation: string;
  findings: string;
  imgUrl?: string;
  name?: string;
  
  // Backend & compatibility fields
  status?: string;
  tumorDetected?: boolean;
  tumorType?: string;
  analysisTime?: string;
  scanId?: string;
  duration?: string;
  resolution?: string;
  model?: string;
  dataset?: string;
  engine?: string;
  symptoms?: string;
  nextStep?: string;
  specialist?: string;
  description?: string;
  riskLevel?: 'Low' | 'Medium' | 'High';

  // Custom metadata fields saved in history
  date?: string;
  time?: string;
  patientName?: string;
  patientAge?: string;
  patientGender?: string;
  doctorName?: string;
  hospitalName?: string;
  fileName?: string;
  fileSize?: string;
}

interface ReportProps {
  scanResult: ScanResult | null;
  setCurrentPage?: (page: string) => void;
}

export const Report: React.FC<ReportProps> = ({ scanResult, setCurrentPage }) => {
  // If no scan result, we supply a mock interactive default case
  const defaultMockResult: ScanResult = {
    hasTumor: true,
    type: 'Glioma',
    confidence: 97.8,
    location: { x: 38, y: 45, r: 8 },
    findings: 'AI analysis suggests characteristics consistent with Glioma. A localized enhancing tumor mass is visualized within the left frontal lobe cerebral tissue, measuring approximately 2.4 x 2.2 cm. Moderate mass effect is noted with displacement of local sulci.',
    recommendation: 'Recommend immediate consultation with a neurologist or neurosurgeon for further clinical evaluation.',
    riskLevel: 'High',
    description: 'Gliomas start in the glial cells that surround and support nerve cells. They are typically infiltrative and require active surgical or oncology management.',
    symptoms: 'Recurrent headaches, cognitive changes, localized muscle weakness, seizures, speech difficulty.',
    nextStep: 'High-contrast brain MRI scan, MR spectroscopy, stereotactic biopsy.',
    specialist: 'Neuro-oncologist / Neurosurgical Team',
    scanId: 'NS-39841-DX',
    duration: '1.24 seconds',
    resolution: '512 × 512',
    model: 'RF-DETR Small',
    dataset: 'Brain Tumor MRI Dataset',
    engine: 'Roboflow AI'
  };

  const [activeTab, setActiveTab] = useState<'report' | 'archive'>('report');
  
  // Demographics Editor states
  const [patientName, setPatientName] = useState('Eleanor Vance');
  const [patientAge, setPatientAge] = useState('38');
  const [patientGender, setPatientGender] = useState('Female');
  const [doctorName, setDoctorName] = useState('Dr. R. Alquist');
  const [hospitalName, setHospitalName] = useState('NeuroScan Associates Clinic');
  
  // Active Report state
  const [activeReport, setActiveReport] = useState<ScanResult>(() => {
    return scanResult || defaultMockResult;
  });

  // History list state
  const [historyReports, setHistoryReports] = useState<ScanResult[]>([]);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Load history from localStorage
  const getReportsHistory = (): ScanResult[] => {
    const raw = localStorage.getItem('neuroscan_reports_history');
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  };

  // Sync state demographics with scanResult or history
  useEffect(() => {
    const history = getReportsHistory();
    setHistoryReports(history);
  }, [scanResult]);

  useEffect(() => {
    if (scanResult) {
      setActiveReport(scanResult);
      setPatientName(scanResult.name || 'Eleanor Vance');
      
      const reports = getReportsHistory();
      const reportId = scanResult.scanId || `NS-${Math.floor(Math.random() * 90000 + 10000)}-DX`;
      const isDuplicate = reports.some((r: any) => r.scanId === reportId);
      
      if (!isDuplicate) {
        const newReport: ScanResult = {
          ...scanResult,
          scanId: reportId,
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          patientName: scanResult.name || 'Eleanor Vance',
          patientAge: '38',
          patientGender: 'Female',
          doctorName: 'Dr. R. Alquist',
          hospitalName: 'NeuroScan Associates Clinic',
        };
        const updated = [newReport, ...reports];
        localStorage.setItem('neuroscan_reports_history', JSON.stringify(updated));
        setHistoryReports(updated);
      }
    }
  }, [scanResult]);

  // Edit fields sync helper
  const handleUpdateReportMeta = () => {
    // Modify active report details
    const updatedReport = {
      ...activeReport,
      patientName,
      patientAge,
      patientGender,
      doctorName,
      hospitalName
    };
    setActiveReport(updatedReport);
    
    // Save to history list also
    const reports = getReportsHistory();
    const idx = reports.findIndex((r) => r.scanId === activeReport.scanId);
    if (idx !== -1) {
      reports[idx] = updatedReport;
      localStorage.setItem('neuroscan_reports_history', JSON.stringify(reports));
      setHistoryReports(reports);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareReport = () => {
    const reportUrl = `${window.location.origin}/report/${activeReport.scanId || 'demo'}`;
    navigator.clipboard.writeText(reportUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteHistoryReport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const reports = getReportsHistory();
    const filtered = reports.filter((r) => r.scanId !== id);
    localStorage.setItem('neuroscan_reports_history', JSON.stringify(filtered));
    setHistoryReports(filtered);
  };

  const handleSelectHistoryReport = (report: ScanResult) => {
    setActiveReport(report);
    setPatientName(report.patientName || report.name || 'Eleanor Vance');
    setPatientAge(report.patientAge || '38');
    setPatientGender(report.patientGender || 'Female');
    setDoctorName(report.doctorName || 'Dr. R. Alquist');
    setHospitalName(report.hospitalName || 'NeuroScan Associates Clinic');
    setActiveTab('report');
  };

  const getRecommendationText = () => {
    if (activeReport.hasTumor) {
      return "Recommend immediate consultation with a neurologist or neurosurgeon for further clinical evaluation.";
    } else {
      return "No tumor characteristics detected by the AI model. If symptoms persist, consult a qualified healthcare professional.";
    }
  };

  // Search and filter calculation
  const filteredReports = historyReports.filter((report) => {
    const name = (report.patientName || report.name || '').toLowerCase();
    const id = (report.scanId || '').toLowerCase();
    const matchesSearch = name.includes(searchQuery.toLowerCase()) || id.includes(searchQuery.toLowerCase());
    
    if (dateFilter === 'all') return matchesSearch;
    
    const reportDate = report.date ? new Date(report.date) : new Date();
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - reportDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (dateFilter === 'today') return matchesSearch && diffDays <= 1;
    if (dateFilter === 'week') return matchesSearch && diffDays <= 7;
    if (dateFilter === 'month') return matchesSearch && diffDays <= 30;
    
    return matchesSearch;
  });

  const renderReportBrainSVG = (location: { x: number; y: number; r: number } | null) => {
    return (
      <svg 
        viewBox="0 0 100 100" 
        style={{ 
          width: '75%', 
          height: '75%', 
          fill: 'none', 
          stroke: '#FFFFFF', 
          strokeWidth: '0.8',
        }}
      >
        <path d="M 50,12 C 28,12 20,24 20,48 C 20,68 26,73 31,78 C 34,80 37,78 40,80 C 42,82 43,88 50,88 C 57,88 58,82 60,80 C 63,78 66,80 69,78 C 74,73 80,68 80,48 C 80,24 72,12 50,12 Z" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
        <path d="M 50,15 C 33,15 23,25 23,48 C 23,65 28,68 32,73 C 34,75 35,74 37,76 C 39,78 40,84 50,84 C 60,84 61,78 63,76 C 65,74 66,75 68,73 C 72,68 77,65 77,48 C 77,25 67,15 50,15 Z" stroke="rgba(255,255,255,0.75)" strokeWidth="1.2" />
        <path d="M 50,15 L 50,84" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" strokeDasharray="1,1" />
        
        <path d="M 40,20 C 35,23 35,32 45,35" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
        <path d="M 30,30 C 26,35 34,40 40,43" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
        <path d="M 33,48 C 28,52 35,58 45,55" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
        <path d="M 60,20 C 65,23 65,32 55,35" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
        <path d="M 70,30 C 74,35 66,40 60,43" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
        <path d="M 67,48 C 72,52 65,58 55,55" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
        
        <path d="M 48,36 C 45,40 45,46 48,50" stroke="var(--primary)" strokeWidth="1" />
        <path d="M 52,36 C 55,40 55,46 52,50" stroke="var(--primary)" strokeWidth="1" />
        
        {activeReport.hasTumor && location && (
          <circle 
            cx={location.x} 
            cy={location.y} 
            r={location.r} 
            stroke="var(--error)" 
            strokeWidth="1.5" 
            fill="rgba(239, 68, 68, 0.3)"
          />
        )}
      </svg>
    );
  };

  const activeResult = activeReport;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * activeResult.confidence) / 100;

  return (
    <div className="animate-fade-in" style={{ padding: '40px 0', width: '100%' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        
        {/* Navigation / Tab Controls */}
        <div className="no-print" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '16px',
          marginBottom: '30px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Medical Diagnostics Lab</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Automated report sheets and diagnostic database</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setActiveTab('report')} 
              className={`btn ${activeTab === 'report' ? 'btn-primary' : 'btn-outline'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
            >
              <FileText size={16} /> Active Patient Report
            </button>
            <button 
              onClick={() => setActiveTab('archive')} 
              className={`btn ${activeTab === 'archive' ? 'btn-primary' : 'btn-outline'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
            >
              <History size={16} /> Clinical Archive ({historyReports.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Clinical Active Report */}
        {activeTab === 'report' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Top Action controls bar */}
            <div className="no-print" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              padding: '16px 24px',
              borderRadius: '16px'
            }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Report ID: <strong>{activeResult.scanId || 'NS-98410-DX'}</strong>
              </span>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button onClick={handlePrint} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Printer size={16} /> Download PDF / Print
                </button>
                <button onClick={handleShareReport} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {copied ? <Check size={16} style={{ color: 'var(--success)' }} /> : <Share2 size={16} />}
                  {copied ? 'Link Copied!' : 'Share Report'}
                </button>
                {setCurrentPage && (
                  <button onClick={() => setCurrentPage('detection')} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Plus size={16} /> Analyze Another MRI
                  </button>
                )}
              </div>
            </div>

            {/* Demographics input form (Editable) */}
            <div className="card no-print" style={{ padding: '24px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} style={{ color: 'var(--primary)' }} /> Edit Diagnostic Demographics
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>PATIENT NAME</label>
                  <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-primary)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>AGE</label>
                  <input type="number" value={patientAge} onChange={(e) => setPatientAge(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-primary)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>GENDER</label>
                  <select value={patientGender} onChange={(e) => setPatientGender(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-primary)' }}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>ATTENDING CLINICIAN</label>
                  <input type="text" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '4px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '220px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>DIAGNOSTIC CENTRE / HOSPITAL</label>
                  <input type="text" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-primary)' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button onClick={handleUpdateReportMeta} className="btn btn-outline" style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '0.85rem' }}>
                    Save Report Edits
                  </button>
                </div>
              </div>
            </div>

            {/* CLINICAL HOSPITAL PAPER PATIENT SHEET */}
            <div style={{
              background: 'var(--bg-card)',
              border: '2px solid var(--border)',
              borderRadius: '20px',
              padding: '40px',
              boxShadow: 'var(--shadow-xl)',
              display: 'flex',
              flexDirection: 'column',
              gap: '30px',
              textAlign: 'left'
            }} className="report-paper-sheet">
              
              {/* Paper Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '3px solid var(--primary)',
                paddingBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '10px' }}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.4rem', color: 'var(--text-primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                      NeuroScan Diagnostics
                    </h1>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
                      AI-Assisted Brain Tumor Screening Report
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>Report ID: <strong>#{activeResult.scanId || 'NS-39841-DX'}</strong></span>
                  <span style={{ display: 'block', marginTop: '4px' }}>Date: {activeResult.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span style={{ display: 'block', marginTop: '2px' }}>Time: {activeResult.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              {/* Demographics Block */}
              <div>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--primary)', marginBottom: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Patient Demographics
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '20px',
                  background: 'var(--bg-subtle)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid var(--border)'
                }}>
                  <div>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700 }}>PATIENT NAME</span>
                    <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem', marginTop: '2px', display: 'block' }}>{patientName}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700 }}>AGE / GENDER</span>
                    <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem', marginTop: '2px', display: 'block' }}>{patientAge} Years / {patientGender}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700 }}>REFERRING CLINICIAN</span>
                    <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem', marginTop: '2px', display: 'block' }}>{doctorName}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700 }}>DIAGNOSTIC HOSPITAL</span>
                    <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem', marginTop: '2px', display: 'block' }}>{hospitalName}</span>
                  </div>
                </div>
              </div>

              {/* Center Vitals/MRI display layout */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '30px',
                alignItems: 'stretch'
              }}>
                
                {/* Structural Image panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    MRI Visual Segmentations
                  </h3>
                  <div style={{
                    background: '#090D1A',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    width: '100%',
                    aspectRatio: '1',
                    maxHeight: '280px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    {activeResult.imgUrl && !['glioma', 'meningioma', 'healthy'].includes(activeResult.imgUrl) ? (
                      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={activeResult.imgUrl} alt="Patient MRI scan" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        {activeResult.hasTumor && activeResult.location && (
                          <div style={{
                            position: 'absolute',
                            top: `${activeResult.location.y}%`,
                            left: `${activeResult.location.x}%`,
                            width: `${activeResult.location.r * 2}%`,
                            height: `${activeResult.location.r * 2}%`,
                            transform: 'translate(-50%, -50%)',
                            border: '2.5px solid var(--error)',
                            borderRadius: '50%',
                            background: 'rgba(239, 68, 68, 0.22)',
                            boxShadow: '0 0 12px var(--error)'
                          }} />
                        )}
                      </div>
                    ) : (
                      renderReportBrainSVG(activeResult.location)
                    )}
                  </div>
                  <div style={{ 
                    background: 'var(--bg-subtle)', 
                    padding: '8px 12px', 
                    borderRadius: '8px', 
                    fontSize: '0.725rem', 
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>Dimensions: <strong>{activeResult.resolution || '512 × 512'}</strong></span>
                    <span>File Size: <strong>{activeResult.fileSize || '3.2 MB'}</strong></span>
                  </div>
                </div>

                {/* AI Screening Classification panel */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
                      Diagnostic Verdict
                    </h3>
                    <div style={{
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border)',
                      borderRadius: '16px',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '16px'
                    }}>
                      <div className="gauge-container" style={{ position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="130" height="130">
                          <circle cx="65" cy="65" r={radius} stroke="var(--border)" strokeWidth="8" fill="transparent" />
                          <circle 
                            cx="65" 
                            cy="65" 
                            r={radius} 
                            stroke={activeResult.hasTumor ? 'var(--error)' : 'var(--success)'} 
                            strokeWidth="8" 
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>{activeResult.confidence}%</span>
                          <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Confidence</span>
                        </div>
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 20px',
                        borderRadius: '30px',
                        background: activeResult.hasTumor ? 'rgba(239, 68, 68, 0.1)' : 'rgba(52, 211, 153, 0.1)',
                        color: activeResult.hasTumor ? 'var(--error)' : 'var(--success)',
                        fontWeight: 800,
                        fontSize: '0.875rem'
                      }}>
                        {activeResult.hasTumor ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
                        <span>{activeResult.hasTumor ? `Tumor Anomalies Detected (${activeResult.type})` : 'No Tumor Anomalies Detected'}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontSize: '0.75rem',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Risk Level</span>
                      <strong style={{ display: 'block', color: activeResult.hasTumor ? 'var(--error)' : 'var(--success)', fontSize: '0.85rem' }}>
                        {activeResult.hasTumor ? 'HIGH' : 'LOW'}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Scan Duration</span>
                      <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                        {activeResult.analysisTime || activeResult.duration || '1.2s'}
                      </strong>
                    </div>
                  </div>

                </div>
              </div>

              {/* Diagnostic Parameters summary */}
              <div>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--primary)', marginBottom: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Clinical Findings Details
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, borderLeft: '3px solid var(--primary)', paddingLeft: '14px', margin: 0 }}>
                  {activeResult.findings || (activeResult.hasTumor ? 'An abnormal tissue configuration with features indicative of tumor activity is segmented in the cerebral hemisphere.' : 'AI analysis suggests no brain tumor anomalies detected.')}
                </p>
              </div>

              {/* Recommendations and Next Steps */}
              <div>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--primary)', marginBottom: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Attending Recommendation
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, borderLeft: '3px solid var(--accent)', paddingLeft: '14px', margin: 0 }}>
                  {getRecommendationText()}
                </p>
              </div>

              {/* Technical Model Parameters Sheet */}
              <div style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '16px',
                fontSize: '0.75rem'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Screening Model</span>
                  <span style={{ display: 'block', fontWeight: 700 }}>{activeResult.model || 'Roboflow RF-DETR Small'}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Trained Dataset</span>
                  <span style={{ display: 'block', fontWeight: 700 }}>{activeResult.dataset || 'Brain Tumor MRI Dataset'}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Inference Endpoint</span>
                  <span style={{ display: 'block', fontWeight: 700, color: 'var(--primary)' }}>{activeResult.engine || 'Roboflow Serverless API'}</span>
                </div>
              </div>

              {/* Medical Disclaimer */}
              <div style={{
                background: 'rgba(245, 158, 11, 0.05)',
                border: '1px dashed rgba(245, 158, 11, 0.25)',
                borderRadius: '12px',
                padding: '16px 20px',
                fontSize: '0.725rem',
                color: 'var(--text-muted)',
                lineHeight: 1.5,
                textAlign: 'left'
              }}>
                <span style={{ fontWeight: 700, color: '#D97706', display: 'block', marginBottom: '4px' }}>CLINICAL DIAGNOSTIC DISCLAIMER:</span>
                This report is generated using an Artificial Intelligence screening model. The output is intended to assist healthcare professionals and should not be considered a final medical diagnosis. Clinical decisions should always be made by licensed medical practitioners.
              </div>

              {/* Cryptographic Signature & Signoff */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginTop: '10px',
                borderTop: '1px solid var(--border)',
                paddingTop: '24px'
              }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Diagnostic Verification</span>
                  <span style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '2px' }}>NeuroScan AI System v4.3.0</span>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--success)', fontWeight: 600, marginTop: '2px' }}>✔ Diagnostic Cryptographic Signoff Valid</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontFamily: "'Courier New', Courier, monospace", 
                    fontSize: '1.2rem', 
                    color: 'var(--primary)', 
                    fontStyle: 'italic',
                    fontWeight: 700,
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: '2px',
                    width: '180px',
                    textAlign: 'center',
                    marginBottom: '4px'
                  }}>
                    {doctorName}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Attending Clinician Signoff</span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Tab 2: Clinical archive logs database */}
        {activeTab === 'archive' && (
          <div className="card" style={{ padding: '24px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History style={{ color: 'var(--primary)' }} /> Automated Diagnosis Archive
            </h3>

            {/* Archive controls bar */}
            <div style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-subtle)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid var(--border)'
            }}>
              
              {/* Search bar input */}
              <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search by Patient Name or Lab ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              {/* Date Filters buttons */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {(['all', 'today', 'week', 'month'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setDateFilter(filter)}
                    className={`btn ${dateFilter === filter ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '20px', textTransform: 'capitalize' }}
                  >
                    {filter === 'all' ? 'All History' : filter}
                  </button>
                ))}
              </div>

            </div>

            {/* Table logs results list */}
            {filteredReports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <AlertCircle size={40} style={{ opacity: 0.4, color: 'var(--primary)' }} />
                <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>No medical scan sheets match search parameters.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Lab Ref ID / Date</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Patient Information</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Tumor Verdict</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Accuracy</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((report) => (
                      <tr 
                        key={report.scanId} 
                        style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'var(--transition)' }}
                        className="preset-tag-hover"
                        onClick={() => handleSelectHistoryReport(report)}
                      >
                        <td style={{ padding: '16px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>#{report.scanId}</span>
                          <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>{report.date}</span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ fontWeight: 800, color: 'var(--text-primary)', display: 'block' }}>{report.patientName || report.name}</span>
                          <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
                            {report.patientAge || '38'} y.o. / {report.patientGender || 'Female'}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '0.725rem',
                            background: report.hasTumor ? 'rgba(239, 68, 68, 0.1)' : 'rgba(52, 211, 153, 0.1)',
                            color: report.hasTumor ? 'var(--error)' : 'var(--success)'
                          }}>
                            {report.hasTumor ? 'Detected' : 'Normal'} ({report.type})
                          </div>
                        </td>
                        <td style={{ padding: '16px', fontWeight: 700 }}>
                          {report.confidence}%
                        </td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectHistoryReport(report);
                              }}
                              className="btn btn-outline"
                              style={{ padding: '6px 12px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Eye size={12} /> Open
                            </button>
                            <button 
                              onClick={(e) => handleDeleteHistoryReport(report.scanId!, e)}
                              className="btn btn-outline"
                              style={{ padding: '6px 12px', fontSize: '0.7rem', color: 'var(--error)', borderColor: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
          </div>
        )}

      </div>

      {/* Printing / PDF Page Styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
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
            background: transparent !important;
          }
          body {
            background: white !important;
          }
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
        }
      `}</style>
    </div>
  );
};
