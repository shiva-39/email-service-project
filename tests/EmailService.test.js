// EmailService unit tests
const assert = require('assert');
const EmailService = require('../src/EmailService');
const MockProviderA = require('../src/providers/MockProviderA');
const MockProviderB = require('../src/providers/MockProviderB');

describe('EmailService', () => {
  it('should send email successfully with a provider', async () => {
    const service = new EmailService([new MockProviderA()]);
    const req = { to: 'a@b.com', subject: 'Test', body: 'Hello', idempotencyKey: 'id1' };
    const res = await service.sendEmail(req);
    assert(res.success === true || res.success === false);
    assert(res.provider === 'MockProviderA');
  });

  it('should fallback to secondary provider on failure', async () => {
    // Force MockProviderA to always fail
    class AlwaysFailA extends MockProviderA {
      async send() { return { success: false, provider: 'MockProviderA', error: 'fail' }; }
    }
    class AlwaysSucceedB extends MockProviderB {
      async send() { return { success: true, provider: 'MockProviderB', messageId: 'b1' }; }
    }
    const service = new EmailService([new AlwaysFailA(), new AlwaysSucceedB()]);
    const req = { to: 'a@b.com', subject: 'Test', body: 'Hello', idempotencyKey: 'id2' };
    const res = await service.sendEmail(req);
    assert(res.success === true);
    assert(res.provider === 'MockProviderB');
  });

  it('should not send duplicate emails (idempotency)', async () => {
    const service = new EmailService([new MockProviderA()]);
    const req = { to: 'a@b.com', subject: 'Test', body: 'Hello', idempotencyKey: 'id3' };
    const res1 = await service.sendEmail(req);
    const res2 = await service.sendEmail(req);
    assert(res2.success === false);
    assert(res2.error === 'Duplicate request');
  });

  it('should queue request if rate limit exceeded', async () => {
    // Use a provider with 1 request per minute
    const service = new EmailService([new MockProviderA()], { maxRequestsPerMinute: 1 });
    const req1 = { to: 'a@b.com', subject: 'Test', body: 'Hello', idempotencyKey: 'id4' };
    const req2 = { to: 'a@b.com', subject: 'Test', body: 'Hello', idempotencyKey: 'id5' };
    await service.sendEmail(req1);
    const res2 = await service.sendEmail(req2);
    assert(res2.success === false);
    assert(res2.error.includes('queued'));
  });

  it('should not use provider if circuit breaker is open', async () => {
    // Force circuit breaker open
    class AlwaysFailA extends MockProviderA {
      async send() { return { success: false, provider: 'MockProviderA', error: 'fail' }; }
    }
    const service = new EmailService([new AlwaysFailA()], { maxRetries: 0 });
    // Trip the circuit breaker
    await service.sendEmail({ to: 'a@b.com', subject: 'Test', body: 'Hello', idempotencyKey: 'id6' });
    await service.sendEmail({ to: 'a@b.com', subject: 'Test', body: 'Hello', idempotencyKey: 'id7' });
    await service.sendEmail({ to: 'a@b.com', subject: 'Test', body: 'Hello', idempotencyKey: 'id8' });
    // Now circuit should be open, next request should be queued
    const res = await service.sendEmail({ to: 'a@b.com', subject: 'Test', body: 'Hello', idempotencyKey: 'id9' });
    assert(res.success === false);
    assert(res.error.includes('queued'));
  });
});
