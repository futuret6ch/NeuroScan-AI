const roboflowService = require('../services/roboflowService');
const logger = require('../utils/logger');
const dbService = require('../services/dbService');

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
      
      // Convert buffer to base64 URL for persistent rendering
      const imgUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

      // Build data matching schema
      const userId = req.user ? req.user.id : 'u1'; // Fallback to default user Eleanor Vance if unauthenticated
      const userName = req.user ? req.user.name : 'Eleanor Vance';
      
      // Retrieve full profile details for age/gender mapping if authenticated
      let patientAge = '38';
      let patientGender = 'Female';
      if (req.user) {
        const fullUser = await dbService.findUserById(req.user.id);
        if (fullUser) {
          patientAge = String(fullUser.age || '38');
          patientGender = fullUser.gender || 'Female';
        }
      }

      const scanRecord = {
        userId,
        patientName: userName,
        patientAge,
        patientGender,
        hasTumor: analysisResult.hasTumor,
        type: analysisResult.type,
        confidence: analysisResult.confidence,
        findings: analysisResult.findings,
        recommendation: analysisResult.recommendation,
        location: analysisResult.location,
        riskLevel: analysisResult.riskLevel || (analysisResult.hasTumor ? 'High' : 'Low'),
        imgUrl,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      };

      // Save to Database
      const savedScan = await dbService.saveScan(scanRecord);
      
      const responseData = {
        status: 'success',
        tumorDetected: savedScan.hasTumor,
        tumorType: savedScan.type,
        confidence: savedScan.confidence,
        recommendation: `${savedScan.findings} ${savedScan.recommendation}`,
        analysisTime,
        
        // Frontend compatibility fields
        hasTumor: savedScan.hasTumor,
        type: savedScan.type,
        findings: savedScan.findings,
        recommendationText: savedScan.recommendation,
        location: savedScan.location,
        riskLevel: savedScan.riskLevel,
        imgUrl: savedScan.imgUrl,
        scanId: savedScan.scanId,
        date: savedScan.date,
        time: savedScan.time,
        
        duration: `${analysisTimeSec} seconds`,
        resolution: '512 × 512',
        model: 'RF-DETR Small',
        dataset: 'Brain Tumor MRI Dataset',
        engine: 'Roboflow AI'
      };

      logger.info(`MRI analysis complete for ${file.originalname}. Scan ID: ${savedScan.scanId}. Time: ${analysisTimeSec}s`);
      
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
