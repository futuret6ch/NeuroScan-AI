const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/book', requireAuth, appointmentController.bookAppointment);
router.get('/', requireAuth, appointmentController.getAppointments);

module.exports = router;
