const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Protect all admin routes
router.use(requireAuth);
router.use(requireRole(['Administrator']));

router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.delete('/users/:id', adminController.deleteUser);
router.get('/stats', adminController.getSystemStats);

module.exports = router;
