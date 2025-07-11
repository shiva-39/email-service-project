# Email Service Project

First, let’s restate the problem to clarify the goal.

We were asked to build a robust email service that:
Supports retry logic with exponential backoff
Can fallback between providers if one fails
Ensures idempotency to avoid duplicate sends
Implements rate limiting per provider
Tracks status history for every attempt

Bonus features include:
Circuit breaker to stop calling failing providers
A simple queue for deferred requests
And logging for observability
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
- Tests are written using Jest and Supertest for both local and cloud endpoints.

## Design Decisions
- All state (rate limits, circuit breaker, idempotency, queue) is kept in memory for simplicity and demonstration.
- Providers are pluggable and must implement a simple `send(emailRequest)` interface.
- Circuit breaker and rate limiter are per-provider for isolation and resilience.
- Queue buffers requests if all providers are unavailable or rate limited, and retries when possible.
- Logger can log to console or file, configurable in EmailService options.

## API Overview

### Main Methods
- `sendEmail(emailRequest)` — Sends an email using available providers, applying all reliability logic.
- `getStatus(emailId)` — Retrieves the status history for a previously sent email by its unique ID.
- `addProvider(providerInstance)` — Dynamically adds a new email provider.

### Provider Interface
Each provider should implement:
- `send(emailRequest)`: Returns a promise resolving to an `EmailResponse`.

## Project Structure
- `src/providers/`: Mock email providers (simulate random failures/delays)
- `src/utils/`: Utility modules (rate limiter, circuit breaker, exponential backoff, logger, queue)
- `src/models/`: Data models (`EmailRequest`, `EmailResponse`)
- `src/EmailService.js`: Main service logic (failover, retries, queue, etc.)
- `src/StatusTracker.js`: Tracks all send attempts and results
- `src/server.js`: Express API endpoint for cloud deployment
- `tests/`: Unit and integration tests for all major modules and endpoints

## Setup & Local Usage
- **Node.js version:** 16.x or newer recommended
- Install dependencies:
  ```sh
  npm install
  ```
- Run tests:
  ```sh
  npm test
  ```
- Start the API locally:
  ```sh
  npm start
  # or
  node src/server.js
  ```
- Visit [http://localhost:3000/](http://localhost:3000/) for the API welcome message.

## Usage Example (Code)
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

## API Endpoints (Cloud or Local)

- `POST /send-email` — Send an email (JSON body: to, subject, body, idempotencyKey, etc.)
- `GET /status/:id` — Get status history for a sent email (by idempotencyKey)
- `GET /` — API welcome/health message

### Example Requests
**Send an email:**
```sh
curl -X POST http://localhost:3000/send-email \
  -H "Content-Type: application/json" \
  -d '{"to":"user@example.com","subject":"Hello","body":"Welcome!","idempotencyKey":"unique-key-1"}'
```
**Check status:**
```sh
curl http://localhost:3000/status/unique-key-1
```

## Cloud Deployment
- Deploy to Heroku, Vercel, AWS, Render, or any Node.js-compatible platform.
- Set the `PORT` environment variable if needed.
- Example live endpoint: https://email-service-project-reh7.onrender.com

## Testing
- Run all tests (unit, integration, and cloud endpoint):
  ```sh
  npm test
  ```
- Tests cover:
  - Core logic (retry, fallback, idempotency, rate limiting, status tracking, etc.)
  - API endpoints (local and cloud)
  - Edge cases (duplicate requests, provider failures, etc.)

## Screencast Walkthrough Guide

1. **Introduction:**
   - Introduce yourself and the project goal: a resilient, modular email sending service in JavaScript/Node.js.
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
   - Run `npm test` to show test coverage and resilience (including cloud endpoint tests).
6. **Cloud Demo:**
   - Show the deployed API endpoint (Render, Heroku, etc.), test with curl/Postman, and demonstrate idempotency and error handling.
7. **Wrap-up:**
   - Summarize features: modular, robust, extensible, well-tested, and cloud-ready.
