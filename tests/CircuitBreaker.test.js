// CircuitBreaker unit tests
const assert = require('assert');
const CircuitBreaker = require('../src/utils/CircuitBreaker');

describe('CircuitBreaker', () => {
  it('should open after threshold failures', () => {
    const cb = new CircuitBreaker({ failureThreshold: 2, recoveryTimeMs: 100 });
    assert(cb.canRequest());
    cb.recordFailure();
    assert(cb.canRequest());
    cb.recordFailure();
    assert(!cb.canRequest());
  });

  it('should half-open after recovery time', (done) => {
    const cb = new CircuitBreaker({ failureThreshold: 1, recoveryTimeMs: 50 });
    cb.recordFailure();
    assert(!cb.canRequest());
    setTimeout(() => {
      assert(cb.canRequest());
      done();
    }, 60);
  });
});
