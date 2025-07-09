// RateLimiter utility
// Tracks requests per time window per key (e.g., provider)
class RateLimiter {
  /**
   * @param {number} maxRequests - Max requests per window
   * @param {number} windowMs - Window size in ms
   */
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.timestamps = new Map(); // key -> [timestamps]
  }

  /**
   * Checks if a request is allowed for the given key
   * @param {string} key
   * @returns {boolean}
   */
  isAllowed(key) {
    const now = Date.now();
    if (!this.timestamps.has(key)) this.timestamps.set(key, []);
    const times = this.timestamps.get(key).filter(ts => now - ts < this.windowMs);
    this.timestamps.set(key, times);
    if (times.length < this.maxRequests) {
      times.push(now);
      return true;
    }
    return false;
  }
}

module.exports = RateLimiter;
