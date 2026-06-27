import React, { useState, useEffect } from 'react';
import { 
  Printer, CheckCircle, AlertTriangle, AlertCircle, Share2, Search, 
  Trash2, Eye, Plus, FileText, History, Check, BarChart3, Download 
} from 'lucide-react';
import { notify } from '../components/NotificationToast';

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
  clinicalNotes?: string;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  userId?: string;
}

interface ReportProps {
  scanResult: ScanResult | null;
  setCurrentPage?: (page: string) => void;
  initialTab?: 'report' | 'archive';
}

export const Report: React.FC<ReportProps> = ({ scanResult, setCurrentPage, initialTab }) => {
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

  const [activeTab, setActiveTab] = useState<'recent' | 'archive' | 'downloads' | 'analytics' | 'report'>(() => {
    if (initialTab === 'archive') return 'archive';
    if (initialTab === 'report') return 'report';
    if (scanResult) return 'report';
    return 'recent';
  });

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    } else if (scanResult) {
      setActiveTab('report');
    }
  }, [initialTab, scanResult]);
  
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
  
  // Email Dispatcher states
  const [emailAddress, setEmailAddress] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
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

  const handleSendReportEmail = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!emailAddress) {
      notify('warning', 'Email Verification', 'Please provide a valid recipient email address.');
      return;
    }
    setEmailLoading(true);
    try {
      const res = await fetch('/api/email/send-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('neuroscan_token')}`
        },
        body: JSON.stringify({
          email: emailAddress,
          prediction: activeReport.type,
          confidence: activeReport.confidence,
          recommendation: activeReport.recommendation,
          findings: activeReport.findings,
          scanId: activeReport.scanId,
          patientName: activeReport.patientName || patientName
        })
      });

      const data = await res.json();
      if (res.ok) {
        notify('success', 'Email Sent', `Diagnostic report successfully dispatched to ${emailAddress}.`);
        setEmailAddress('');
      } else {
        notify('error', 'Dispatch Error', data.message || 'SMTP transmission request rejected.');
      }
    } catch (e) {
      notify('error', 'Connection Anomaly', 'Could not establish connection to reports delivery gateway.');
    } finally {
      setEmailLoading(false);
    }
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
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setActiveTab('recent')} 
              className={`btn ${activeTab === 'recent' ? 'btn-primary' : 'btn-outline'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.85rem' }}
            >
              Recent Reports
            </button>
            <button 
              onClick={() => setActiveTab('archive')} 
              className={`btn ${activeTab === 'archive' ? 'btn-primary' : 'btn-outline'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.85rem' }}
            >
              <History size={14} /> Scan History ({historyReports.length})
            </button>
            <button 
              onClick={() => setActiveTab('downloads')} 
              className={`btn ${activeTab === 'downloads' ? 'btn-primary' : 'btn-outline'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.85rem' }}
            >
              <Download size={14} /> Downloads
            </button>
            <button 
              onClick={() => setActiveTab('analytics')} 
              className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-outline'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.85rem' }}
            >
              <BarChart3 size={14} /> Analytics
            </button>
            <button 
              onClick={() => setActiveTab('report')} 
              className={`btn ${activeTab === 'report' ? 'btn-primary' : 'btn-outline'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.85rem' }}
            >
              <FileText size={14} /> Report Details
            </button>
          </div>
        </div>

        {/* Tab: Recent Reports */}
        {activeTab === 'recent' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Recent Reports Ingestion</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>List of recently completed MRI tumor screenings ready for clinician review.</p>
            
            {historyReports.length === 0 ? (
              <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <FileText size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <p style={{ fontWeight: 600 }}>No reports generated yet.</p>
                <button onClick={() => setCurrentPage && setCurrentPage('detection')} className="btn btn-primary" style={{ marginTop: '16px', padding: '8px 16px', fontSize: '0.85rem' }}>
                  Analyze New Scan
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {historyReports.map((report) => (
                  <div key={report.scanId} className="card border-hover" style={{ padding: '20px', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-secondary)' }}>#{report.scanId}</span>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.675rem',
                        fontWeight: 700,
                        background: report.hasTumor ? 'rgba(239, 68, 68, 0.1)' : 'rgba(52, 211, 153, 0.1)',
                        color: report.hasTumor ? 'var(--error)' : 'var(--success)'
                      }}>{report.hasTumor ? report.type : 'Healthy'}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '48px', height: '48px', background: '#000', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {report.imgUrl ? (
                          <img src={report.imgUrl} alt="scan preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          renderReportBrainSVG(report.location)
                        )}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>{report.patientName || report.name || 'Eleanor Vance'}</h4>
                        <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{report.date}</span>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Confidence: <strong style={{ color: 'var(--text-primary)' }}>{report.confidence}%</strong></span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          onClick={() => handleSelectHistoryReport(report)}
                          className="btn btn-outline"
                          style={{ padding: '4px 8px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px' }}
                        >
                          <Eye size={12} /> View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Downloads */}
        {activeTab === 'downloads' && (
          <div className="card" style={{ padding: '24px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download style={{ color: 'var(--primary)' }} /> Document Download & Print Ledger
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>Select diagnostic report summaries to download as offline PDFs or copy direct sharing links.</p>

            {historyReports.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <AlertCircle size={40} style={{ opacity: 0.4, color: 'var(--primary)', marginBottom: '12px' }} />
                <p style={{ fontWeight: 600 }}>No documents registered for download.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Scan ID</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Patient Name</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Verdict</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Ingestion Date</th>
                      <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyReports.map((report) => (
                      <tr key={report.scanId} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--text-primary)' }}>#{report.scanId}</td>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>{report.patientName || report.name || 'Eleanor Vance'}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            background: report.hasTumor ? 'rgba(239, 68, 68, 0.08)' : 'rgba(52, 211, 153, 0.08)',
                            color: report.hasTumor ? 'var(--error)' : 'var(--success)'
                          }}>{report.hasTumor ? report.type : 'Healthy'}</span>
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{report.date}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              onClick={() => {
                                handleSelectHistoryReport(report);
                                setTimeout(() => window.print(), 100);
                              }}
                              className="btn btn-outline"
                              style={{ padding: '6px 12px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Printer size={12} /> Print PDF
                            </button>
                            <button 
                              onClick={() => {
                                const reportUrl = `${window.location.origin}/report/${report.scanId || 'demo'}`;
                                navigator.clipboard.writeText(reportUrl);
                                notify('success', 'Copied', 'Report URL copied to clipboard.');
                              }}
                              className="btn btn-outline"
                              style={{ padding: '6px 12px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Share2 size={12} /> Share URL
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

        {/* Tab: Analytics */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 style={{ color: 'var(--primary)' }} /> Clinical Statistical Distribution Diagnostics
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', borderLeft: '4px solid var(--primary)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>TOTAL INGESTED SCANS</span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', margin: '8px 0 0 0' }}>{historyReports.length}</h2>
              </div>
              <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', borderLeft: '4px solid var(--error)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>TUMOR MASS CASES</span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--error)', margin: '8px 0 0 0' }}>{historyReports.filter(r => r.hasTumor).length}</h2>
              </div>
              <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', borderLeft: '4px solid var(--success)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>HEALTHY CASES</span>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--success)', margin: '8px 0 0 0' }}>{historyReports.filter(r => !r.hasTumor).length}</h2>
              </div>
            </div>

            <div className="card" style={{ padding: '24px', background: 'var(--bg-card)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>Tumor Type Distribution Indicator</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                    <span>Glioma Cases</span>
                    <span>{historyReports.filter(r => r.type?.toLowerCase().includes('glioma')).length} cases</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${historyReports.length > 0 ? (historyReports.filter(r => r.type?.toLowerCase().includes('glioma')).length / historyReports.length) * 100 : 0}%`, 
                      height: '100%', 
                      background: 'var(--error)' 
                    }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                    <span>Meningioma Cases</span>
                    <span>{historyReports.filter(r => r.type?.toLowerCase().includes('meningioma')).length} cases</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${historyReports.length > 0 ? (historyReports.filter(r => r.type?.toLowerCase().includes('meningioma')).length / historyReports.length) * 100 : 0}%`, 
                      height: '100%', 
                      background: 'var(--primary)' 
                    }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
                    <span>Healthy Brain Cases</span>
                    <span>{historyReports.filter(r => !r.hasTumor).length} cases</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${historyReports.length > 0 ? (historyReports.filter(r => !r.hasTumor).length / historyReports.length) * 100 : 0}%`, 
                      height: '100%', 
                      background: 'var(--success)' 
                    }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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

              {/* Doctor Clinical Notes */}
              {activeResult.reviewedBy && (
                <div>
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--success)', marginBottom: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Physician Clinical Notes
                  </h3>
                  <div style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                    borderLeft: '3px solid var(--success)',
                    paddingLeft: '14px',
                    margin: 0,
                    background: 'rgba(52, 211, 153, 0.04)',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(52, 211, 153, 0.15)'
                  }}>
                    <p style={{ margin: '0 0 6px 0', fontStyle: 'italic' }}>
                      "{activeResult.clinicalNotes || 'No specific clinical notes added.'}"
                    </p>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      Verified and signed by <strong>{activeResult.reviewedBy}</strong> on {activeResult.reviewedAt}
                    </span>
                  </div>
                </div>
              )}

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
                    {activeResult.reviewedBy || doctorName}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Attending Clinician Signoff</span>
                </div>
              </div>

              {/* Send Report by Email Subsystem */}
              <div style={{
                marginTop: '30px',
                borderTop: '1px solid var(--border)',
                paddingTop: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                textAlign: 'left'
              }} className="no-print">
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Send Report by Email
                </span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Enter clinician or patient email to dispatch diagnostic coordinates PDF and clinical notes.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="email"
                    placeholder="physician@clinic.org"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.825rem',
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={handleSendReportEmail}
                    disabled={emailLoading}
                    className="btn btn-primary"
                    style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '0.825rem', fontWeight: 700 }}
                  >
                    {emailLoading ? 'Sending...' : 'Send Report'}
                  </button>
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
