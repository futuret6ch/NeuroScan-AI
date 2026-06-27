const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Database file path for local JSON fallback
const DB_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DB_DIR, 'db.json');

class DatabaseService {
  constructor() {
    this.isMongoDB = false;
    this.initDatabase();
  }

  initDatabase() {
    // Check if MongoDB environment is configured (placeholder for Mongoose)
    if (process.env.MONGODB_URI) {
      try {
        const mongoose = require('mongoose');
        mongoose.connect(process.env.MONGODB_URI)
          .then(() => {
            console.log('[INFO] - Connected to MongoDB successfully.');
            this.isMongoDB = true;
          })
          .catch((err) => {
            console.error('[WARN] - MongoDB connection failed. Falling back to local file DB.', err.message);
            this.setupFileDatabase();
          });
        return;
      } catch (e) {
        console.warn('[WARN] - Mongoose module not found. Falling back to local file DB.');
      }
    }
    this.setupFileDatabase();
  }

  setupFileDatabase() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      // Seed default accounts
      const salt = bcrypt.genSaltSync(10);
      const defaultUsers = [
        {
          id: 'u1',
          name: 'Eleanor Vance',
          email: 'patient@clinic.org',
          password: bcrypt.hashSync('password123', salt),
          role: 'Patient',
          age: 38,
          gender: 'Female',
          bloodGroup: 'O-Negative',
          phone: '+1 (555) 019-2834',
          avatar: null
        },
        {
          id: 'u2',
          name: 'Dr. Robert Carter',
          email: 'doctor@clinic.org',
          password: bcrypt.hashSync('password123', salt),
          role: 'Doctor',
          age: 45,
          gender: 'Male',
          specialty: 'Neuro-Oncologist',
          hospital: 'Boston Medical Plaza',
          phone: '+1 (555) 019-8765',
          avatar: null
        },
        {
          id: 'u3',
          name: 'Administrator Root',
          email: 'admin@clinic.org',
          password: bcrypt.hashSync('password123', salt),
          role: 'Administrator',
          avatar: null
        }
      ];

      // Seed default scan records for patient Eleanor Vance
      const defaultScans = [
        {
          scanId: 's1001',
          userId: 'u1',
          patientName: 'Eleanor Vance',
          patientAge: '38',
          patientGender: 'Female',
          hasTumor: true,
          type: 'Glioma (Malignant)',
          confidence: 94.8,
          findings: 'Visualized mass lesion in the right frontal lobe measuring approximately 2.4cm with surrounding vasogenic edema.',
          recommendation: 'Urgent neurosurgical consultation advised. Schedule contrast-enhanced Brain MRI (Gadolinium) scan within 48 hours.',
          location: { x: 42, y: 45, r: 12 },
          date: '2026-06-25',
          time: '14:23',
          riskLevel: 'High',
          clinicalNotes: 'Initial MRI scan. Patient exhibits mild cognitive fatigue and sensory disturbances.',
          doctorApproved: true,
          reviewedBy: 'Dr. Robert Carter',
          reviewedAt: '2026-06-25 16:30'
        },
        {
          scanId: 's1002',
          userId: 'u1',
          patientName: 'Eleanor Vance',
          patientAge: '38',
          patientGender: 'Female',
          hasTumor: false,
          type: 'Healthy Brain (No Lesion)',
          confidence: 99.1,
          findings: 'Ventricles and sulci are within normal physiological parameters. No evidence of space-occupying lesions or mass effects.',
          recommendation: 'No oncological actions required. Consult standard practitioner if non-specific headache symptoms persist.',
          location: null,
          date: '2026-06-27',
          time: '11:15',
          riskLevel: 'Low',
          clinicalNotes: 'Control check-up. Normal cerebral structures.',
          doctorApproved: true,
          reviewedBy: 'Dr. Robert Carter',
          reviewedAt: '2026-06-27 12:00'
        }
      ];

