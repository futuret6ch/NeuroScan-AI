const test = require('node:test');
const assert = require('node:assert');
const app = require('../server');

test('API Endpoints - Integration Suite', async (t) => {
  let server;
  let baseUrl;

  // Boot ephemeral server on a random free port (0)
  t.before(() => {
    return new Promise((resolve) => {
      server = app.listen(0, () => {
        const address = server.address();
        baseUrl = `http://localhost:${address.port}`;
        resolve();
      });
    });
  });

  t.after(() => {
    return new Promise((resolve) => {
      server.close(resolve);
    });
  });

  await t.test('GET /api/health should return 200 and status metadata', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'healthy');
    assert.ok(data.timestamp);
  });

  await t.test('POST /api/auth/login should reject invalid credentials with 401', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@clinic.org', password: 'wrongpassword' })
    });
    
    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.message, 'Invalid credentials. User not found.');
  });

  await t.test('POST /api/auth/login should sign in pre-seeded patient account', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'patient@clinic.org', password: 'password123' })
    });
    
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.token, 'Should return JWT token');
    assert.strictEqual(data.user.role, 'Patient');
  });

  await t.test('GET /api/scans without auth header should reject with 401', async () => {
    const res = await fetch(`${baseUrl}/api/scans`);
    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.message, 'Authorization token required. Access Denied.');
  });
});
