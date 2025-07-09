// EmailResponse model
// Represents the result of an email send attempt
/**
 * @typedef {Object} EmailResponse
 * @property {boolean} success - Whether the email was sent successfully
 * @property {string} provider - The provider used to send the email
 * @property {string} [error] - Error message if sending failed
 * @property {string} [messageId] - Unique ID from the provider (if available)
 * @property {string} [idempotencyKey] - The idempotency key from the request (if provided)
 * @property {Object} [details] - Optional additional response details
 */

// Example:
// const response = {
//   success: true,
//   provider: 'MockProviderA',
//   messageId: 'abc123',
//   idempotencyKey: 'unique-key-123',
//   details: {}
// };
