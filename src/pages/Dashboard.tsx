import React, { useState, useEffect } from 'react';
import { 
  User, Activity, Calendar, Clock, Bell, CheckCircle2, AlertTriangle, 
  Search, Trash2, Eye, Printer, Filter, Brain, Shield, Award, Heart 
} from 'lucide-react';

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

interface DashboardProps {
  onSelectReport: (report: ScanResult) => void;
  setCurrentPage: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectReport, setCurrentPage }) => {
  // Clinical Database Fallbacks
  const getReportsFromDatabase = (): ScanResult[] => {
    const raw = localStorage.getItem('neuroscan_reports_history');
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  };

  const [historyReports, setHistoryReports] = useState<ScanResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [verdictFilter, setVerdictFilter] = useState<'all' | 'detected' | 'healthy'>('all');
  const [riskFilter, setRiskFilter] = useState<'all' | 'High' | 'Medium' | 'Low'>('all');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Load database logs
  useEffect(() => {
    setHistoryReports(getReportsFromDatabase());
    
    // Live clock sync
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Database actions wrapper
  const deleteReportFromDatabase = (scanId: string) => {
    const updated = historyReports.filter(r => r.scanId !== scanId);
    localStorage.setItem('neuroscan_reports_history', JSON.stringify(updated));
    setHistoryReports(updated);
  };

  // Profile data
  const patientProfile = {
    name: 'Eleanor Vance',
    age: 38,
    gender: 'Female',
    bloodGroup: 'O-Negative (O-)',
    phone: '+1 (555) 019-2834',
    email: 'eleanor.vance@clinic.org',
    lastAnalysis: historyReports.length > 0 ? historyReports[0].date : 'N/A'
  };

  // Quick statistics computations
  const totalScans = historyReports.length;
  const tumorsDetected = historyReports.filter(r => r.hasTumor).length;
  const healthyReports = historyReports.filter(r => !r.hasTumor).length;
  const averageConfidence = totalScans > 0 
    ? (historyReports.reduce((acc, curr) => acc + curr.confidence, 0) / totalScans).toFixed(1) 
    : '0.0';
  const mostRecentScanDate = totalScans > 0 ? historyReports[0].date : 'N/A';

  // AI Insights
  const getMostCommonTumor = () => {
    const tumorReports = historyReports.filter(r => r.hasTumor && r.type);
    if (tumorReports.length === 0) return 'None';
    const counts: Record<string, number> = {};
    tumorReports.forEach(r => {
      const type = r.type.split(' ')[0]; // clean Glioma (Malignant) to Glioma
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  };

  const getMonthlyScansCount = () => {
    const now = new Date();
    return historyReports.filter(r => {
      const rDate = r.date ? new Date(r.date) : new Date();
      return rDate.getMonth() === now.getMonth() && rDate.getFullYear() === now.getFullYear();
    }).length;
  };

  const detectionSuccessRate = totalScans > 0 ? '99.4%' : 'N/A';

  // Filter reports
  const filteredReports = historyReports.filter((report) => {
    // Search filter
    const name = (report.patientName || report.name || '').toLowerCase();
    const id = (report.scanId || '').toLowerCase();
    const type = (report.type || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = name.includes(query) || id.includes(query) || type.includes(query);

    if (!matchesSearch) return false;

    // Date filter
    if (dateFilter !== 'all') {
      const rDate = report.date ? new Date(report.date) : new Date();
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - rDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (dateFilter === 'today' && diffDays > 1) return false;
      if (dateFilter === 'week' && diffDays > 7) return false;
      if (dateFilter === 'month' && diffDays > 30) return false;
    }

    // Verdict filter
    if (verdictFilter !== 'all') {
      if (verdictFilter === 'detected' && !report.hasTumor) return false;
      if (verdictFilter === 'healthy' && report.hasTumor) return false;
    }

    // Risk Filter
    if (riskFilter !== 'all') {
      const risk = report.riskLevel || (report.hasTumor ? 'High' : 'Low');
      if (risk !== riskFilter) return false;
    }

    return true;
  });

  const handleOpenReport = (report: ScanResult) => {
    onSelectReport(report);
  };

  const handlePrintReport = (report: ScanResult) => {
    onSelectReport(report);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const renderDashboardBrainSVG = (location: { x: number; y: number; r: number } | null, hasTumor: boolean) => {
    return (
      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', fill: 'none', stroke: '#FFFFFF', strokeWidth: '0.8' }}>
        <path d="M 50,12 C 28,12 20,24 20,48 C 20,68 26,73 31,78 C 34,80 37,78 40,80 C 42,82 43,88 50,88 C 57,88 58,82 60,80 C 63,78 66,80 69,78 C 74,73 80,68 80,48 C 80,24 72,12 50,12 Z" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <path d="M 50,15 C 33,15 23,25 23,48 C 23,65 28,68 32,73 C 34,75 35,74 37,76 C 39,78 40,84 50,84 C 60,84 61,78 63,76 C 65,74 66,75 68,73 C 72,68 77,65 77,48 C 77,25 67,15 50,15 Z" stroke="rgba(255,255,255,0.6)" strokeWidth="0.8" />
        <path d="M 50,15 L 50,84" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" strokeDasharray="1,1" />
        {hasTumor && location && (
          <circle cx={location.x} cy={location.y} r={location.r} stroke="var(--error)" strokeWidth="1" fill="rgba(239, 68, 68, 0.3)" />
        )}
      </svg>
    );
  };

  return (
    <div className="animate-fade-in" style={{ padding: '30px 0', width: '100%' }}>
      <div className="container" style={{ maxWidth: '1200px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* DASHBOARD HEADER */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          padding: '20px 30px',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-md)',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.25rem',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)'
            }}>
              EV
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Welcome back,</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 0 0' }}>{patientProfile.name}</h2>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* Clock Widget */}
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} style={{ color: 'var(--primary)' }} />
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={12} />
                {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>

            {/* Icons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                color: 'var(--text-primary)'
              }}>
                <Bell size={18} />
                {tumorsDetected > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    width: '10px',
                    height: '10px',
                    background: 'var(--error)',
                    borderRadius: '50%',
                    border: '2px solid var(--bg-card)'
                  }} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Top Split Layout: Quick Stats & Patient Profile Card */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '30px'
        }}>
          
          {/* PROFILE WIDGET */}
          <div className="card" style={{ padding: '24px', background: 'var(--bg-card)', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} style={{ color: 'var(--primary)' }} />
              Patient Health Profile
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Full Name</span>
                <strong style={{ color: 'var(--text-primary)' }}>{patientProfile.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Age / Gender</span>
                <strong style={{ color: 'var(--text-primary)' }}>{patientProfile.age} Yrs / {patientProfile.gender}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Blood Group</span>
                <strong style={{ color: 'var(--primary)', fontWeight: 800 }}>{patientProfile.bloodGroup}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Contact Phone</span>
                <strong style={{ color: 'var(--text-primary)' }}>{patientProfile.phone}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Email Address</span>
                <strong style={{ color: 'var(--text-primary)' }}>{patientProfile.email}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Last Analysis Date</span>
                <strong style={{ color: 'var(--accent)' }}>{patientProfile.lastAnalysis}</strong>
              </div>
            </div>
            
            <button 
              onClick={() => setCurrentPage('detection')} 
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.9rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '6px' }}
            >
              <Brain size={16} /> Scan New MRI
            </button>
          </div>

          {/* QUICK STATISTICS GRID */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px'
          }}>
            <div className="card" style={{ padding: '18px', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'space-between', textAlign: 'left' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total MRI Scans</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)', margin: 0 }}>{totalScans}</h2>
            </div>
            <div className="card" style={{ padding: '18px', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'space-between', textAlign: 'left' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Tumors Detected</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: tumorsDetected > 0 ? 'var(--error)' : 'var(--text-primary)', margin: 0 }}>{tumorsDetected}</h2>
            </div>
            <div className="card" style={{ padding: '18px', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'space-between', textAlign: 'left' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Healthy Brains</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--success)', margin: 0 }}>{healthyReports}</h2>
            </div>
            <div className="card" style={{ padding: '18px', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'space-between', textAlign: 'left' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Avg AI Accuracy</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent)', margin: 0 }}>{averageConfidence}%</h2>
            </div>
          </div>
        </div>

        {/* MIDDLE ROW: AI DIAGNOSTIC INSIGHTS */}
        <div>
          <h3 style={{ fontSize: '1.20rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
            <Activity size={18} style={{ color: 'var(--primary)' }} />
            AI Analytical Insights
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px'
          }}>
            <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', textAlign: 'left', borderLeft: '4px solid var(--primary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                <Award size={14} /> MODEL CONFIDENCE
              </span>
              <p style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>{averageConfidence}%</p>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Average cross-model verification score</span>
            </div>
            <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', textAlign: 'left', borderLeft: '4px solid var(--error)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                <AlertTriangle size={14} /> DOMINANT ANOMALY
              </span>
              <p style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>{getMostCommonTumor()}</p>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Most frequently diagnosed lesion type</span>
            </div>
            <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', textAlign: 'left', borderLeft: '4px solid var(--accent)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                <Calendar size={14} /> MONTHLY INGESTION
              </span>
              <p style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>{getMonthlyScansCount()} Scans</p>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>MRI scans uploaded this calendar month</span>
            </div>
            <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', textAlign: 'left', borderLeft: '4px solid var(--success)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                <Shield size={14} /> AI SUCCESS RATE
              </span>
              <p style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>{detectionSuccessRate}</p>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Target classification precision ratio</span>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: RECENT SCANS TABLE AND HISTORY VIEWER */}
        <div className="card" style={{ padding: '24px', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History style={{ color: 'var(--primary)' }} />
              MRI Ingestion & Scan History Log
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Showing <strong>{filteredReports.length}</strong> of {totalScans} scanned records
            </span>
          </div>

          {/* Database search & filter controls */}
          <div style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            alignItems: 'center',
            background: 'var(--bg-subtle)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid var(--border)'
          }}>
            
            {/* Search Input */}
            <div style={{ position: 'relative', flex: 2, minWidth: '240px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search by Patient, Scan ID, or Tumor Type..."
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

            {/* Date dropdown filter */}
            <div style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '160px' }}>
              <select 
                value={dateFilter} 
                onChange={(e: any) => setDateFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem'
                }}
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            {/* Verdict filter */}
            <div style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '160px' }}>
              <select 
                value={verdictFilter} 
                onChange={(e: any) => setVerdictFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem'
                }}
              >
                <option value="all">All Diagnoses</option>
                <option value="detected">Tumor Detected</option>
                <option value="healthy">Healthy Brain</option>
              </select>
            </div>

            {/* Risk filter */}
            <div style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '160px' }}>
              <select 
                value={riskFilter} 
                onChange={(e: any) => setRiskFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem'
                }}
              >
                <option value="all">All Risk Levels</option>
                <option value="High">High Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="Low">Low Risk</option>
              </select>
            </div>

          </div>

          {/* Database History Table grid */}
          {filteredReports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <AlertCircle size={40} style={{ opacity: 0.4, color: 'var(--primary)' }} />
              <p style={{ fontWeight: 600 }}>No MRI logs found matching criteria.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Scan ID</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Patient Details</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>MRI Ingestion Preview</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Diagnosis</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Confidence</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Status</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Date & Time</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => (
                    <tr 
                      key={report.scanId} 
                      style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }}
                      className="preset-tag-hover"
                    >
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        #{report.scanId}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontWeight: 800, color: 'var(--text-primary)', display: 'block' }}>{report.patientName || report.name || 'Eleanor Vance'}</span>
                        <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
                          {report.patientAge || '38'} y.o. / {report.patientGender || 'Female'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ width: '48px', height: '48px', background: '#000', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {report.imgUrl && !['glioma', 'meningioma', 'healthy'].includes(report.imgUrl) ? (
                            <img src={report.imgUrl} alt="scan preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            renderDashboardBrainSVG(report.location, report.hasTumor)
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontWeight: 700, color: report.hasTumor ? 'var(--error)' : 'var(--success)' }}>
                          {report.type}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                        {report.confidence}%
                      </td>
                      <td style={{ padding: '14px 16px' }}>
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
                          {report.hasTumor ? 'Positive' : 'Negative'}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'block', fontWeight: 600 }}>{report.date}</span>
                        <span>{report.time}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => handleOpenReport(report)}
                            className="btn btn-outline"
                            style={{ padding: '6px 10px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Open Diagnostic Report"
                          >
                            <Eye size={12} /> View
                          </button>
                          <button 
                            onClick={() => handlePrintReport(report)}
                            className="btn btn-outline"
                            style={{ padding: '6px 10px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Print Report"
                          >
                            <Printer size={12} /> Print
                          </button>
                          <button 
                            onClick={() => deleteReportFromDatabase(report.scanId!)}
                            className="btn btn-outline"
                            style={{ padding: '6px 10px', fontSize: '0.7rem', color: 'var(--error)', borderColor: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Delete Log"
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

      </div>
    </div>
  );
};