      fs.writeFileSync(DB_FILE, JSON.stringify({ users: defaultUsers, scans: defaultScans }, null, 2), 'utf8');
      console.log('[INFO] - Initialized and seeded local file-based database.');
    }
  }

  // Read data helper
  _readData() {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(content);
    } catch (e) {
      return { users: [], scans: [] };
    }
  }

  // Write data helper
  _writeData(data) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (e) {
      console.error('[ERROR] - Failed to write to database file.', e);
      return false;
    }
  }

  // --- USER OPERATIONS ---
  async registerUser(userData) {
    if (this.isMongoDB) {
      // MongoDB model implementation placeholder
      // const User = require('../models/User');
      // return await User.create(userData);
    }
    const db = this._readData();
    const existing = db.users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existing) {
      throw new Error('User already exists with this email address.');
    }
    const newUser = {
      id: 'u_' + Date.now(),
      name: userData.name,
      email: userData.email,
      password: userData.password, // already hashed in controller
      role: userData.role || 'Patient',
      age: userData.age ? Number(userData.age) : undefined,
      gender: userData.gender,
      bloodGroup: userData.bloodGroup,
      phone: userData.phone,
      specialty: userData.specialty,
      hospital: userData.hospital,
      avatar: null
    };
    db.users.push(newUser);
    this._writeData(db);
    return newUser;
  }

  async findUserByEmail(email) {
    if (this.isMongoDB) {
      // return await require('../models/User').findOne({ email: email.toLowerCase() });
    }
    const db = this._readData();
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async findUserById(id) {
    if (this.isMongoDB) {
      // return await require('../models/User').findById(id);
    }
    const db = this._readData();
    const user = db.users.find(u => u.id === id);
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async updateUser(id, updateData) {
    if (this.isMongoDB) {
      // return await require('../models/User').findByIdAndUpdate(id, updateData, { new: true });
    }
    const db = this._readData();
    const index = db.users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found.');
    
    // Prevent overriding sensitive columns
    const allowed = ['name', 'age', 'gender', 'bloodGroup', 'phone', 'specialty', 'hospital', 'avatar', 'password'];
    for (const key of allowed) {
      if (updateData[key] !== undefined) {
        db.users[index][key] = updateData[key];
      }
    }
    this._writeData(db);
    const { password, ...safeUser } = db.users[index];
    return safeUser;
  }

  async deleteUser(id) {
    if (this.isMongoDB) {
      // return await require('../models/User').findByIdAndDelete(id);
    }
    const db = this._readData();
    db.users = db.users.filter(u => u.id !== id);
    // clean up their scans too
    db.scans = db.scans.filter(s => s.userId !== id);
    this._writeData(db);
    return true;
  }

  async getAllUsers() {
    const db = this._readData();
    return db.users.map(({ password, ...u }) => u);
  }

  // --- SCAN OPERATIONS ---
  async saveScan(scanData) {
    if (this.isMongoDB) {
      // const Scan = require('../models/Scan');
      // return await Scan.create(scanData);
    }
    const db = this._readData();
    const newScan = {
      scanId: 's' + Date.now(),
      userId: scanData.userId,
      patientName: scanData.patientName,
      patientAge: scanData.patientAge,
      patientGender: scanData.patientGender,
      hasTumor: scanData.hasTumor,
      type: scanData.type,
      confidence: scanData.confidence,
      findings: scanData.findings,
      recommendation: scanData.recommendation,
      location: scanData.location,
      date: scanData.date || new Date().toISOString().split('T')[0],
      time: scanData.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      riskLevel: scanData.riskLevel || (scanData.hasTumor ? 'High' : 'Low'),
      imgUrl: scanData.imgUrl,
      clinicalNotes: scanData.clinicalNotes || '',
      doctorApproved: scanData.doctorApproved || false,
      reviewedBy: scanData.reviewedBy || null,
      reviewedAt: scanData.reviewedAt || null
    };
    db.scans.unshift(newScan);
    this._writeData(db);
    return newScan;
  }

  async getScansForUser(userId) {
    if (this.isMongoDB) {
      // return await require('../models/Scan').find({ userId }).sort({ date: -1 });
    }
    const db = this._readData();
    return db.scans.filter(s => s.userId === userId);
  }

  async getAllScans() {
    if (this.isMongoDB) {
      // return await require('../models/Scan').find({}).sort({ date: -1 });
    }
    const db = this._readData();
    return db.scans;
  }

  async deleteScan(scanId) {
    if (this.isMongoDB) {
      // return await require('../models/Scan').deleteOne({ scanId });
    }
    const db = this._readData();
    db.scans = db.scans.filter(s => s.scanId !== scanId);
    this._writeData(db);
    return true;
  }

  async updateScanReview(scanId, reviewData) {
    if (this.isMongoDB) {
      // return await require('../models/Scan').findOneAndUpdate({ scanId }, reviewData, { new: true });
    }
    const db = this._readData();
    const index = db.scans.findIndex(s => s.scanId === scanId);
    if (index === -1) throw new Error('Scan record not found.');
    
    db.scans[index].clinicalNotes = reviewData.clinicalNotes || '';
    db.scans[index].doctorApproved = reviewData.doctorApproved !== undefined ? reviewData.doctorApproved : db.scans[index].doctorApproved;
    db.scans[index].reviewedBy = reviewData.reviewedBy || null;
    db.scans[index].reviewedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    this._writeData(db);
    return db.scans[index];
  }
}

module.exports = new DatabaseService();
