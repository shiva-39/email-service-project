// CircuitBreaker utility
// Implements open, half-open, closed states with failure thresholds
class CircuitBreaker {
  /**
   * @param {Object} options
   * @param {number} options.failureThreshold - Failures to open circuit
   * @param {number} options.recoveryTimeMs - Time to try half-open (ms)
   */
  constructor({ failureThreshold = 5, recoveryTimeMs = 10000 } = {}) {
    this.failureThreshold = failureThreshold;
    this.recoveryTimeMs = recoveryTimeMs;
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = null;
  }

  canRequest() {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeMs) {
        this.state = 'HALF_OPEN';
        return true;
      }
      return false;
    }
    return true;
  }

  recordSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}

module.exports = CircuitBreaker;
