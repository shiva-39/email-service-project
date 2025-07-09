// MockProviderA simulates an email provider with 80% success rate and random delay (100-500ms)
// Usage: new MockProviderA().send(emailRequest)
class MockProviderA {
  async send(emailRequest) {
    const delay = 100 + Math.floor(Math.random() * 400); // 100-500ms
    await new Promise(res => setTimeout(res, delay));
    const success = Math.random() < 0.8; // 80% chance
    if (success) {
      return {
        success: true,
        provider: 'MockProviderA',
        messageId: 'A-' + Date.now(),
        idempotencyKey: emailRequest.idempotencyKey || null,
        details: { delay }
      };
    } else {
      return {
        success: false,
        provider: 'MockProviderA',
        error: 'Simulated failure',
        idempotencyKey: emailRequest.idempotencyKey || null,
        details: { delay }
      };
    }
  }
}

module.exports = MockProviderA;
