const test = require('node:test');
const assert = require('node:assert');
const dbService = require('../services/dbService');

test('Database Service - Pluggable local database read/write checks', async (t) => {
  await t.test('Should register a new patient user successfully', async () => {
    const testEmail = `test_patient_${Date.now()}@test.org`;
    const newUserData = {
      name: 'Test Patient Case',
      email: testEmail,
      password: 'hashedpassword999',
      role: 'Patient',
      age: 29,
      gender: 'Male',
      bloodGroup: 'B-Positive',
      phone: '555-0199'
    };

    const user = await dbService.registerUser(newUserData);
    assert.strictEqual(user.name, newUserData.name);
    assert.strictEqual(user.email, newUserData.email);
    assert.strictEqual(user.role, 'Patient');
    assert.strictEqual(user.age, 29);

    // Clean up test user from database logs
    await dbService.deleteUser(user.id);
  });

  await t.test('Should search user by email successfully', async () => {
    const testEmail = `test_doc_${Date.now()}@test.org`;
    const docData = {
      name: 'Test Doctor Case',
      email: testEmail,
      password: 'docpassword123',
      role: 'Doctor',
      specialty: 'Radiology',
      hospital: 'St. Jude General'
    };

    const user = await dbService.registerUser(docData);
    const found = await dbService.findUserByEmail(testEmail);
    
    assert.ok(found);
    assert.strictEqual(found.name, docData.name);
    assert.strictEqual(found.specialty, 'Radiology');

    await dbService.deleteUser(user.id);
  });

  await t.test('Should fetch seeded demo accounts', async () => {
    const users = await dbService.getAllUsers();
    assert.ok(users.length >= 3, 'Local JSON DB should seed default accounts');
    
    const admin = users.find(u => u.role === 'Administrator');
    assert.ok(admin, 'Seeded admin account should be queryable');
    assert.strictEqual(admin.email, 'admin@clinic.org');
  });
});
