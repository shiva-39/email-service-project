// ExponentialBackoff utility
// Waits with exponentially increasing delays, with optional jitter
/**
 * Waits for an exponentially increasing delay
 * @param {number} attempt - The current retry attempt (starting from 1)
 * @param {number} baseDelay - The base delay in ms (default: 100)
 * @param {number} maxDelay - The maximum delay in ms (default: 5000)
 * @returns {Promise<void>}
 */
async function exponentialBackoff(attempt, baseDelay = 100, maxDelay = 5000) {
  const expDelay = Math.min(maxDelay, baseDelay * Math.pow(2, attempt - 1));
  // Add jitter (randomize up to 50% of the delay)
  const jitter = Math.random() * expDelay * 0.5;
  const delay = expDelay + jitter;
  return new Promise(res => setTimeout(res, delay));
}

module.exports = exponentialBackoff;
