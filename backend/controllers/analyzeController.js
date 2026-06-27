const roboflowService = require('../services/roboflowService');
const logger = require('../utils/logger');

const analyzeController = {
  analyzeMRI: async (req, res, next) => {
    try {
      logger.info('Received MRI analyze request.');

      // Check if image file is uploaded
      if (!req.file) {
        logger.warn('Request rejected: Image file is missing.');
        return res.status(400).json({
          success: false,
          error: 'Please upload an MRI image file (JPEG, JPG, or PNG).'
        });
      }

      const file = req.file;
      const startTime = performance.now();
      
      // Perform Roboflow inference
      const analysisResult = await roboflowService.analyzeImage(file.buffer, file.originalname);
      
      const endTime = performance.now();
      const analysisTimeSec = ((endTime - startTime) / 1000).toFixed(2);
      const scanId = `NS-${Math.floor(Math.random() * 90000 + 10000)}-DX`;
      
      const analysisTime = `${analysisTimeSec}s`;
      
      const responseData = {
        status: 'success',
        tumorDetected: analysisResult.hasTumor,
        tumorType: analysisResult.type,
        confidence: analysisResult.confidence,
        recommendation: `${analysisResult.findings} ${analysisResult.recommendation}`,
        analysisTime,
        
        // Frontend compatibility fields
        hasTumor: analysisResult.hasTumor,
        type: analysisResult.type,
        findings: analysisResult.findings,
        recommendationText: analysisResult.recommendation,
        location: analysisResult.location,
        riskLevel: analysisResult.riskLevel,
        description: analysisResult.description,
        symptoms: analysisResult.symptoms,
        nextStep: analysisResult.nextStep,
        specialist: analysisResult.specialist,
        
        scanId,
        duration: `${analysisTimeSec} seconds`,
        resolution: '512 × 512',
        model: 'RF-DETR Small',
        dataset: 'Brain Tumor MRI Dataset',
        engine: 'Roboflow AI'
      };

      logger.info(`MRI analysis complete for ${file.originalname}. Scan ID: ${scanId}. Time: ${analysisTimeSec}s`);
      
      res.status(200).json({
        success: true,
        tumorDetected: responseData.tumorDetected,
        tumorType: responseData.tumorType,
        confidence: responseData.confidence,
        recommendation: responseData.recommendation,
        analysisTime: responseData.analysisTime,
        data: responseData
      });

    } catch (error) {
      logger.error('Analyze controller failed:', error);
      next(error); // Route to global Express error handler
    }
  }
};

module.exports = analyzeController;
