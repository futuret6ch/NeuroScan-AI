const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/config');
const logger = require('./utils/logger');
const analyzeRoutes = require('./routes/analyzeRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const scanRoutes = require('./routes/scanRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const emailRoutes = require('./routes/emailRoutes');
const errorHandler = require('./middleware/errorHandler');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const app = express();

// Optional JWT parser for demo ingestion mapping
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET || 'neuroscan-super-secret-key-999');
    } catch (e) {}
  }
  next();
};

// Ensure uploads directory exists
const uploadsDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (e) {
    console.warn('[WARN] - Could not create uploads directory:', e.message);
  }
}

// Global Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://*.roboflow.com", "https://serverless.roboflow.com"],
      connectSrc: ["'self'", "https://*.roboflow.com", "https://serverless.roboflow.com"]
    }
  }
}));

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : 'http://localhost:5173',
  optionsSuccessStatus: 200,
  credentials: true
};
app.use(cors(corsOptions));
app.use(morgan('dev')); // Dev level HTTP request logs
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiters Configuration
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const scanLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 analyses per minute
  message: {
    success: false,
    error: 'Rate limit exceeded: 10 MRI analyses per minute. Please try again shortly.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limits
app.use('/api', apiLimiter);
app.use('/api/analyze', scanLimiter);

// Serve static assets in production
if (config.nodeEnv === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    env: config.nodeEnv,
    engine: config.isRoboflowConfigured() ? 'Roboflow Serverless API' : 'Simulated Offline Mode'
  });
});

// Main routes mapping
app.use('/api', optionalAuth, analyzeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/email', emailRoutes);

// --- VERCEL REQUIRED COMPATIBILITY ROUTES ---

// 1. /api/scan/upload (POST)
app.post('/api/scan/upload', optionalAuth, (req, res) => {
  const uploadMiddleware = require('./middleware/upload');
  uploadMiddleware.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message || 'File upload failed.', message: err.message || 'File upload failed.' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload an MRI image file.', message: 'Please upload an MRI image file.' });
    }
    const imgUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully.',
      data: {
        fileName: req.file.originalname,
        fileSize: `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`,
        imgUrl
      }
    });
  });
});

// 2. /api/scan/analyze (POST)
const analyzeController = require('./controllers/analyzeController');
const uploadMiddleware = require('./middleware/upload');
app.post('/api/scan/analyze', optionalAuth, uploadMiddleware.single('image'), analyzeController.analyzeMRI);

// 3. /api/report/generate (POST)
const dbService = require('./services/dbService');
app.post('/api/report/generate', optionalAuth, async (req, res) => {
  try {
    const { patientName, patientAge, patientGender, hasTumor, type, confidence, findings, recommendation, riskLevel, imgUrl } = req.body;
    const scanRecord = {
      userId: req.user ? req.user.id : 'u1',
      patientName: patientName || 'Eleanor Vance',
      patientAge: patientAge || '38',
      patientGender: patientGender || 'Female',
      hasTumor: hasTumor !== undefined ? hasTumor : true,
      type: type || 'Glioma (Malignant)',
      confidence: confidence ? Number(confidence) : 95.0,
      findings: findings || 'Visualized mass lesion with vasogenic edema.',
      recommendation: recommendation || 'Urgent neurosurgical consultation advised.',
      riskLevel: riskLevel || 'High',
      imgUrl: imgUrl || '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    };
    const savedScan = await dbService.saveScan(scanRecord);
    return res.status(200).json({
      success: true,
      message: 'Medical report generated successfully.',
      data: savedScan
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || 'Internal server error.', message: err.message || 'Internal server error.' });
  }
});

// 4. /api/report/history (GET)
const { requireAuth } = require('./middleware/authMiddleware');
const scanController = require('./controllers/scanController');
app.get('/api/report/history', requireAuth, scanController.getScans);

// 5. /api/auth/profile (GET)
const userController = require('./controllers/userController');
app.get('/api/auth/profile', requireAuth, userController.getProfile);

// 6. /api/user/profile (GET/PUT/DELETE)
app.get('/api/user/profile', requireAuth, userController.getProfile);
app.put('/api/user/profile', requireAuth, userController.updateProfile);
app.delete('/api/user/profile', requireAuth, userController.deleteAccount);

// Wildcard fallback for client-side routing in production
if (config.nodeEnv === 'production') {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Unmatched route fallback
app.use((req, res, next) => {
  res.status(404);
  next(new Error(`API Route not found: ${req.originalUrl}`));
});

// Global Error handling middleware
app.use(errorHandler);

// Start server
if (require.main === module) {
  app.listen(config.port, () => {
    logger.info(`NeuroScan AI backend running in [${config.nodeEnv}] on port: ${config.port}`);
    if (config.isRoboflowConfigured()) {
      logger.info('Roboflow AI active classification integration verified.');
    } else {
      logger.warn('Running in Offline Simulation Mode (Mock predictions fallback active).');
    }
  });
}

module.exports = app;
