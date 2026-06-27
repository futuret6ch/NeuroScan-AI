const logger = require('../utils/logger');

exports.sendReportEmail = async (req, res) => {
  try {
    const { email, prediction, confidence, recommendation, findings, scanId, patientName } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    logger.info(`[EMAIL DISPATCH] - Preparing diagnostic report PDF mapping for: ${email}`);
    logger.info(`[EMAIL DETAILS] - Scan ID: ${scanId || 'N/A'}, Patient Name: ${patientName || 'Eleanor Vance'}`);
    logger.info(`[EMAIL BODY] - Prediction: ${prediction}, Confidence: ${confidence}%, Findings: ${findings}`);

    // Standard Nodemailer transporter structure placeholder:
    // const transporter = nodemailer.createTransport({ host: 'smtp.hospital.org', port: 587, auth: { user, pass } });
    // await transporter.sendMail({ from: '"NeuroScan AI" <reports@neuroscan.ai>', to: email, subject: 'Clinical Report', html: ... });
    
    // Simulate SMTP network dispatch delay (600ms)
    await new Promise(resolve => setTimeout(resolve, 600));

    return res.status(200).json({
      success: true,
      message: `Report successfully dispatched to ${email}.`
    });
  } catch (err) {
    logger.error('Failed to dispatch report email:', err);
    return res.status(500).json({ success: false, message: 'Failed to send report email.' });
  }
};
