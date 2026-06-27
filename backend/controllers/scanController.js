const dbService = require('../services/dbService');

exports.getScans = async (req, res) => {
  try {
    let scans;
    if (req.user.role === 'Patient') {
      scans = await dbService.getScansForUser(req.user.id);
    } else {
      // Doctor and Administrator see all scans
      scans = await dbService.getAllScans();
    }
    return res.status(200).json({ success: true, scans });
  } catch (err) {
    console.error('[ERROR] - Failed to get scans history:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.deleteScan = async (req, res) => {
  try {
    const { id } = req.params;
    const scans = await dbService.getAllScans();
    const scan = scans.find(s => s.scanId === id);
    
    if (!scan) {
      return res.status(404).json({ success: false, message: 'Scan record not found.' });
    }

    // Role check: Only admin or the owner can delete
    if (req.user.role !== 'Administrator' && scan.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden. You do not have permission to delete this record.' });
    }

    await dbService.deleteScan(id);
    return res.status(200).json({ success: true, message: 'Scan record successfully deleted.' });
  } catch (err) {
    console.error('[ERROR] - Failed to delete scan:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.reviewScan = async (req, res) => {
  try {
    const { id } = req.params;
    const { clinicalNotes, doctorApproved } = req.body;

    if (req.user.role !== 'Doctor') {
      return res.status(403).json({ success: false, message: 'Forbidden. Only doctors can submit clinical reviews.' });
    }

    const updatedScan = await dbService.updateScanReview(id, {
      clinicalNotes,
      doctorApproved: doctorApproved !== undefined ? doctorApproved : true,
      reviewedBy: req.user.name
    });

    return res.status(200).json({
      success: true,
      message: 'Clinical review submitted successfully.',
      scan: updatedScan
    });
  } catch (err) {
    console.error('[ERROR] - Failed to submit review:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error.' });
  }
};
