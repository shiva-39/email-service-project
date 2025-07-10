// MockProviderA simulates an email provider with 80% success rate and random delay (100-500ms)
// Used to test retry, fallback, and error handling in EmailService
// Usage: new MockProviderA().send(emailRequest)
class MockProviderA {
  /**
   * Simulate sending an email
   * @param {Object} emailRequest - The email request object
   * @returns {Promise<Object>} EmailResponse
   */
  async send(emailRequest) {
    // Simulate network delay between 100-500ms
    const delay = 100 + Math.floor(Math.random() * 400); // 100-500ms
    await new Promise(res => setTimeout(res, delay));
    // 80% chance of success, 20% failure
    const success = Math.random() < 0.8; // 80% chance
    if (success) {
      return {
        success: true,
        provider: 'MockProviderA',
        messageId: 'A-' + Date.now(),
        idempotencyKey: emailRequest.idempotencyKey || null,
        details: { delay } // Include delay for debugging
      };
    } else {
      return {
        success: false,
        provider: 'MockProviderA',
        error: 'Simulated failure',
        idempotencyKey: emailRequest.idempotencyKey || null,
        details: { delay } // Include delay for debugging
      };
    }
  }
}

module.exports = MockProviderA;
