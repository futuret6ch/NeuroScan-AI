const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scanController');
const { requireAuth } = require('../middleware/authMiddleware');

// Protect all scan history routes
router.use(requireAuth);

router.get('/', scanController.getScans);
router.delete('/:id', scanController.deleteScan);
router.put('/:id/review', scanController.reviewScan);

module.exports = router;
