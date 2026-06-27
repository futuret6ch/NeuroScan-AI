const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/send-report', requireAuth, emailController.sendReportEmail);

module.exports = router;
