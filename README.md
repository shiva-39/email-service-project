# Email Service Project

## Problem Statement

Modern applications often need to send transactional or notification emails reliably and efficiently. Relying on a single email provider can lead to service disruptions if that provider experiences downtime, rate limits, or failures. To address this, a robust email service should:

- Abstract multiple email providers, allowing seamless failover and load balancing.
- Implement reliability patterns such as rate limiting, circuit breaking, and exponential backoff to handle provider errors and transient failures.
- Track the status of email requests and responses for monitoring and debugging.
- Be modular and testable, with clear separation between providers, utilities, and business logic.

This project provides a modular email service architecture with mock providers, utility modules, and comprehensive tests to demonstrate these concepts.

## Assumptions
- In-memory storage is used for tracking idempotency, rate limits, and circuit breaker state (not persistent across restarts).
- Rate limiting is enforced per provider, with a configurable limit (e.g., X emails per minute).
- Mock providers simulate sending emails and can be configured to fail for testing reliability patterns.
- Exponential backoff and circuit breaker logic are implemented in the utility modules.
- The service is designed for demonstration and testing, not for production use.
- No external database or message queue is used; all state is managed in memory.
- Tests are written using a simple test runner or framework (to be specified).

## Design Decisions
- All state (rate limits, circuit breaker, idempotency, queue) is kept in memory for simplicity and demonstration.
- Providers are pluggable and must implement a simple `send(emailRequest)` interface.
- Circuit breaker and rate limiter are per-provider for isolation and resilience.
- Queue buffers requests if all providers are unavailable or rate limited, and retries when possible.
- Logger can log to console or file, configurable in EmailService options.

## Expected API for EmailService

The `EmailService` module exposes the following main API:

### Methods
- `sendEmail(emailRequest)`
  - Sends an email using the available providers, applying rate limiting, circuit breaking, and retry logic as needed.
  - **Parameters:**
    - `emailRequest` (object): Contains recipient, subject, body, and other metadata.
  - **Returns:**
    - A promise that resolves to an `EmailResponse` object indicating success or failure, provider used, and error details if any.

- `getStatus(emailId)`
  - Retrieves the status of a previously sent email by its unique ID.
  - **Parameters:**
    - `emailId` (string): Unique identifier for the email request.
  - **Returns:**
    - An object or promise with the current status (e.g., pending, sent, failed, retried).

- `addProvider(providerInstance)`
  - Dynamically adds a new email provider to the service.
  - **Parameters:**
    - `providerInstance` (object): An object implementing the provider interface.
  - **Returns:**
    - None.

### Provider Interface
Each provider should implement:
- `send(emailRequest)`: Returns a promise resolving to an `EmailResponse`.

## Structure
- `src/providers/`: Mock email providers (simulate random failures/delays)
- `src/utils/`: Utility modules (rate limiter, circuit breaker, exponential backoff, logger, queue)
- `src/models/`: Data models (`EmailRequest`, `EmailResponse`)
- `src/EmailService.js`: Main service logic (failover, retries, queue, etc.)
- `src/StatusTracker.js`: Tracks all send attempts and results
- `tests/`: Unit tests for all major modules

## Setup
- **Node.js version:** 16.x or newer recommended
- Install dependencies (if any):
  ```sh
  npm install
  ```
- Run tests (using Node's built-in assert and a test runner like mocha):
  ```sh
  npx mocha tests/*.js
  ```

## Usage Example
```js
const EmailService = require('./src/EmailService');
const MockProviderA = require('./src/providers/MockProviderA');
const MockProviderB = require('./src/providers/MockProviderB');

const service = new EmailService([
  new MockProviderA(),
  new MockProviderB()
], { maxRequestsPerMinute: 10 });

(async () => {
  const req = {
    to: 'user@example.com',
    subject: 'Hello',
    body: 'Welcome!',
    idempotencyKey: 'unique-key-1'
  };
  const res = await service.sendEmail(req);
  console.log('Send result:', res);
  const status = service.getStatus(req.idempotencyKey);
  console.log('Status history:', status);
})();
```

## Module Overview
- **MockProviderA / MockProviderB:** Simulate real providers with random failures/delays for testing failover and retry logic.
- **RateLimiter:** Limits requests per provider per time window.
- **CircuitBreaker:** Prevents calls to failing providers for a cooling period.
- **ExponentialBackoff:** Waits with exponentially increasing delays between retries.
- **Logger:** Logs info, warnings, and errors to console or file.
- **Queue:** Buffers requests if all providers are unavailable or rate limited.
- **StatusTracker:** Tracks all send attempts, results, and history for each email.
- **EmailService:** Orchestrates sending, failover, retries, queueing, and status tracking.
