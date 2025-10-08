/**
 * Security Configuration for Master Image Editor
 * This file contains security settings and policies
 */

module.exports = {
  // Content Security Policy
  csp: {
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'"], // Required for React dev
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", "data:", "blob:"],
      'font-src': ["'self'", "data:"],
      'connect-src': ["'self'"],
      'media-src': ["'self'", "blob:"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"]
    }
  },

  // Allowed origins for cross-origin requests
  allowedOrigins: [
    // Add your allowed origins here
    // 'https://api.example.com',
    // 'https://cdn.example.com'
  ],

  // File upload restrictions
  fileUpload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'application/json'
    ],
    allowedExtensions: [
      '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.json'
    ]
  },

  // Input validation rules
  validation: {
    maxStringLength: 1000,
    maxArrayLength: 100,
    maxObjectDepth: 10,
    allowedCharacters: /^[a-zA-Z0-9\s\-_.,!?()[\]{}'"@#$%^&*+=<>:;/\\|`~]*$/
  },

  // Logging configuration
  logging: {
    maxLogLength: 200,
    sanitizePatterns: [
      /[\r\n]/g,           // Remove line breaks
      /[\x00-\x1f\x7f-\x9f]/g, // Remove control characters
      /[<>'"&]/g           // Remove HTML characters
    ]
  },

  // Rate limiting (if implemented)
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    skipSuccessfulRequests: false
  },

  // Security headers
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  }
};