// EmailRequest model
// Represents a request to send an email
/**
 * @typedef {Object} EmailRequest
 * @property {string} to - Recipient email address
 * @property {string} subject - Email subject line
 * @property {string} body - Email message body (plain text or HTML)
 * @property {string} [idempotencyKey] - Optional unique key for idempotency
 * @property {Object} [metadata] - Optional additional metadata
 */

// Example:
// const request = {
//   to: 'user@example.com',
//   subject: 'Welcome!',
//   body: 'Hello, welcome to our service.',
//   idempotencyKey: 'unique-key-123',
//   metadata: { campaign: 'onboarding' }
// };
