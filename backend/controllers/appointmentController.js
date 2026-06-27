const dbService = require('../services/dbService');
const logger = require('../utils/logger');

exports.bookAppointment = async (req, res) => {
  try {
    const { date, time, doctorName, symptoms } = req.body;
    if (!date || !time || !doctorName) {
      logger.warn('Appointment booking rejected: Missing parameters.');
      return res.status(400).json({ success: false, message: 'Please provide date, time, and doctor.' });
    }
    
    const userId = req.user.id;
    const patientName = req.user.name;

    const newApp = await dbService.saveAppointment({
      userId,
      patientName,
      date,
      time,
      doctorName,
      symptoms
    });

    logger.info(`Appointment booked successfully: ${newApp.appointmentId} for user ${patientName}`);

    return res.status(201).json({
      success: true,
      message: 'Appointment booked successfully.',
      appointment: newApp
    });
  } catch (err) {
    logger.error('Appointment booking failed:', err);
    return res.status(500).json({ success: false, message: 'Failed to book appointment.' });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    let appointments;

    if (role === 'Administrator' || role === 'Doctor') {
      appointments = await dbService.getAllAppointments();
    } else {
      appointments = await dbService.getAppointmentsForUser(userId);
    }

    return res.status(200).json({
      success: true,
      appointments
    });
  } catch (err) {
    logger.error('Failed to retrieve appointments:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve appointments.' });
  }
};
