const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const analyzeController = require('../controllers/analyzeController');

// Route for image analysis: uploads single 'image' field and processes it
router.post('/analyze', upload.single('image'), analyzeController.analyzeMRI);

module.exports = router;
