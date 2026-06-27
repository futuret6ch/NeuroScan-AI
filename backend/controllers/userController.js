const bcrypt = require('bcryptjs');
const dbService = require('../services/dbService');

exports.getProfile = async (req, res) => {
  try {
    const user = await dbService.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error('[ERROR] - Failed to get profile:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updatedUser = await dbService.updateUser(req.user.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser
    });
  } catch (err) {
    console.error('[ERROR] - Failed to update profile:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error.' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide oldPassword and newPassword.' });
    }

    const user = await dbService.findUserByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const matches = bcrypt.compareSync(oldPassword, user.password);
    if (!matches) {
      return res.status(400).json({ success: false, message: 'Incorrect existing password.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    await dbService.updateUser(req.user.id, { password: hashedPassword });

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (err) {
    console.error('[ERROR] - Failed to change password:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    await dbService.deleteUser(req.user.id);
    return res.status(200).json({
      success: true,
      message: 'Your account has been deleted permanently.'
    });
  } catch (err) {
    console.error('[ERROR] - Failed to delete account:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
