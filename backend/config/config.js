require('dotenv').config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  roboflow: {
    apiKey: process.env.ROBOFLOW_API_KEY || '',
    workflowUrl: process.env.ROBOFLOW_WORKFLOW_URL || ''
  },
  // Helper to check if we are using placeholder credentials
  isRoboflowConfigured: () => {
    const key = process.env.ROBOFLOW_API_KEY;
    const url = process.env.ROBOFLOW_WORKFLOW_URL;
    return (
      key && key !== '' && key !== 'YOUR_API_KEY' && key !== 'YOUR_API_KEY_HERE' && key !== 'YOUR_PRIVATE_API_KEY' &&
      url && url !== '' && url !== 'YOUR_WORKFLOW_URL'
    );
  }
};

module.exports = config;
