/**
 * Security Middleware for Master Image Editor
 * Provides security utilities and validation functions
 */

import { sanitizeForLog, sanitizeHtml } from './security';

// File validation
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/json'
  ];

  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 10MB limit' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' };
  }

  return { valid: true };
};

// URL validation
export const validateUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    // Only allow http/https protocols
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

// Origin validation
export const validateOrigin = (origin: string, allowedOrigins: string[] = []): boolean => {
  if (origin === window.location.origin) {
    return true;
  }
  return allowedOrigins.includes(origin);
};

// Input sanitization for forms
export const sanitizeInput = (input: string, maxLength: number = 1000): string => {
  if (!input) return '';
  
  return input
    .trim()
    .substring(0, maxLength)
    .replace(/[<>'"&]/g, (match) => {
      const entities: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[match] || match;
    });
};

// Safe JSON parsing
export const safeJsonParse = (jsonString: string): { success: boolean; data?: any; error?: string } => {
  try {
    const data = JSON.parse(jsonString);
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: sanitizeForLog(error instanceof Error ? error.message : 'Invalid JSON')
    };
  }
};

// Content Security Policy helper
export const generateCSPHeader = (): string => {
  const directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ];
  
  return directives.join('; ');
};

// Rate limiting helper (client-side)
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }

  reset(key: string): void {
    this.requests.delete(key);
  }
}

// Secure storage wrapper
export class SecureStorage {
  private prefix: string;

  constructor(prefix: string = 'secure_') {
    this.prefix = prefix;
  }

  set(key: string, value: any): boolean {
    try {
      const sanitizedKey = sanitizeInput(key, 100);
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(this.prefix + sanitizedKey, serializedValue);
      return true;
    } catch (error) {
      console.error('SecureStorage.set error:', sanitizeForLog(error));
      return false;
    }
  }

  get(key: string): any {
    try {
      const sanitizedKey = sanitizeInput(key, 100);
      const item = localStorage.getItem(this.prefix + sanitizedKey);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('SecureStorage.get error:', sanitizeForLog(error));
      return null;
    }
  }

  remove(key: string): boolean {
    try {
      const sanitizedKey = sanitizeInput(key, 100);
      localStorage.removeItem(this.prefix + sanitizedKey);
      return true;
    } catch (error) {
      console.error('SecureStorage.remove error:', sanitizeForLog(error));
      return false;
    }
  }

  clear(): boolean {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(this.prefix));
      keys.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('SecureStorage.clear error:', sanitizeForLog(error));
      return false;
    }
  }
}

// XSS protection for dynamic content
export const createSafeHTML = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

// CSRF token generator (if needed)
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Security event logger
export const logSecurityEvent = (event: string, details: any = {}): void => {
  const timestamp = new Date().toISOString();
  const sanitizedDetails = sanitizeForLog(JSON.stringify(details));
  
  console.warn(`[SECURITY] ${timestamp} - ${event}: ${sanitizedDetails}`);
  
  // In production, you might want to send this to a security monitoring service
  // sendToSecurityService({ event, details: sanitizedDetails, timestamp });
};

export default {
  validateFile,
  validateUrl,
  validateOrigin,
  sanitizeInput,
  safeJsonParse,
  generateCSPHeader,
  RateLimiter,
  SecureStorage,
  createSafeHTML,
  generateCSRFToken,
  logSecurityEvent
};