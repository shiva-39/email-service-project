// RateLimiter unit tests
const assert = require('assert');
const RateLimiter = require('../src/utils/RateLimiter');

describe('RateLimiter', () => {
  it('should allow up to max requests per window', () => {
    const rl = new RateLimiter(2, 1000);
    assert(rl.isAllowed('A'));
    assert(rl.isAllowed('A'));
    assert(!rl.isAllowed('A'));
  });

  it('should reset after window', (done) => {
    const rl = new RateLimiter(1, 100);
    assert(rl.isAllowed('B'));
    setTimeout(() => {
      assert(rl.isAllowed('B'));
      done();
    }, 120);
  });
});
