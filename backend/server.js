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
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
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
