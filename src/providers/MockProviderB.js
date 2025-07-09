// Mock email provider B implementation

// MockProviderB simulates an email provider with 70% success rate and random delay (200-600ms)
// Usage: new MockProviderB().send(emailRequest)
class MockProviderB {
  async send(emailRequest) {
    const delay = 200 + Math.floor(Math.random() * 400); // 200-600ms
    await new Promise(res => setTimeout(res, delay));
    const success = Math.random() < 0.7; // 70% chance
    if (success) {
      return {
        success: true,
        provider: 'MockProviderB',
        messageId: 'B-' + Date.now(),
        idempotencyKey: emailRequest.idempotencyKey || null,
        details: { delay }
      };
    } else {
      return {
        success: false,
        provider: 'MockProviderB',
        error: 'Simulated failure',
        idempotencyKey: emailRequest.idempotencyKey || null,
        details: { delay }
      };
    }
  }
}

module.exports = MockProviderB;
