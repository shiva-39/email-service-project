// tests/cloudApi.test.js
// Automated tests for the deployed (cloud) API endpoint using supertest and the public URL

jest.setTimeout(60000); // Increase timeout for slow cloud endpoints (60 seconds)

const axios = require('axios');

const BASE_URL = 'https://email-service-project-reh7.onrender.com';

describe('Cloud API Endpoint Tests', () => {
  it('GET / should return API running message', async () => {
    const res = await axios.get(BASE_URL + '/');
    expect(res.status).toBe(200);
    expect(res.data.message).toBe('Email Service API is running.');
  });

  it('POST /send-email should send an email and return success or failure', async () => {
    const req = {
      to: 'user@example.com',
      subject: 'Cloud Test',
      body: 'Hello from cloud!',
      idempotencyKey: 'cloud-api-test-' + Date.now()
    };
    const res = await axios.post(BASE_URL + '/send-email', req);
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('success');
    if (res.data.success) {
      expect(res.data).toHaveProperty('provider');
    } else {
      expect(res.data.error).toBe('Duplicate request');
    }
  });

  it('GET /status/:id should return status history for sent email', async () => {
    const res = await axios.get(BASE_URL + '/status/cloud-api-test-1');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
  });
});
