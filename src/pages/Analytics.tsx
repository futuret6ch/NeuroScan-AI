import React, { useState, useEffect } from 'react';
import { 
  LineChart, BarChart, PieChart, AreaChart, ConfidenceTrend 
} from '../components/AnalyticsCharts';
import { 
  Activity, ShieldAlert, CheckCircle, Database, Server, Cpu, HardDrive, 
  Download, FileText, FileSpreadsheet, RefreshCw, UserCheck, Users, 
  Layers, Clock, ArrowUpRight, Award 
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
  
  // Clinical notes
  clinicalNotes?: string;
  doctorApproved?: boolean;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
}

interface AnalyticsProps {
  token: string;
}

export const Analytics: React.FC<AnalyticsProps> = ({ token }) => {
  const [stats, setStats] = useState<any>(null);
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch stats
      const statsRes = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      if (statsRes.ok) {
        setStats(statsData.stats);
      } else {
        throw new Error(statsData.message || 'Stats fetch failed.');
      }

      // Fetch scan history logs
      const scanRes = await fetch('/api/report/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const scanData = await scanRes.json();
      if (scanRes.ok) {
        setScans(scanData.scans || []);
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to analytics database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [token]);

  // Dynamic CSV Export
  const handleExportCSV = () => {
    if (scans.length === 0) return;
    const headers = ['Scan ID', 'Patient Name', 'Age', 'Gender', 'AI Diagnosis', 'Confidence', 'Risk Level', 'Date', 'Time', 'Verified By Doctor'];
    const rows = scans.map(s => [
      s.scanId,
      s.patientName || s.name || 'Eleanor Vance',
      s.patientAge || '38',
      s.patientGender || 'Female',
      s.type,
      s.confidence + '%',
      s.riskLevel || (s.hasTumor ? 'High' : 'Low'),
      s.date,
      s.time,
      s.doctorApproved ? 'Yes' : 'No'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `neuroscan_diagnostic_records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export TXT Excel compatible layout
  const handleExportExcel = () => {
    if (scans.length === 0) return;
    const headers = ['Scan ID', 'Patient Name', 'Age', 'Gender', 'AI Diagnosis', 'Confidence', 'Risk Level', 'Date', 'Time', 'Verified By Doctor'];
    const rows = scans.map(s => [
      s.scanId,
      s.patientName || s.name || 'Eleanor Vance',
      s.patientAge || '38',
      s.patientGender || 'Female',
      s.type,
      s.confidence + '%',
      s.riskLevel || (s.hasTumor ? 'High' : 'Low'),
      s.date,
      s.time,
      s.doctorApproved ? 'Yes' : 'No'
    ]);

    const tsvContent = "data:text/tab-separated-values;charset=utf-8," 
      + [headers.join('\t'), ...rows.map(e => e.join('\t'))].join('\n');
    const encodedUri = encodeURI(tsvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `neuroscan_excel_export_${new Date().toISOString().split('T')[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-secondary)' }}>
        <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 16px auto', color: 'var(--primary)' }} />
        <p style={{ fontWeight: 600 }}>Assembling clinical analytics databases...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--error)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <ShieldAlert size={48} />
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Analytics Load Failure</h3>
        <p style={{ maxWidth: '400px', fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>{error || 'Unable to load diagnostic statistics.'}</p>
        <button onClick={fetchAnalyticsData} className="btn btn-primary" style={{ padding: '8px 18px' }}>Retry Connection</button>
      </div>
    );
  }

  // Format donut list
  const pieData = [
    { label: 'Tumor Detected', count: stats.tumorsDetected },
    { label: 'Healthy Brains', count: stats.healthyCount }
  ];

  return (
    <div className="animate-fade-in" style={{ padding: '30px 0', width: '100%', textAlign: 'left' }}>
      <div className="container" style={{ maxWidth: '1200px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* Banner with Export Actions */}
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
          boxShadow: 'var(--shadow-md)'
        }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Clinical AI Analytics Dashboard</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>System telemetry, active caseloads, and model accuracy tracking</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }} className="no-print">
            <button onClick={handleExportCSV} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileSpreadsheet size={14} /> Export CSV
            </button>
            <button onClick={handleExportExcel} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Download size={14} /> Export Excel
            </button>
            <button onClick={handlePrintPDF} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} /> Print Report
            </button>
          </div>
        </div>

        {/* OVERVIEW STATS ROW */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px'
        }}>
          <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', textAlign: 'left' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              <Users size={14} style={{ color: 'var(--primary)' }} /> TOTAL PATIENTS
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', margin: '10px 0 0 0' }}>{stats.patientCount}</h2>
          </div>
          <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', textAlign: 'left' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              <Layers size={14} style={{ color: 'var(--primary)' }} /> TOTAL MRI SCANS
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)', margin: '10px 0 0 0' }}>{stats.totalScans}</h2>
          </div>
          <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', textAlign: 'left' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              <ShieldAlert size={14} style={{ color: 'var(--error)' }} /> TUMORS DETECTED
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: stats.tumorsDetected > 0 ? 'var(--error)' : 'var(--text-primary)', margin: '10px 0 0 0' }}>{stats.tumorsDetected}</h2>
          </div>
          <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', textAlign: 'left' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              <CheckCircle size={14} style={{ color: 'var(--success)' }} /> HEALTHY PATIENTS
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--success)', margin: '10px 0 0 0' }}>{stats.healthyCount}</h2>
          </div>
          <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', textAlign: 'left' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              <FileText size={14} style={{ color: 'var(--primary)' }} /> REPORTS GENERATED
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', margin: '10px 0 0 0' }}>{stats.totalScans}</h2>
          </div>
          <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', textAlign: 'left' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              <Clock size={14} style={{ color: 'var(--accent)' }} /> AI REQUESTS TODAY
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent)', margin: '10px 0 0 0' }}>{stats.aiRequestsToday}</h2>
          </div>
          <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', textAlign: 'left' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              <Award size={14} style={{ color: 'var(--success)' }} /> AVG CONFIDENCE
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--success)', margin: '10px 0 0 0' }}>{stats.avgConfidence}%</h2>
          </div>
          <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', textAlign: 'left' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              <UserCheck size={14} style={{ color: 'var(--primary)' }} /> ACTIVE DOCTORS
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', margin: '10px 0 0 0' }}>{stats.doctorCount}</h2>
          </div>
        </div>

        {/* CHARTS ROW 1 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '30px'
        }}>
          {/* Daily MRI Scans */}
          <div className="card" style={{ padding: '24px', background: 'var(--bg-card)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} style={{ color: 'var(--primary)' }} />
              Daily Ingested Scans (7-Day Log)
            </h3>
            <div style={{ height: '200px' }}>
              <LineChart data={stats.dailyScans} />
            </div>
          </div>

          {/* Tumor Types bar */}
          <div className="card" style={{ padding: '24px', background: 'var(--bg-card)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} style={{ color: 'var(--primary)' }} />
              Tumor Classifications Breakdown
            </h3>
            <div style={{ height: '200px' }}>
              <BarChart data={stats.tumorTypes} />
            </div>
          </div>
        </div>

        {/* CHARTS ROW 2 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '30px'
        }}>
          {/* Detection donut */}
          <div className="card" style={{ padding: '24px', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} style={{ color: 'var(--primary)' }} />
              Detection Outcomes Distribution
            </h3>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PieChart data={pieData} />
            </div>
          </div>

          {/* Area Chart: Weekly AI requests */}
          <div className="card" style={{ padding: '24px', background: 'var(--bg-card)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} style={{ color: 'var(--accent)' }} />
              AI Inference Request Rate (Weekly)
            </h3>
            <div style={{ height: '200px' }}>
              <AreaChart data={stats.weeklyUsage} />
            </div>
          </div>
        </div>

        {/* CHARTS ROW 3: CONFIDENCE RATINGS TREND & PATIENT ANALYTICS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '30px'
        }}>
          {/* Confidence Trend */}
          <div className="card" style={{ padding: '24px', background: 'var(--bg-card)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={16} style={{ color: 'var(--success)' }} />
              AI Model Prediction Confidence Trend
            </h3>
            <div style={{ height: '200px' }}>
              <ConfidenceTrend data={stats.confidenceTrend} />
            </div>
          </div>

          {/* Patient Analytics Details */}
          <div className="card" style={{ padding: '24px', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Users size={16} style={{ color: 'var(--primary)' }} />
              Patient Demographics Insights
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', fontSize: '0.85rem' }}>
              <div style={{ background: 'var(--bg-subtle)', padding: '14px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Avg Patient Age</span>
                <strong style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>{stats.patientAnalytics.averageAge} Yrs</strong>
              </div>
              <div style={{ background: 'var(--bg-subtle)', padding: '14px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Lesion Target anomaly</span>
                <strong style={{ fontSize: '1.15rem', color: 'var(--error)' }}>{stats.patientAnalytics.mostCommonTumor}</strong>
              </div>
              <div style={{ background: 'var(--bg-subtle)', padding: '14px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Monthly Growth</span>
                <strong style={{ fontSize: '1.15rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  +{stats.patientAnalytics.monthlyGrowthPercent}% <ArrowUpRight size={14} />
                </strong>
              </div>
              <div style={{ background: 'var(--bg-subtle)', padding: '14px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Attending Gender split</span>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  F: {stats.patientAnalytics.genderDistribution.Female} | M: {stats.patientAnalytics.genderDistribution.Male}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: SYSTEM DIAGNOSTICS & LIVE ACTIVITY FEED */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '30px'
        }}>
          {/* SYSTEM HEALTH MONITOR */}
          <div className="card" style={{ padding: '24px', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Server size={16} style={{ color: 'var(--primary)' }} />
              Hospital System Monitor
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <Server size={14} style={{ color: 'var(--success)' }} /> Server Status
                </span>
                <span style={{ fontWeight: 800, color: 'var(--success)', textTransform: 'uppercase' }}>{stats.systemDiagnostics.serverStatus}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <Cpu size={14} style={{ color: 'var(--primary)' }} /> CPU Utilization
                </span>
                <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{stats.systemDiagnostics.cpuUsage}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <HardDrive size={14} style={{ color: 'var(--accent)' }} /> Memory Usage
                </span>
                <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{stats.systemDiagnostics.memoryUsage}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <Activity size={14} style={{ color: 'var(--success)' }} /> Roboflow Workflow API
                </span>
                <span style={{ fontWeight: 800, color: 'var(--success)', textTransform: 'uppercase' }}>{stats.systemDiagnostics.roboflowApiStatus}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                  <Database size={14} style={{ color: 'var(--primary)' }} /> Database Registers
                </span>
                <span style={{ fontWeight: 800, color: 'var(--success)', textTransform: 'uppercase' }}>{stats.systemDiagnostics.databaseStatus}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Disk Storage Limit</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{stats.systemDiagnostics.storageUsageDetails}</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${stats.systemDiagnostics.storageUsagePercent}%`, height: '100%', background: 'var(--primary)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* LIVE ACTIVITY FEED */}
          <div className="card" style={{ padding: '24px', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Clock size={16} style={{ color: 'var(--primary)' }} />
              Live Clinical Activity Feed
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
              {scans.length === 0 ? (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No clinical actions registered.</span>
              ) : (
                scans.slice(0, 5).map((scan, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: scan.hasTumor ? 'var(--error)' : 'var(--success)',
                      marginTop: '4px',
                      flexShrink: 0
                    }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                      <span style={{ color: 'var(--text-primary)' }}>
                        MRI analysis completed for patient <strong>{scan.patientName}</strong>. Diagnosis: <strong>{scan.type}</strong>.
                      </span>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
                        {scan.date} @ {scan.time} | Score: {scan.confidence}%
                      </span>
                      {scan.doctorApproved && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 700, marginTop: '2px' }}>
                          ✔ Approved by radiologist {scan.reviewedBy}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
