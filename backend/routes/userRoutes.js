const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/profile', requireAuth, userController.getProfile);
router.put('/profile', requireAuth, userController.updateProfile);
router.put('/profile/password', requireAuth, userController.changePassword);
router.delete('/profile', requireAuth, userController.deleteAccount);

module.exports = router;
