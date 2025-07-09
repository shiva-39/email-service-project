// Status tracker for email service
// Tracks the history of email send attempts (success/failure, timestamp, provider)
class StatusTracker {
  constructor() {
    // emailId -> [{ success, provider, timestamp, error }]
    this.history = new Map();
  }

  /**
   * Record an attempt for an email
   * @param {string} emailId
   * @param {Object} result
   * @param {boolean} result.success
   * @param {string} result.provider
   * @param {string} [result.error]
   */
  recordAttempt(emailId, { success, provider, error }) {
    if (!this.history.has(emailId)) this.history.set(emailId, []);
    this.history.get(emailId).push({
      success,
      provider,
      error: error || null,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get all attempts for an email
   * @param {string} emailId
   * @returns {Array}
   */
  getAttempts(emailId) {
    return this.history.get(emailId) || [];
  }

  /**
   * Get the latest status for an email
   * @param {string} emailId
   * @returns {Object|null}
   */
  getLatestStatus(emailId) {
    const attempts = this.getAttempts(emailId);
    return attempts.length ? attempts[attempts.length - 1] : null;
  }
}

module.exports = StatusTracker;
