// tests/api.test.js
// Automated tests for the deployed API endpoints using supertest

const request = require('supertest');
const express = require('express');
const EmailService = require('../src/EmailService');
const MockProviderA = require('../src/providers/MockProviderA');
const MockProviderB = require('../src/providers/MockProviderB');

// Set up the Express app as in src/server.js
const app = express();
app.use(express.json());
const service = new EmailService([
  new MockProviderA(),
  new MockProviderB()
]);
app.post('/send-email', async (req, res) => {
  try {
    const result = await service.sendEmail(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/status/:id', (req, res) => {
  try {
    const status = service.getStatus(req.params.id);
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/', (req, res) => {
  res.json({ message: 'Email Service API is running.' });
});

describe('API Endpoint Tests', () => {
  it('GET / should return API running message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Email Service API is running.');
  });

  it('POST /send-email should send an email and return success or failure', async () => {
    const req = {
      to: 'user@example.com',
      subject: 'Test',
      body: 'Hello!',
      idempotencyKey: 'api-test-1'
    };
    const res = await request(app).post('/send-email').send(req);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('provider');
  });

  it('GET /status/:id should return status history for sent email', async () => {
    const res = await request(app).get('/status/api-test-1');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
