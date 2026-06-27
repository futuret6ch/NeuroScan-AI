const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dbService = require('../services/dbService');

const JWT_SECRET = process.env.JWT_SECRET || 'neuroscan-super-secret-key-999';

// Sign JWT token helper
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, age, gender, bloodGroup, phone, specialty, hospital } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    // Verify existing email
    const existing = await dbService.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account is already registered with this email address.' });
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Save user
    const newUser = await dbService.registerUser({
      name,
      email,
      password: hashedPassword,
      role: role || 'Patient',
      age: age ? Number(age) : undefined,
      gender,
      bloodGroup,
      phone,
      specialty,
      hospital
    });

    const token = generateToken(newUser);
    const { password: _, ...safeUser } = newUser;

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('[ERROR] - Registration failed:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email and password.' });
    }

    const user = await dbService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const matches = bcrypt.compareSync(password, user.password);
    if (!matches) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
    }

    const token = generateToken(user);
    const { password: _, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('[ERROR] - Login failed:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email.' });
    }

    const user = await dbService.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user registered with this email address.' });
    }

    // In a production environment, generate a recovery token and send email
    // For this design, return a simulated success responses
    return res.status(200).json({
      success: true,
      message: 'Password reset link has been dispatched to your email.',
      simulatedToken: 'reset-token-' + Date.now()
    });
  } catch (err) {
    console.error('[ERROR] - Forgot password failed:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide email and newPassword.' });
    }

    const user = await dbService.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    await dbService.updateUser(user.id, { password: hashedPassword });

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login.'
    });
  } catch (err) {
    console.error('[ERROR] - Reset password failed:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
