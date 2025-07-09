// Entry point for Email Service Project
const EmailService = require('./EmailService');
const MockProviderA = require('./providers/MockProviderA');
const MockProviderB = require('./providers/MockProviderB');

const service = new EmailService([
  new MockProviderA(),
  new MockProviderB()
], { maxRequestsPerMinute: 10 });

(async () => {
  const req = {
    to: 'user@example.com',
    subject: 'Hello',
    body: 'Welcome!',
    idempotencyKey: 'unique-key-1'
  };
  const res = await service.sendEmail(req);
  console.log('Send result:', res);
  const status = service.getStatus(req.idempotencyKey);
  console.log('Status history:', status);
})();
