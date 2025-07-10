// src/server.js
// Express API wrapper for EmailService
const express = require('express');
const EmailService = require('./EmailService');
const MockProviderA = require('./providers/MockProviderA');
const MockProviderB = require('./providers/MockProviderB');

const app = express();
app.use(express.json());

const service = new EmailService([
  new MockProviderA(),
  new MockProviderB()
]);

// POST /send-email: Send an email request
app.post('/send-email', async (req, res) => {
  try {
    const result = await service.sendEmail(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /status/:id: Get status history for an email
app.get('/status/:id', (req, res) => {
  try {
    const status = service.getStatus(req.params.id);
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
