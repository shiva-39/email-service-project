# Email Service Project

## Problem Statement

Modern applications often need to send transactional or notification emails reliably and efficiently. Relying on a single email provider can lead to service disruptions if that provider experiences downtime, rate limits, or failures. To address this, a robust email service should:

- Abstract multiple email providers, allowing #seamless failover and load balancing.
- Implement reliability patterns such as #rate limiting, #circuit breaking, and #exponential backoff to handle provider errors and transient failures.
- Track the status of email requests and responses for monitoring and debugging.
- Be modular and testable, #with clear separation between providers, utilities, andsiness logic.
 bu
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

## Module Overview
- **MockProviderA / MockProviderB:** Simulate real providers with random failures/delays for testing failover and retry logic.
- **RateLimiter:** Limits requests per provider per time window.
- **CircuitBreaker:** Prevents calls to failing providers for a cooling period.
- **ExponentialBackoff:** Waits with exponentially increasing delays between retries.
- **Logger:** Logs info, warnings, and errors to console or file.
- **Queue:** Buffers requests if all providers are unavailable or rate limited.
- **StatusTracker:** Tracks all send attempts, results, and history for each email.
- **EmailService:** Orchestrates sending, failover, retries, queueing, and status tracking.

## Screencast Walkthrough Guide

This project is designed for a technical screencast. Here’s how to explain each part:

1. **Introduction:**
   - Briefly introduce yourself and the project goal: a resilient, modular email sending service in JavaScript.
2. **Problem Statement:**
   - List requirements: retry with exponential backoff, fallback, idempotency, rate limiting, status tracking, circuit breaker, logging, queue.
3. **Design Overview:**
   - Explain the architecture: `EmailService` as orchestrator, mock providers, modular utilities, SOLID principles.
4. **Code Walkthrough:**
   - Show file structure: `src/EmailService.js`, `providers/`, `utils/`, `StatusTracker.js`, `tests/`.
   - Walk through `sendEmail()` logic: idempotency, rate limiting, retries, fallback, circuit breaker, queue, logging.
   - Show utilities and mock providers.
5. **Terminal Demo:**
   - Run `npm start` to show logs, retries, fallback, and status tracking.
   - Run `npm test` to show test coverage and resilience.
6. **Wrap-up:**
   - Summarize features: modular, robust, extensible, well-tested.

## Cloud API Deployment

This project can be deployed as a cloud API endpoint using Express.js. The API exposes:

- `POST /send-email` — Send an email (JSON body: to, subject, body, idempotencyKey, etc.)
- `GET /status/:id` — Get status history for a sent email (by idempotencyKey)

### Local Run
```sh
npm install
node src/server.js
```

### Deploy to Cloud
- Deploy to Heroku, Vercel, AWS, or any Node.js-compatible platform.
- Set the `PORT` environment variable if needed.

### Example Request
```sh
curl -X POST http://localhost:3000/send-email \
  -H "Content-Type: application/json" \
  -d '{"to":"user@example.com","subject":"Hello","body":"Welcome!","idempotencyKey":"unique-key-1"}'
```

### Example Status Query
```sh
curl http://localhost:3000/status/unique-key-1
```
