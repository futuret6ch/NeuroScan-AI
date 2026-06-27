const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/config');
const logger = require('./utils/logger');
const analyzeRoutes = require('./routes/analyzeRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Standard middleware
app.use(cors()); // Allow cross-origin requests (React development config)
app.use(morgan('dev')); // Dev level HTTP request logs
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use('/api', analyzeRoutes);

// Unmatched route fallback
app.use((req, res, next) => {
  res.status(404);
  next(new Error(`API Route not found: ${req.originalUrl}`));
});

// Global Error handling middleware
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  logger.info(`NeuroScan AI backend running in [${config.nodeEnv}] on port: ${config.port}`);
  if (config.isRoboflowConfigured()) {
    logger.info('Roboflow AI active classification integration verified.');
  } else {
    logger.warn('Running in Offline Simulation Mode (Mock predictions fallback active).');
  }
});
