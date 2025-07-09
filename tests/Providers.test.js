// Providers unit tests
const assert = require('assert');
const MockProviderA = require('../src/providers/MockProviderA');
const MockProviderB = require('../src/providers/MockProviderB');

describe('MockProviderA', () => {
  it('should return success or failure', async () => {
    const provider = new MockProviderA();
    const req = { to: 'a@b.com', subject: 'Test', body: 'Hello' };
    const res = await provider.send(req);
    assert(res.success === true || res.success === false);
    assert(res.provider === 'MockProviderA');
  });
});

describe('MockProviderB', () => {
  it('should return success or failure', async () => {
    const provider = new MockProviderB();
    const req = { to: 'a@b.com', subject: 'Test', body: 'Hello' };
    const res = await provider.send(req);
    assert(res.success === true || res.success === false);
    assert(res.provider === 'MockProviderB');
  });
});
