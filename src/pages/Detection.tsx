import React, { useState, useRef, useEffect } from 'react';
import { Upload, Cpu, Trash2, RefreshCw, CheckCircle2, AlertTriangle, AlertCircle, ZoomIn, Maximize2, Download, Home, FileText } from 'lucide-react';

interface ScanResult {
  hasTumor: boolean;
  type: string;
  confidence: number;
  location: { x: number; y: number; r: number } | null;
  recommendation: string;
  findings: string;
  imgUrl?: string;
  name?: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  scanId: string;
  duration: string;
  resolution: string;
  model: string;
  dataset: string;
  engine: string;
  symptoms: string;
  nextStep: string;
  specialist: string;
  description: string;
}

interface DetectionProps {
  onScanComplete: (result: any) => void;
  setCurrentPage?: (page: string) => void;
}

export const Detection: React.FC<DetectionProps> = ({ onScanComplete, setCurrentPage }) => {
  // File & Upload States
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [uploadTime, setUploadTime] = useState<string>('');
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Patient Info States
  const [patientName, setPatientName] = useState<string>('John Doe');
  const [patientAge, setPatientAge] = useState<string>('45');
  const [patientGender, setPatientGender] = useState<string>('Male');

  // Scanning States
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'ready' | 'analyzing' | 'completed'>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [activeLog, setActiveLog] = useState<string>('');
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([]);
  
  // Results & Dashboard States
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [animatedConfidence, setAnimatedConfidence] = useState<number>(0);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Presets data for testing
  const presets = [
    {
      id: 'glioma',
      name: 'Case #2041: Glioma',
      fileName: 'mri_scan_glioma_t2.png',
      fileSize: '1.4 MB',
      type: 'Glioma',
      hasTumor: true,
      confidence: 97.8,
      riskLevel: 'High' as const,
      findings: 'AI analysis suggests characteristics consistent with Glioma.',
      recommendation: 'A significant infiltrative mass displaying contrast enhancement is localized in the left frontal lobe. Surrounding vasogenic edema is present. This result is intended as an AI-assisted screening output and should always be reviewed by a qualified neurologist or radiologist before any medical decision is made.',
      description: 'Gliomas start in the glial cells that surround and support nerve cells. They are typically infiltrative and require active surgical or oncology management.',
      symptoms: 'Recurrent headaches, cognitive changes, localized muscle weakness, seizures, speech difficulty.',
      nextStep: 'High-contrast brain MRI scan, MR spectroscopy, stereotactic biopsy.',
      specialist: 'Neuro-oncologist / Neurosurgical Team',
      location: { x: 38, y: 45, r: 8 }
    },
    {
      id: 'meningioma',
      name: 'Case #9812: Meningioma',
      fileName: 'mri_scan_meningioma_t1c.png',
      fileSize: '1.1 MB',
      type: 'Meningioma',
      hasTumor: true,
      confidence: 96.5,
      riskLevel: 'Medium' as const,
      findings: 'AI analysis suggests characteristics consistent with Meningioma.',
      recommendation: 'A well-circumscribed, dural-based extra-axial mass is localized along the right frontoparietal convex outer meninges. Displays classical "dural tail" sign. This result is intended as an AI-assisted screening output and should always be reviewed by a qualified oncologist before any medical decision is made.',
      description: 'Meningiomas arise from the meninges, the membranes that surround your brain and spinal cord. They are usually slow-growing and benign.',
      symptoms: 'Vision changes (blurriness), worsening headaches, hearing loss, localized memory problems.',
      nextStep: 'Radiotherapy evaluation, high-resolution brain MRI, contrast enhancement follow-up.',
      specialist: 'Radiation Oncologist / Neurosurgeon',
      location: { x: 68, y: 32, r: 6 }
    },
    {
      id: 'healthy',
      name: 'Case #1102: Healthy Brain',
      fileName: 'mri_scan_healthy_flair.png',
      fileSize: '1.2 MB',
      type: 'N/A (Healthy Brain)',
      hasTumor: false,
      confidence: 99.2,
      riskLevel: 'Low' as const,
      findings: 'AI analysis suggests no brain tumor anomalies detected.',
      recommendation: 'No immediate neuro-oncological intervention needed. Ventricular configuration and cortical sulcal patterns are within normal physiological limits. This result is intended as an AI-assisted screening output and should always be reviewed by a qualified radiologist.',
      description: 'Normal brain scan without space-occupying lesions, midline shift, or vasogenic edema.',
      symptoms: 'Non-oncological symptoms (tension, primary migraine headaches, fatigue).',
      nextStep: 'Routine preventative physicals, treat symptomatic headaches.',
      specialist: 'Primary Care Physician / General Neurologist',
      location: null
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
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert("Invalid file format. Please upload a JPG, JPEG, or PNG image.");
      return;
    }

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
        setSelectedFile(file);
        setAnalysisStatus('ready');
        setScanResult(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Helper to load presets
  const handleLoadPreset = (presetId: string) => {
    if (analysisStatus === 'analyzing') return;

    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setFileName(preset.fileName);
      setFileSize(preset.fileSize);
      setUploadTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setImagePreview(presetId); // Presets rendered via SVG
      
      // Build a dummy File representation of the preset for multipart upload
      const dummyBlob = new Blob([presetId], { type: 'text/plain' });
      const presetFile = new File([dummyBlob], `${presetId}_preset_scan.png`, { type: 'image/png' });
      setSelectedFile(presetFile);
      
      setAnalysisStatus('ready');
      setScanResult(null);
    }
  };

  const handleClearImage = () => {
    setImagePreview(null);
    setFileName('');
    setFileSize('');
    setUploadTime('');
    setSelectedFile(null);
    setAnalysisStatus('idle');
    setScanResult(null);
    setProgress(0);
    setAnalysisLogs([]);
    setActiveLog('');
    setIsZoomed(false);
    setIsFullscreen(false);
    setAnimatedConfidence(0);
  };

  const uploadAndAnalyzeMRI = (fileToUpload: File) => {
    setAnalysisStatus('analyzing');
    setProgress(0);
    setActiveLog('Preparing image...');
    setAnalysisLogs(['Preparing image...']);

    const xhr = new XMLHttpRequest();
    let analyzeTimer: any;

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);
        // Map upload to 0-40% progress
        const uploadProgress = Math.round(percentComplete * 0.4);
        setProgress(uploadProgress);
        setActiveLog(`Uploading... (${percentComplete}%)`);
        
        if (percentComplete === 100) {
          setActiveLog('Analyzing...');
          setAnalysisLogs((prev) => [
            ...prev,
            'MRI file successfully uploaded to backend secure memory.',
            'Analyzing features...'
          ]);

          // Increment mock progress slowly from 40% to 95% while backend processes
          let mockProgress = 40;
          analyzeTimer = setInterval(() => {
            mockProgress += 1;
            if (mockProgress >= 95) {
              clearInterval(analyzeTimer);
            } else {
              setProgress(mockProgress);
              if (mockProgress === 55) {
                setActiveLog('Sending image for AI analysis...');
                setAnalysisLogs((prev) => [...prev, 'Sending image to Roboflow Serverless API...']);
              }
              if (mockProgress === 72) {
                setActiveLog('Detecting brain abnormalities...');
                setAnalysisLogs((prev) => [...prev, 'Running CNN object detection models...']);
              }
              if (mockProgress === 88) {
                setActiveLog('Finalizing prediction...');
                setAnalysisLogs((prev) => [...prev, 'Consolidating confidence ratios...']);
              }
            }
          }, 80);
        }
      }
    });

    xhr.addEventListener('load', () => {
      clearInterval(analyzeTimer);
      if (xhr.status >= 200 && xhr.status < 300) {
        setActiveLog('Receiving Results...');
        setAnalysisLogs((prev) => [
          ...prev,
          'Predictions received from server.',
          'De-serializing data frames...'
        ]);
        
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.success && response.data) {
            setProgress(100);
            
            // Short delay for visual polish of "Receiving Results..."
            setTimeout(() => {
              setScanResult(response.data);
              setAnalysisStatus('completed');
              setAnalysisLogs((prev) => [...prev, 'Diagnosis Complete.']);
            }, 600);
          } else {
            throw new Error(response.error || 'Server returned an invalid result formatting.');
          }
        } catch (err: any) {
          loggerError(err.message || 'Result rendering failed.');
        }
      } else {
        try {
          const response = JSON.parse(xhr.responseText);
          loggerError(response.error || 'Server rejected request.');
        } catch {
          loggerError(`Inference request failed with HTTP: ${xhr.status}`);
        }
      }
    });

    xhr.addEventListener('error', () => {
      clearInterval(analyzeTimer);
      loggerError('Network error. Unable to establish connection to the host server.');
    });

    xhr.addEventListener('abort', () => {
      clearInterval(analyzeTimer);
      loggerError('Request terminated by client.');
    });

    // Send multipart POST request to Vite proxy endpoint
    xhr.open('POST', '/api/analyze');
    const formData = new FormData();
    formData.append('image', fileToUpload);
    xhr.send(formData);
  };

  const loggerError = (msg: string) => {
    setActiveLog('Error');
    setAnalysisLogs((prev) => [...prev, `[FAIL] ${msg}`]);
    setAnalysisStatus('ready'); // reset button to try again
    setProgress(0);
    alert(msg);
  };

  // Animated Counter for Confidence Gauge
  useEffect(() => {
    if (analysisStatus === 'completed' && scanResult) {
      let start = 0;
      const end = scanResult.confidence;
      const duration = 1200; // 1.2 seconds
      const startTime = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const prog = Math.min(elapsed / duration, 1);
        const current = start + (end - start) * prog;
        setAnimatedConfidence(Number(current.toFixed(1)));
        if (prog < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [analysisStatus, scanResult]);

  const getStatusStep = () => {
    if (analysisStatus === 'completed') return 'Complete';
    if (progress >= 95) return 'Receiving Results...';
    if (progress > 40) return 'Analyzing...';
    return 'Uploading...';
  };

  const handleStartAnalysis = () => {
    if (analysisStatus !== 'ready' || !selectedFile) return;
    uploadAndAnalyzeMRI(selectedFile);
  };

  const handleRetryAnalysis = () => {
    if (!selectedFile) return;
    uploadAndAnalyzeMRI(selectedFile);
  };

  const handleViewReport = () => {
    if (scanResult) {
      onScanComplete({
        hasTumor: scanResult.hasTumor,
        type: scanResult.type + (scanResult.hasTumor ? ' (Detected)' : ''),
        confidence: scanResult.confidence,
        location: scanResult.location,
        recommendation: scanResult.recommendation,
        findings: scanResult.findings,
        imgUrl: (imagePreview !== 'glioma' && imagePreview !== 'meningioma' && imagePreview !== 'healthy') ? imagePreview || undefined : undefined,
        name: patientName
      });
    }
  };

  // Image downloader helper
  const handleDownloadImage = () => {
    if (!imagePreview) return;
    
    // Create mock download link
    const link = document.createElement('a');
    link.download = fileName || 'patient_mri_scan.png';
    
    if (['glioma', 'meningioma', 'healthy'].includes(imagePreview)) {
      // Create SVG blob download
      const svgEl = document.querySelector('.viewer-mri-svg');
      if (svgEl) {
        const svgString = new XMLSerializer().serializeToString(svgEl);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const blobUrl = URL.createObjectURL(svgBlob);
        link.href = blobUrl;
        link.click();
        URL.revokeObjectURL(blobUrl);
      }
    } else {
      link.href = imagePreview;
      link.click();
    }
  };

  const renderMRIViewerSVG = (presetId: string, customClass = 'viewer-mri-svg') => {
    let loc = null;
    if (presetId === 'glioma') loc = presets[0].location;
    if (presetId === 'meningioma') loc = presets[1].location;

    return (
      <svg 
        viewBox="0 0 100 100" 
        className={customClass}
        style={{ 
          width: '75%', 
          height: '75%', 
          fill: 'none', 
          stroke: '#FFFFFF', 
          strokeWidth: '0.9',
          transition: 'var(--transition)'
        }}
      >
        {/* Skull */}
        <path d="M 50,12 C 28,12 20,24 20,48 C 20,68 26,73 31,78 C 34,80 37,78 40,80 C 42,82 43,88 50,88 C 57,88 58,82 60,80 C 63,78 66,80 69,78 C 74,73 80,68 80,48 C 80,24 72,12 50,12 Z" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
        
        {/* Brain Cortex */}
        <path d="M 50,15 C 33,15 23,25 23,48 C 23,65 28,68 32,73 C 34,75 35,74 37,76 C 39,78 40,84 50,84 C 60,84 61,78 63,76 C 65,74 66,75 68,73 C 72,68 77,65 77,48 C 77,25 67,15 50,15 Z" stroke="rgba(255,255,255,0.75)" strokeWidth="1.2" />

        {/* Brain Internal Midline */}
        <path d="M 50,15 L 50,84" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" strokeDasharray="1,1" />
        
        {/* Cerebral lobes folds */}
        <path d="M 40,20 C 35,23 35,32 45,35" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
        <path d="M 30,30 C 26,35 34,40 40,43" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
        <path d="M 33,48 C 28,52 35,58 45,55" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
        <path d="M 60,20 C 65,23 65,32 55,35" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
        <path d="M 70,30 C 74,35 66,40 60,43" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
        <path d="M 67,48 C 72,52 65,58 55,55" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
        
        {/* Ventricles */}
        <path d="M 48,36 C 45,40 45,46 48,50" stroke="var(--primary)" strokeWidth="1" />
        <path d="M 52,36 C 55,40 55,46 52,50" stroke="var(--primary)" strokeWidth="1" />

        {/* Tumor target highlight overlay */}
        {analysisStatus === 'completed' && loc && (
          <circle 
            cx={loc.x} 
            cy={loc.y} 
            r={loc.r} 
            stroke="var(--error)" 
            strokeWidth="1.5" 
            fill="rgba(239, 68, 68, 0.3)"
            className="pulse-effect"
            style={{ filter: 'drop-shadow(0 0 8px var(--error))' }} 
          />
        )}
      </svg>
    );
  };

  // Radial progress calculations
  const gaugeRadius = 35;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const animatedOffset = gaugeCircumference - (gaugeCircumference * animatedConfidence) / 100;

  return (
    <div className="animate-fade-in" style={{ padding: '30px 0', width: '100%' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        
        {/* INITIAL IDLE & READY STATES WRAPPER */}
        {analysisStatus !== 'completed' && (
          <div>
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

            {/* Demographics inputs */}
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

            {/* Upload panels layout */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '30px',
              alignItems: 'stretch'
            }}>
              
              {/* Left panel uploader */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'var(--bg-card)', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '1.2rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Upload size={18} style={{ color: 'var(--primary)' }} />
                  MRI Scan Upload & Verification
                </h3>

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
                    <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      {analysisStatus === 'analyzing' && <div className="scanner-line" />}
                      <div className="scanner-overlay" />

                      {['glioma', 'meningioma', 'healthy'].includes(imagePreview) ? (
                        renderMRIViewerSVG(imagePreview)
                      ) : (
                        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <img src={imagePreview} alt="MRI scan" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <div style={{ background: 'var(--bg-subtle)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <Upload size={28} style={{ display: 'block', margin: 'auto' }} />
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Drag and drop MRI scan here</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Supports JPG, JPEG, PNG formats (Max 10 MB)</p>
                      </div>
                      <button disabled={analysisStatus === 'analyzing'} onClick={() => fileInputRef.current?.click()} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem', marginTop: '8px' }}>Browse Files</button>
                      <input type="file" ref={fileInputRef} accept=".jpg,.jpeg,.png" onChange={handleFileSelect} style={{ display: 'none' }} />
                    </div>
                  )}
                </div>

                {imagePreview && (
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button disabled={analysisStatus === 'analyzing'} onClick={() => fileInputRef.current?.click()} className="btn btn-outline" style={{ padding: '10px 16px', fontSize: '0.85rem', flex: 1 }}><RefreshCw size={14} /> Replace Image</button>
                    <button disabled={analysisStatus === 'analyzing'} onClick={handleClearImage} className="btn btn-outline" style={{ padding: '10px 16px', fontSize: '0.85rem', flex: 1, color: 'var(--error)', borderColor: 'rgba(239,68,68,0.15)' }}><Trash2 size={14} /> Clear Image</button>
                  </div>
                )}
              </div>

              {/* Right panel metadata & action */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px', background: 'var(--bg-card)', textAlign: 'left' }}>
                <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Cpu size={18} style={{ color: 'var(--primary)' }} />
                  Diagnosis Control & Analysis
                </h3>

                {analysisStatus === 'idle' && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '260px', textAlign: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                    <AlertCircle size={40} style={{ color: 'var(--primary)', opacity: 0.6 }} />
                    <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Upload an MRI scan to begin AI analysis.</p>
                  </div>
                )}

                {analysisStatus === 'ready' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ width: '60px', height: '60px', background: '#000', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {['glioma', 'meningioma', 'healthy'].includes(imagePreview!) ? (
                            <div style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 600, margin: 'auto' }}>PRESET</div>
                          ) : (
                            <img src={imagePreview!} alt="Thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'block' }}>{fileName}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Size: <strong>{fileSize}</strong></span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Uploaded: <strong>{uploadTime}</strong></span>
                        </div>
                      </div>
                    </div>
                    <button onClick={handleStartAnalysis} className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1.05rem', borderRadius: '12px' }}><Cpu size={18} /> Analyze MRI Scan</button>
                  </div>
                )}

                {analysisStatus === 'analyzing' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--primary)' }}>
                        <RefreshCw size={20} className="spin-animation" style={{ color: 'var(--accent)' }} />
                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>AI Model Inference in progress...</span>
                      </div>

                      {/* Premium Stepper */}
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '10px',
                        background: 'rgba(0, 0, 0, 0.15)',
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                        margin: '8px 0'
                      }}>
                        {['Uploading...', 'Analyzing...', 'Receiving Results...', 'Complete'].map((step, idx) => {
                          const currentStep = getStatusStep();
                          const steps = ['Uploading...', 'Analyzing...', 'Receiving Results...', 'Complete'];
                          const currentIdx = steps.indexOf(currentStep);
                          const stepIdx = idx;
                          const isCurrent = currentStep === step;
                          const isPast = stepIdx < currentIdx;
                          
                          return (
                            <div key={idx} style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '10px',
                              fontSize: '0.825rem',
                              fontWeight: isCurrent ? 700 : isPast ? 600 : 400,
                              color: isCurrent 
                                ? 'var(--primary)' 
                                : isPast 
                                  ? 'var(--success)' 
                                  : 'var(--text-muted)',
                              transition: 'all 0.3s ease',
                              opacity: isCurrent || isPast ? 1 : 0.5
                            }}>
                              <span style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                width: '22px', 
                                height: '22px', 
                                borderRadius: '50%', 
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                border: `2px solid ${
                                  isCurrent 
                                    ? 'var(--primary)' 
                                    : isPast 
                                      ? 'var(--success)' 
                                      : 'var(--border)'
                                }`,
                                background: isCurrent 
                                  ? 'rgba(99, 102, 241, 0.1)' 
                                  : isPast 
                                    ? 'rgba(52, 211, 153, 0.1)' 
                                    : 'transparent',
                                color: isCurrent 
                                  ? 'var(--primary)' 
                                  : isPast 
                                    ? 'var(--success)' 
                                    : 'var(--text-muted)',
                                transition: 'all 0.3s ease'
                              }}>
                                {isPast ? '✓' : idx + 1}
                              </span>
                              <span>{step}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                          <span style={{ color: 'var(--primary)' }}>{activeLog}</span>
                          <span style={{ color: 'var(--text-primary)' }}>{progress}%</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '100px', overflow: 'hidden' }}>
                          <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(to right, var(--primary), var(--accent))', borderRadius: '100px' }} />
                        </div>
                      </div>
                      <div style={{ background: 'var(--text-primary)', border: '1px solid #1E293B', borderRadius: '8px', padding: '12px 16px', height: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'var(--mono)', fontSize: '0.75rem', color: '#E2E8F0' }}>
                        {analysisLogs.map((log, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '6px', color: idx === analysisLogs.length - 1 ? '#34D399' : '#94A3B8' }}>
                            <span>&gt;</span><span>{log}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ============= PREMIUM AI RESULTS DASHBOARD ============= */}
        {/* ======================================================== */}
        {analysisStatus === 'completed' && scanResult && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px', textAlign: 'left' }}>
            
            {/* Top Dashboard Header */}
            <div style={{
              background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)',
              color: '#FFFFFF',
              borderRadius: '20px',
              padding: '24px 32px',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px'
            }}>
              <div>
                <span style={{ 
                  fontSize: '0.75rem', 
                  background: 'rgba(255, 255, 255, 0.15)', 
                  padding: '4px 10px', 
                  borderRadius: '30px', 
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Clinical Verdict Report
                </span>
                <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', color: '#FFFFFF', fontWeight: 800, marginTop: '8px' }}>
                  AI Analysis Complete
                </h1>
              </div>

              {/* Status Header Meta fields */}
              <div style={{ 
                display: 'flex', 
                gap: '24px', 
                flexWrap: 'wrap',
                fontSize: '0.85rem'
              }}>
                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '16px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)', display: 'block', fontSize: '0.725rem', textTransform: 'uppercase' }}>Analysis Status</span>
                  <span style={{ fontWeight: 700, color: '#34D399', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <CheckCircle2 size={14} /> Completed
                  </span>
                </div>
                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '16px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)', display: 'block', fontSize: '0.725rem', textTransform: 'uppercase' }}>Date & Time</span>
                  <span style={{ fontWeight: 700 }}>{new Date().toLocaleDateString()} {uploadTime}</span>
                </div>
                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '16px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)', display: 'block', fontSize: '0.725rem', textTransform: 'uppercase' }}>Analysis Duration</span>
                  <span style={{ fontWeight: 700 }}>{scanResult.duration}</span>
                </div>
                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '16px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)', display: 'block', fontSize: '0.725rem', textTransform: 'uppercase' }}>Scan ID</span>
                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>{scanResult.scanId}</span>
                </div>
              </div>
            </div>

            {/* Process Flow Stepper Indicator */}
            <div className="card animate-fade-in" style={{ 
              background: 'var(--bg-card)', 
              padding: '16px 24px', 
              borderRadius: '16px',
              border: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              marginTop: '-10px'
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Analysis Lifecycle:
              </span>
              <div style={{ 
                display: 'flex', 
                gap: '20px', 
                alignItems: 'center', 
                flexWrap: 'wrap'
              }}>
                {['Uploading...', 'Analyzing...', 'Receiving Results...', 'Complete'].map((step, idx) => {
                  const isCurrent = step === 'Complete';
                  const isPast = step !== 'Complete';
                  return (
                    <div key={idx} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      fontSize: '0.825rem',
                      fontWeight: 700,
                      color: isCurrent ? 'var(--primary)' : 'var(--success)'
                    }}>
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        width: '22px', 
                        height: '22px', 
                        borderRadius: '50%', 
                        fontSize: '0.75rem',
                        border: `2px solid ${isCurrent ? 'var(--primary)' : 'var(--success)'}`,
                        background: isCurrent ? 'rgba(99, 102, 241, 0.1)' : 'rgba(52, 211, 153, 0.1)',
                        color: isCurrent ? 'var(--primary)' : 'var(--success)'
                      }}>
                        {isPast ? '✓' : idx + 1}
                      </span>
                      <span>{step}</span>
                      {idx < 3 && <span style={{ color: 'var(--border)', opacity: 0.5 }}>→</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Two-Column Midsection: Viewer and Verdicts */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '30px',
              alignItems: 'stretch'
            }}>
              
              {/* LEFT PANEL: DICOM MRI Viewer */}
              <div className="card" style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '20px', 
                background: 'var(--bg-card)',
                justifyContent: 'space-between',
                padding: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Maximize2 size={16} style={{ color: 'var(--primary)' }} />
                    Cranial MRI Scanner Viewer
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Resolution: {scanResult.resolution}</span>
                </div>

                {/* DICOM viewbox */}
                <div style={{
                  position: 'relative',
                  aspectRatio: '1',
                  background: '#000',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                  maxHeight: '340px'
                }}>
                  <div className="scanner-overlay" />
                  
                  {/* Image/Preset SVG Wrapper with zoom transition */}
                  <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    transform: isZoomed ? 'scale(1.4)' : 'scale(1)',
                    transition: 'transform 0.4s ease'
                  }}>
                    {['glioma', 'meningioma', 'healthy'].includes(imagePreview!) ? (
                      renderMRIViewerSVG(imagePreview!)
                    ) : (
                      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={imagePreview!} alt="MRI scan review" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        {scanResult.hasTumor && (
                          <div className="tumor-indicator" style={{
                            top: '40%',
                            left: '55%',
                            width: '45px',
                            height: '45px'
                          }} />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Clinical Viewer Actions Row */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px'
                }}>
                  <button 
                    onClick={() => setIsZoomed(!isZoomed)} 
                    className={`btn ${isZoomed ? 'btn-primary' : 'btn-outline'}`}
                    style={{ padding: '8px', fontSize: '0.75rem', gap: '4px', display: 'flex', flexDirection: 'column', borderRadius: '8px' }}
                  >
                    <ZoomIn size={16} /> {isZoomed ? 'Zoom Out' : 'Zoom In'}
                  </button>
                  <button 
                    onClick={() => setIsFullscreen(true)} 
                    className="btn btn-outline"
                    style={{ padding: '8px', fontSize: '0.75rem', gap: '4px', display: 'flex', flexDirection: 'column', borderRadius: '8px' }}
                  >
                    <Maximize2 size={16} /> Full Screen
                  </button>
                  <button 
                    onClick={handleDownloadImage}
                    className="btn btn-outline"
                    style={{ padding: '8px', fontSize: '0.75rem', gap: '4px', display: 'flex', flexDirection: 'column', borderRadius: '8px' }}
                  >
                    <Download size={16} /> Download
                  </button>
                  <button 
                    onClick={handleClearImage} 
                    className="btn btn-outline"
                    style={{ padding: '8px', fontSize: '0.75rem', gap: '4px', display: 'flex', flexDirection: 'column', borderRadius: '8px', color: 'var(--error)' }}
                  >
                    <RefreshCw size={16} /> Replace
                  </button>
                </div>
              </div>

              {/* RIGHT PANEL: Professional Medical Verdict Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px'
              }}>
                {/* Card 1: Detection Status */}
                <div className="card card-pulse-entry" style={{ 
                  background: 'var(--bg-card)', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  animationDelay: '0.05s'
                }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Detection Status
                  </span>
                  <div>
                    <span style={{ 
                      fontSize: '1.2rem', 
                      fontWeight: 800, 
                      color: scanResult.hasTumor ? 'var(--error)' : 'var(--success)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginTop: '12px'
                    }}>
                      {scanResult.hasTumor ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                      {scanResult.hasTumor ? 'Brain Tumor Detected' : 'No Brain Tumor Detected'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                      Diagnostic screening assessment.
                    </span>
                  </div>
                </div>

                {/* Card 2: Tumor Classification */}
                <div className="card card-pulse-entry" style={{ 
                  background: 'var(--bg-card)', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  animationDelay: '0.1s'
                }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Tumor Classification
                  </span>
                  <div>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '8px' }}>
                      {scanResult.type}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                      Tissue class model index.
                    </span>
                  </div>
                </div>

                {/* Card 3: Confidence Score with radial animated gauge */}
                <div className="card card-pulse-entry" style={{ 
                  background: 'var(--bg-card)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px',
                  gridColumn: 'span 1',
                  animationDelay: '0.15s'
                }}>
                  <div style={{ position: 'relative', width: '90px', height: '90px' }}>
                    <svg width="90" height="90" style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}>
                      <circle cx="45" cy="45" r={gaugeRadius} stroke="var(--border)" strokeWidth="6" fill="transparent" />
                      <circle 
                        cx="45" 
                        cy="45" 
                        r={gaugeRadius} 
                        stroke={scanResult.hasTumor ? 'var(--error)' : 'var(--success)'} 
                        strokeWidth="6" 
                        fill="transparent"
                        strokeDasharray={gaugeCircumference}
                        strokeDashoffset={animatedOffset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                      />
                    </svg>
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      color: 'var(--text-primary)'
                    }}>
                      {animatedConfidence}%
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>
                      Confidence Score
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                      AI validation probability.
                    </span>
                  </div>
                </div>

                {/* Card 4: Risk Level */}
                <div className="card card-pulse-entry" style={{ 
                  background: 'var(--bg-card)', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  animationDelay: '0.2s'
                }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Risk Level
                  </span>
                  <div>
                    <span style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: 800, 
                      color: scanResult.riskLevel === 'High' ? 'var(--error)' : scanResult.riskLevel === 'Medium' ? 'var(--warning)' : 'var(--success)',
                      display: 'block',
                      marginTop: '8px'
                    }}>
                      {scanResult.riskLevel}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                      Urgency indicator matrix.
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* AI Recommendation Panel */}
            <div className="card" style={{ background: 'var(--bg-card)', borderLeft: `4px solid ${scanResult.hasTumor ? 'var(--error)' : 'var(--success)'}` }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>AI Recommendation Verdict</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <strong>{scanResult.findings}</strong> {scanResult.recommendation}
              </p>
            </div>

            {/* Tumor Information Cards Grid */}
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', fontWeight: 800 }}>Tumor Information Sheet</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px'
              }}>
                <div className="card" style={{ padding: '20px', background: 'var(--bg-card)' }}>
                  <span style={{ display: 'block', fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Tumor Type</span>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.4 }}>{scanResult.description}</p>
                </div>
                <div className="card" style={{ padding: '20px', background: 'var(--bg-card)' }}>
                  <span style={{ display: 'block', fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Possible Symptoms</span>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.4 }}>{scanResult.symptoms}</p>
                </div>
                <div className="card" style={{ padding: '20px', background: 'var(--bg-card)' }}>
                  <span style={{ display: 'block', fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Suggested Next Step</span>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.4 }}>{scanResult.nextStep}</p>
                </div>
                <div className="card" style={{ padding: '20px', background: 'var(--bg-card)' }}>
                  <span style={{ display: 'block', fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Specialist Required</span>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.4 }}>{scanResult.specialist}</p>
                </div>
              </div>
            </div>

            {/* Analysis details parameters table */}
            <div className="card" style={{ background: 'var(--bg-card)', padding: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-primary)' }}>Technical Diagnostic Parameters</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '20px',
                fontSize: '0.85rem'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.725rem' }}>Model Used</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{scanResult.model}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.725rem' }}>Dataset</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{scanResult.dataset}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.725rem' }}>Image Resolution</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{scanResult.resolution}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.725rem' }}>Analysis Time</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{scanResult.duration}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.725rem' }}>Detection Engine</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{scanResult.engine}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              marginTop: '10px'
            }}>
              <button 
                onClick={handleViewReport} 
                className="btn btn-primary"
                style={{ padding: '12px 24px', borderRadius: '8px' }}
              >
                <FileText size={16} /> Download Medical Report
              </button>
              <button 
                onClick={handleClearImage} 
                className="btn btn-outline"
                style={{ padding: '12px 24px', borderRadius: '8px' }}
              >
                <RefreshCw size={16} /> Analyze Another MRI
              </button>
              {setCurrentPage && (
                <button 
                  onClick={() => setCurrentPage('home')} 
                  className="btn btn-outline"
                  style={{ padding: '12px 24px', borderRadius: '8px' }}
                >
                  <Home size={16} /> Return Home
                </button>
              )}
            </div>

          </div>
        )}

      </div>

      {/* FULLSCREEN CLINICAL DIALOG MODAL */}
      {isFullscreen && imagePreview && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px'
        }}>
          <button 
            onClick={() => setIsFullscreen(false)} 
            className="btn btn-primary"
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              padding: '8px 16px',
              borderRadius: '8px',
              zIndex: 1010
            }}
          >
            Close Viewer
          </button>
          
          <div style={{ 
            width: '100%', 
            height: '100%', 
            maxWidth: '800px', 
            maxHeight: '800px',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center'
          }}>
            {['glioma', 'meningioma', 'healthy'].includes(imagePreview) ? (
              renderMRIViewerSVG(imagePreview, 'viewer-mri-svg fullscreen-svg')
            ) : (
              <img src={imagePreview} alt="Fullscreen MRI scan" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            )}
          </div>
        </div>
      )}

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
        @keyframes pulse-slide-in {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .card-pulse-entry {
          animation: pulse-slide-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .fullscreen-svg {
          width: 90% !important;
          height: 90% !important;
        }
      `}</style>
    </div>
  );
};
