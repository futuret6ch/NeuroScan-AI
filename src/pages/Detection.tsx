import React, { useState, useRef, useEffect } from 'react';
import { Upload, Cpu, Trash2, RefreshCw, CheckCircle2, AlertTriangle, AlertCircle, Calendar, ArrowRight } from 'lucide-react';

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

interface DetectionProps {
  onScanComplete: (result: ScanResult & { imgUrl?: string; name: string }) => void;
}

export const Detection: React.FC<DetectionProps> = ({ onScanComplete }) => {
  // File & Upload States
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [uploadTime, setUploadTime] = useState<string>('');
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Patient Meta States
  const [patientName, setPatientName] = useState<string>('John Doe');
  const [patientAge, setPatientAge] = useState<string>('45');
  const [patientGender, setPatientGender] = useState<string>('Male');

  // Scanning States
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'ready' | 'analyzing' | 'completed'>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [activeLog, setActiveLog] = useState<string>('');
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([]);
  
  // Results State
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  // Presets data for testing
  const presets = [
    {
      id: 'glioma',
      name: 'Case #2041: Glioma',
      fileName: 'mri_scan_glioma_t2.png',
      fileSize: '1.4 MB',
      type: 'Glioma (Malignant)',
      hasTumor: true,
      confidence: 98.4,
      location: { x: 38, y: 45, r: 8 },
      findings: 'A significant infiltrative mass displaying contrast enhancement is localized in the left frontal lobe. Surrounding vasogenic edema is present.',
      recommendation: 'Urgent neurosurgical consultation is recommended. Schedule a stereotactic biopsy to confirm histopathology and a high-resolution brain MRI with MR spectroscopy.'
    },
    {
      id: 'meningioma',
      name: 'Case #9812: Meningioma',
      fileName: 'mri_scan_meningioma_t1c.png',
      fileSize: '1.1 MB',
      type: 'Meningioma (Benign)',
      hasTumor: true,
      confidence: 96.8,
      location: { x: 68, y: 32, r: 6 },
      findings: 'A well-circumscribed, dural-based extra-axial mass is localized along the right frontoparietal convex outer meninges. Displays classical "dural tail" sign.',
      recommendation: 'Neurosurgical follow-up recommended. Evaluate for surgical resection vs. stereotactic radiosurgery (Gamma Knife) depending on patient symptom presentation.'
    },
    {
      id: 'healthy',
      name: 'Case #1102: Healthy Brain',
      fileName: 'mri_scan_healthy_flair.png',
      fileSize: '1.2 MB',
      type: 'No Tumor Detected',
      hasTumor: false,
      confidence: 99.2,
      location: null,
      findings: 'Ventricular configuration and cortical sulcal patterns are within normal physiological limits. No focal parenchymal lesions, mass effect, or anomalous contrast enhancement identified.',
      recommendation: 'No immediate neuro-oncological intervention needed. Schedule routine preventative screenings as clinically indicated.'
    }
  ];

  // Drag and Drop Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (analysisStatus === 'analyzing') return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    // Check file format
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert("Invalid file format. Please upload a JPG, JPEG, or PNG image.");
      return;
    }

    // Check file size (10 MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File size exceeds 10 MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImagePreview(event.target.result as string);
        setFileName(file.name);
        setFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');
        setUploadTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        setAnalysisStatus('ready');
        setScanResult(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Helper to load clinical presets
  const handleLoadPreset = (presetId: string) => {
    if (analysisStatus === 'analyzing') return;

    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setFileName(preset.fileName);
      setFileSize(preset.fileSize);
      setUploadTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      
      // We will render our standard brain SVG outline in the preview or set a dummy URL
      setImagePreview(presetId); // Set the preset id to render custom preset SVG in Left Panel
      setAnalysisStatus('ready');
      setScanResult(null);
    }
  };

  const handleClearImage = () => {
    setImagePreview(null);
    setFileName('');
    setFileSize('');
    setUploadTime('');
    setAnalysisStatus('idle');
    setScanResult(null);
    setProgress(0);
    setAnalysisLogs([]);
    setActiveLog('');
  };

  // Automated Analysis Simulator effect
  useEffect(() => {
    let progressInterval: any;
    let logInterval: any;
    
    if (analysisStatus === 'analyzing') {
      const logsSequence = [
        { text: 'Preparing image...', progress: 15 },
        { text: 'Sending image for AI analysis...', progress: 45 },
        { text: 'Detecting brain abnormalities...', progress: 75 },
        { text: 'Finalizing prediction...', progress: 95 }
      ];

      let logIndex = 0;
      setActiveLog(logsSequence[0].text);
      setAnalysisLogs([logsSequence[0].text]);

      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 1;
        });
      }, 60); // 60ms * 100 = ~6 seconds scan

      logInterval = setInterval(() => {
        logIndex++;
        if (logIndex < logsSequence.length) {
          const nextLog = logsSequence[logIndex].text;
          setActiveLog(nextLog);
          setAnalysisLogs((prev) => [...prev, nextLog]);
        }
      }, 1500); // Trigger log change every 1.5 seconds
    }

    return () => {
      clearInterval(progressInterval);
      clearInterval(logInterval);
    };
  }, [analysisStatus]);

  // Complete Scan State Hook
  useEffect(() => {
    if (progress === 100 && analysisStatus === 'analyzing') {
      // Mocking results depending on uploaded image/preset loaded
      let mockResult: ScanResult;

      if (imagePreview === 'meningioma') {
        mockResult = {
          hasTumor: true,
          type: 'Meningioma (Benign)',
          confidence: 96.8,
          location: { x: 68, y: 32, r: 6 },
          findings: 'A well-circumscribed, dural-based extra-axial mass is localized along the right frontoparietal convex outer meninges. Displays classical "dural tail" sign.',
          recommendation: 'Neurosurgical follow-up recommended. Evaluate for surgical resection vs. stereotactic radiosurgery (Gamma Knife) depending on patient symptom presentation.'
        };
      } else if (imagePreview === 'healthy') {
        mockResult = {
          hasTumor: false,
          type: 'No Tumor Detected',
          confidence: 99.2,
          location: null,
          findings: 'Ventricular configuration and cortical sulcal patterns are within normal physiological limits. No focal parenchymal lesions, mass effect, or anomalous contrast enhancement identified.',
          recommendation: 'No immediate neuro-oncological intervention needed. Schedule routine preventative screenings as clinically indicated.'
        };
      } else {
        // Glioma preset or any user uploaded custom scan result
        mockResult = {
          hasTumor: true,
          type: 'Glioma (Malignant)',
          confidence: 98.4,
          location: { x: 38, y: 45, r: 8 },
          findings: 'A significant infiltrative mass displaying contrast enhancement is localized in the left frontal lobe. Surrounding vasogenic edema is present.',
          recommendation: 'Urgent neurosurgical consultation is recommended. Schedule a stereotactic biopsy to confirm histopathology and a high-resolution brain MRI with MR spectroscopy.'
        };
      }

      setScanResult(mockResult);
      setAnalysisStatus('completed');
      setAnalysisLogs((prev) => [...prev, 'Diagnostic assessment complete.']);
    }
  }, [progress, analysisStatus, imagePreview]);

  const handleStartAnalysis = () => {
    if (analysisStatus !== 'ready') return;
    setProgress(0);
    setAnalysisLogs([]);
    setAnalysisStatus('analyzing');
  };

  const handleViewReport = () => {
    if (scanResult) {
      onScanComplete({
        ...scanResult,
        imgUrl: (imagePreview !== 'glioma' && imagePreview !== 'meningioma' && imagePreview !== 'healthy') ? imagePreview || undefined : undefined,
        name: patientName
      });
    }
  };

  const renderLeftPanelBrainSVG = (presetId: string) => {
    let loc = null;
    if (presetId === 'glioma') loc = presets[0].location;
    if (presetId === 'meningioma') loc = presets[1].location;

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg 
          viewBox="0 0 100 100" 
          style={{ 
            width: '75%', 
            height: '75%', 
            fill: 'none', 
            stroke: '#FFFFFF', 
            strokeWidth: '1',
          }}
        >
          {/* Skull Outline */}
          <path d="M 50,12 C 28,12 20,24 20,48 C 20,68 26,73 31,78 C 34,80 37,78 40,80 C 42,82 43,88 50,88 C 57,88 58,82 60,80 C 63,78 66,80 69,78 C 74,73 80,68 80,48 C 80,24 72,12 50,12 Z" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
          
          {/* Cortex */}
          <path d="M 50,15 C 33,15 23,25 23,48 C 23,65 28,68 32,73 C 34,75 35,74 37,76 C 39,78 40,84 50,84 C 60,84 61,78 63,76 C 65,74 66,75 68,73 C 72,68 77,65 77,48 C 77,25 67,15 50,15 Z" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" />
          
          {/* Details */}
          <path d="M 50,15 L 50,84" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" strokeDasharray="1,1" />
          <path d="M 40,20 C 35,23 35,32 45,35" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
          <path d="M 30,30 C 26,35 34,40 40,43" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
          <path d="M 33,48 C 28,52 35,58 45,55" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
          <path d="M 60,20 C 65,23 65,32 55,35" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
          <path d="M 70,30 C 74,35 66,40 60,43" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
          <path d="M 67,48 C 72,52 65,58 55,55" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
          
          {/* Ventricles */}
          <path d="M 48,36 C 45,40 45,46 48,50" stroke="var(--primary)" strokeWidth="1" />
          <path d="M 52,36 C 55,40 55,46 52,50" stroke="var(--primary)" strokeWidth="1" />

          {/* Tumor Overlay */}
          {analysisStatus === 'completed' && loc && (
            <circle 
              cx={loc.x} 
              cy={loc.y} 
              r={loc.r} 
              stroke="var(--error)" 
              strokeWidth="1.5" 
              fill="rgba(239, 68, 68, 0.3)"
              className="pulse-effect"
              style={{ filter: 'drop-shadow(0 0 6px var(--error))' }} 
            />
          )}
        </svg>
      </div>
    );
  };

  return (
    <div className="animate-fade-in" style={{ padding: '40px 0', width: '100%' }}>
      <div className="container">
        
        {/* Title Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="badge badge-primary" style={{ marginBottom: '12px' }}>
            <Cpu size={14} />
            <span>AI Diagnostic Interface</span>
          </div>
          <h2>NeuroScan AI Dashboard</h2>
          <p style={{ maxWidth: '640px', margin: '0 auto', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Upload high-resolution cranial MRI scans in JPG/JPEG/PNG format to run voxel-level tumor segmentation models.
          </p>
        </div>

        {/* Form setup for patient record (Optional clinical data) */}
        <div className="card" style={{ padding: '16px 24px', marginBottom: '30px', background: 'var(--bg-card)' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>PATIENT FULL NAME</label>
              <input 
                type="text" 
                value={patientName} 
                disabled={analysisStatus === 'analyzing'}
                onChange={(e) => setPatientName(e.target.value)} 
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>PATIENT AGE</label>
              <input 
                type="number" 
                value={patientAge} 
                disabled={analysisStatus === 'analyzing'}
                onChange={(e) => setPatientAge(e.target.value)} 
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>GENDER</label>
              <select 
                value={patientGender} 
                disabled={analysisStatus === 'analyzing'}
                onChange={(e) => setPatientGender(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-start', marginTop: '16px' }}>
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  disabled={analysisStatus === 'analyzing'}
                  onClick={() => handleLoadPreset(preset.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: '1px solid var(--border)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                  className="preset-tag-hover"
                >
                  Load {preset.id.toUpperCase()} Case
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dashboard Panels Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '30px',
          alignItems: 'stretch'
        }}>
          
          {/* ================= LEFT PANEL ================= */}
          <div className="card" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '20px', 
            background: 'var(--bg-card)',
            justifyContent: 'space-between'
          }}>
            <h3 style={{ fontSize: '1.2rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Upload size={18} style={{ color: 'var(--primary)' }} />
              MRI Scan Upload & Verification
            </h3>

            {/* Upload Drag & Drop Area / Preview */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              style={{
                position: 'relative',
                flex: 1,
                minHeight: '300px',
                border: isDragActive ? '2px dashed var(--primary)' : '2px dashed var(--border)',
                background: isDragActive ? 'var(--accent-light)' : 'rgba(0, 0, 0, 0.02)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                transition: 'var(--transition)'
              }}
            >
              {imagePreview ? (
                // Display Uploaded Image Preview or Preset SVG
                <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {/* Laser Scan line overlay during analyzing state */}
                  {analysisStatus === 'analyzing' && <div className="scanner-line" />}
                  
                  {/* Sweep scan overlay */}
                  <div className="scanner-overlay" />

                  {/* Render content depending on upload vs preset */}
                  {['glioma', 'meningioma', 'healthy'].includes(imagePreview) ? (
                    renderLeftPanelBrainSVG(imagePreview)
                  ) : (
                    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img 
                        src={imagePreview} 
                        alt="MRI scan view" 
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                      {analysisStatus === 'completed' && scanResult?.hasTumor && (
                        <div className="tumor-indicator" style={{
                          top: '40%',
                          left: '55%',
                          width: '50px',
                          height: '50px'
                        }} />
                      )}
                    </div>
                  )}
                </div>
              ) : (
                // Empty Uploader State
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '30px',
                  textAlign: 'center',
                  color: 'var(--text-secondary)'
                }}>
                  <div style={{
                    background: 'var(--bg-subtle)',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)'
                  }}>
                    <Upload size={28} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      Drag and drop MRI scan here
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Supports JPG, JPEG, PNG formats (Max 10 MB)
                    </p>
                  </div>
                  <button 
                    disabled={analysisStatus === 'analyzing'}
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '0.85rem', marginTop: '8px' }}
                  >
                    Browse Files
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    accept=".jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </div>
              )}
            </div>

            {/* Replace / Clear Buttons (Shows only when file is loaded) */}
            {imagePreview && (
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  disabled={analysisStatus === 'analyzing'}
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-outline"
                  style={{ padding: '10px 16px', fontSize: '0.85rem', flex: 1 }}
                >
                  <RefreshCw size={14} /> Replace Image
                </button>
                <button
                  disabled={analysisStatus === 'analyzing'}
                  onClick={handleClearImage}
                  className="btn btn-outline"
                  style={{ 
                    padding: '10px 16px', 
                    fontSize: '0.85rem', 
                    flex: 1, 
                    color: 'var(--error)', 
                    borderColor: 'rgba(239,68,68,0.15)' 
                  }}
                >
                  <Trash2 size={14} /> Clear Image
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </div>
            )}
          </div>

          {/* ================= RIGHT PANEL ================= */}
          <div className="card" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '24px', 
            background: 'var(--bg-card)',
            textAlign: 'left'
          }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={18} style={{ color: 'var(--primary)' }} />
              Diagnosis Control & Analysis
            </h3>

            {/* 1. INITIAL IDLE STATE */}
            {analysisStatus === 'idle' && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                minHeight: '260px',
                textAlign: 'center',
                gap: '12px',
                color: 'var(--text-secondary)'
              }}>
                <AlertCircle size={40} style={{ color: 'var(--primary)', opacity: 0.6 }} />
                <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  Upload an MRI scan to begin AI analysis.
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '280px' }}>
                  Please load one of the clinical trial cases or upload a DICOM-derived slice to get started.
                </p>
              </div>
            )}

            {/* 2. FILE UPLOADED STATE (READY TO SCAN) */}
            {analysisStatus === 'ready' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* File Metadata Card */}
                  <div style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'center'
                  }}>
                    {/* Tiny Thumbnail */}
                    <div style={{ 
                      width: '60px', 
                      height: '60px', 
                      background: '#000', 
                      borderRadius: '8px', 
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {['glioma', 'meningioma', 'healthy'].includes(imagePreview!) ? (
                        <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 600 }}>PRESET</div>
                      ) : (
                        <img src={imagePreview!} alt="Mini thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'block' }}>
                        {fileName}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Size: <strong>{fileSize}</strong>
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Uploaded: <strong>{uploadTime}</strong>
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: 'var(--accent-light)', padding: '12px 16px', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                    <Calendar size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>Double-check patient demographics and file parameters before initiating neural network processing.</span>
                  </div>

                </div>

                {/* Big Analyze Button */}
                <button
                  onClick={handleStartAnalysis}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '1.05rem',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-md)'
                  }}
                >
                  <Cpu size={18} /> Analyze MRI Scan
                </button>
              </div>
            )}

            {/* 3. RUNNING ANALYSIS STATE (SCANNING LOGS) */}
            {analysisStatus === 'analyzing' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Spinning loader */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--primary)' }}>
                    <RefreshCw size={20} className="spin-animation" style={{ color: 'var(--accent)' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>AI Model Inference in progress...</span>
                  </div>

                  {/* Visual Progress bar */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                      <span style={{ color: 'var(--primary)' }}>{activeLog}</span>
                      <span style={{ color: 'var(--text-primary)' }}>{progress}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '100px', overflow: 'hidden' }}>
                      <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(to right, var(--primary), var(--accent))', borderRadius: '100px', transition: 'width 0.1s linear' }} />
                    </div>
                  </div>

                  {/* Terminal Console Logs */}
                  <div style={{
                    background: 'var(--text-primary)',
                    border: '1px solid #1E293B',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    height: '140px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    fontFamily: 'var(--mono)',
                    fontSize: '0.75rem',
                    color: '#E2E8F0'
                  }}>
                    {analysisLogs.map((log, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '6px', color: idx === analysisLogs.length - 1 ? '#34D399' : '#94A3B8' }}>
                        <span>&gt;</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Disabled analysis button */}
                <button
                  disabled
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '1.05rem',
                    borderRadius: '12px',
                    opacity: 0.6,
                    cursor: 'not-allowed'
                  }}
                >
                  <Cpu size={18} /> Processing Inference...
                </button>
              </div>
            )}

            {/* 4. COMPLETED SCAN RESULTS PANEL */}
            {analysisStatus === 'completed' && scanResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade-in">
                
                {/* Results placeholder cards grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px'
                }}>
                  {/* Status card */}
                  <div style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '12px'
                  }}>
                    <span style={{ display: 'block', fontSize: '0.675rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                      Detection Status
                    </span>
                    <span style={{ 
                      fontSize: '0.9rem', 
                      fontWeight: 700, 
                      color: scanResult.hasTumor ? 'var(--error)' : 'var(--success)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px',
                      marginTop: '4px'
                    }}>
                      {scanResult.hasTumor ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                      {scanResult.hasTumor ? 'Abnormal' : 'Normal'}
                    </span>
                  </div>

                  {/* Tumor Type card */}
                  <div style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '12px'
                  }}>
                    <span style={{ display: 'block', fontSize: '0.675rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                      Tumor Type
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px', display: 'block' }}>
                      {scanResult.type}
                    </span>
                  </div>

                  {/* Confidence Score card */}
                  <div style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '12px'
                  }}>
                    <span style={{ display: 'block', fontSize: '0.675rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                      Confidence Score
                    </span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginTop: '2px', display: 'block' }}>
                      {scanResult.confidence}%
                    </span>
                  </div>

                  {/* Analysis Time card */}
                  <div style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '12px'
                  }}>
                    <span style={{ display: 'block', fontSize: '0.675rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                      Analysis Time
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px', display: 'block' }}>
                      5.82 seconds
                    </span>
                  </div>
                </div>

                {/* Recommendation card */}
                <div style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <span style={{ display: 'block', fontSize: '0.675rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                    AI Recommendation
                  </span>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {scanResult.recommendation}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                  <button
                    onClick={handleViewReport}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px'
                    }}
                  >
                    View Full Medical Report <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={handleClearImage}
                    className="btn btn-outline"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px'
                    }}
                  >
                    Clear & Scan New Patient
                  </button>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

      <style>{`
        .preset-tag-hover:hover {
          background: var(--accent-light) !important;
          border-color: var(--primary) !important;
          color: var(--primary) !important;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin-animation {
          animation: spin 1.5s linear infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.06); opacity: 0.6; }
        }
        .pulse-effect {
          animation: pulse 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};
