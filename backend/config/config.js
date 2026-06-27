require('dotenv').config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  roboflow: {
    apiKey: process.env.ROBOFLOW_API_KEY || '',
    modelId: process.env.ROBOFLOW_MODEL_ID || 'brain-tumor-detection-mri',
    version: process.env.ROBOFLOW_VERSION || '1'
  },
  // Helper to check if we are using placeholder credentials
  isRoboflowConfigured: () => {
    const key = process.env.ROBOFLOW_API_KEY;
    return key && key !== '' && key !== 'YOUR_API_KEY_HERE';
  }
};

module.exports = config;
