// EmailService.js
// Core email service logic with provider failover, retries, rate limiting, and status tracking
// Follows SOLID principles: single responsibility, open/closed for new providers, dependency injection, etc.

const RateLimiter = require('./utils/RateLimiter');
const CircuitBreaker = require('./utils/CircuitBreaker');
const exponentialBackoff = require('./utils/ExponentialBackoff');
const Logger = require('./utils/Logger');
const StatusTracker = require('./StatusTracker');
const Queue = require('./utils/Queue');

class EmailService {
  /**
   * @param {Array} providers - List of provider instances (must implement send)
   * @param {Object} [options]
   * @param {number} [options.maxRequestsPerMinute=60]
   * @param {number} [options.maxRetries=2]
   * @param {Logger} [options.logger]
   */
  constructor(providers, options = {}) {
    this.providers = providers || [];
    this.rateLimiter = new RateLimiter(options.maxRequestsPerMinute || 60, 60000);
    this.circuitBreakers = new Map(); // providerName -> CircuitBreaker
    this.statusTracker = new StatusTracker();
    this.idempotencySet = new Set();
    this.maxRetries = options.maxRetries || 2;
    this.logger = options.logger || new Logger();
    this.queue = new Queue();
    this.processingQueue = false;
    // Initialize circuit breakers for each provider
    for (const p of this.providers) {
      this.circuitBreakers.set(p.constructor.name, new CircuitBreaker());
    }
  }

  /**
   * Add a new provider at runtime
   * @param {Object} provider
   */
  addProvider(provider) {
    this.providers.push(provider);
    this.circuitBreakers.set(provider.constructor.name, new CircuitBreaker());
  }

  /**
   * Main entry: Send an email with failover, retries, and tracking
   * Implements idempotency, rate limiting, circuit breaker, and queue fallback
   * @param {Object} emailRequest
   * @returns {Promise<Object>} EmailResponse
   */
  async sendEmail(emailRequest) {
    const idKey = emailRequest.idempotencyKey;
    // Idempotency: prevent duplicate sends
    if (idKey && this.idempotencySet.has(idKey)) {
      this.logger.info(`Duplicate email request detected: ${idKey}`);
      return { success: false, error: 'Duplicate request', idempotencyKey: idKey };
    }
    if (idKey) this.idempotencySet.add(idKey);

    // Check if any provider is available (not rate limited or circuit open)
    let canSend = false;
    for (const provider of this.providers) {
      const providerName = provider.constructor.name;
      const cb = this.circuitBreakers.get(providerName);
      if (cb.canRequest() && this.rateLimiter.isAllowed(providerName)) {
        canSend = true;
        break;
      }
    }
    // If not, queue the request
    if (!canSend) {
      this.logger.warn('All providers are rate limited or circuit open. Queuing request.');
      this.queue.enqueue(emailRequest);
      this._processQueue();
      return { success: false, error: 'Request queued due to rate limiting or circuit open.' };
    }

    // Try each provider in order (failover)
    for (let i = 0; i < this.providers.length; i++) {
      const provider = this.providers[i];
      const providerName = provider.constructor.name;
      const cb = this.circuitBreakers.get(providerName);
      // Circuit breaker: skip if open
      if (!cb.canRequest()) {
        this.logger.warn(`Provider ${providerName} circuit open. Skipping.`);
        continue;
      }
      // Rate limiting: skip if exceeded
      if (!this.rateLimiter.isAllowed(providerName)) {
        this.logger.warn(`Rate limit exceeded for ${providerName}. Skipping.`);
        continue;
      }
      let lastError = null;
      // Retry logic with exponential backoff
      for (let attempt = 1; attempt <= this.maxRetries + 1; attempt++) {
        try {
          this.logger.info(`Attempt ${attempt} with ${providerName}`);
          const response = await provider.send(emailRequest);
          this.statusTracker.recordAttempt(idKey || response.messageId, {
            success: response.success,
            provider: providerName,
            error: response.error
          });
          if (response.success) {
            cb.recordSuccess();
            return response;
          } else {
            cb.recordFailure();
            lastError = response.error;
            this.logger.warn(`Failure from ${providerName}: ${response.error}`);
          }
        } catch (err) {
          cb.recordFailure();
          lastError = err.message;
          this.logger.error(`Exception from ${providerName}: ${err.message}`);
        }
        // Wait before retrying
        if (attempt <= this.maxRetries) {
          await exponentialBackoff(attempt);
        }
      }
      // If all retries failed, try next provider (fallback)
      this.logger.warn(`All retries failed for ${providerName}, switching provider.`);
    }
    // All providers failed
    this.statusTracker.recordAttempt(emailRequest.idempotencyKey || 'unknown', {
      success: false,
      provider: 'all',
      error: 'All providers failed'
    });
    return { success: false, error: 'All providers failed' };
  }

  /**
   * Process queued requests when providers become available
   * Called automatically after queueing
   */
  async _processQueue() {
    if (this.processingQueue) return;
    this.processingQueue = true;
    while (!this.queue.isEmpty()) {
      let emailRequest = this.queue.dequeue();
      let canSend = false;
      for (const provider of this.providers) {
        const providerName = provider.constructor.name;
        const cb = this.circuitBreakers.get(providerName);
        if (cb.canRequest() && this.rateLimiter.isAllowed(providerName)) {
          canSend = true;
          break;
        }
      }
      if (!canSend) {
        // Requeue and break to wait for next window
        this.queue.enqueue(emailRequest);
        break;
      }
      await this.sendEmail(emailRequest);
    }
    this.processingQueue = false;
  }

  /**
   * Get status history for an email
   * @param {string} emailId
   * @returns {Array}
   */
  getStatus(emailId) {
    return this.statusTracker.getAttempts(emailId);
  }
}

module.exports = EmailService;
