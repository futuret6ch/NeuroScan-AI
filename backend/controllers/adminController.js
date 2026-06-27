const bcrypt = require('bcryptjs');
const dbService = require('../services/dbService');

exports.getUsers = async (req, res) => {
  try {
    const users = await dbService.getAllUsers();
    return res.status(200).json({ success: true, users });
  } catch (err) {
    console.error('[ERROR] - Failed to get users list:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, age, gender, bloodGroup, phone, specialty, hospital } = req.body;
    
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, password, and role.' });
    }

    const existing = await dbService.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'User already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = await dbService.registerUser({
      name,
      email,
      password: hashedPassword,
      role,
      age: age ? Number(age) : undefined,
      gender,
      bloodGroup,
      phone,
      specialty,
      hospital
    });

    const { password: _, ...safeUser } = newUser;
    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      user: safeUser
    });
  } catch (err) {
    console.error('[ERROR] - Admin failed to create user:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error.' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (userId === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
    }

    await dbService.deleteUser(userId);
    return res.status(200).json({ success: true, message: 'User and all related records deleted.' });
  } catch (err) {
    console.error('[ERROR] - Admin failed to delete user:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getSystemStats = async (req, res) => {
  try {
    const users = await dbService.getAllUsers();
    const scans = await dbService.getAllScans();

    const patientCount = users.filter(u => u.role === 'Patient').length;
    const doctorCount = users.filter(u => u.role === 'Doctor').length;
    const totalScans = scans.length;
    const tumorsDetected = scans.filter(s => s.hasTumor).length;
    const healthyCount = scans.filter(s => !s.hasTumor).length;

    // Anomalies breakdown
    const tumorTypes = {};
    scans.forEach(s => {
      if (s.hasTumor && s.type) {
        const type = s.type.split(' ')[0]; // E.g. Glioma, Meningioma
        tumorTypes[type] = (tumorTypes[type] || 0) + 1;
      }
    });

    // Average AI Confidence
    const avgConfidence = totalScans > 0 
      ? Number((scans.reduce((acc, s) => acc + s.confidence, 0) / totalScans).toFixed(1))
      : 0;

    return res.status(200).json({
      success: true,
      stats: {
        patientCount,
        doctorCount,
        totalScans,
        tumorsDetected,
        healthyCount,
        avgConfidence,
        tumorTypes,
        modelDetails: {
          engine: 'Roboflow Serverless RF-DET',
          dataset: 'Brain Tumor MRI v3-logic',
          resolution: '512x512 px',
          meanInferenceTime: '482ms'
        }
      }
    });
  } catch (err) {
    console.error('[ERROR] - Failed to fetch system stats:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
