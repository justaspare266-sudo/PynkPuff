/**
 * Security utilities for sanitizing user input
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize text for safe logging to prevent log injection
 */
export function sanitizeForLog(input: any): string {
  if (!input) return '';
  
  // Convert to string if not already
  const str = typeof input === 'string' ? input : JSON.stringify(input);
  
  return str
    .replace(/[\r\n]/g, ' ')
    .replace(/[\x00-\x1f\x7f-\x9f]/g, '')
    .substring(0, 200);
}

/**
 * Sanitize object for safe logging
 */
export function sanitizeObjectForLog(obj: any): any {
  if (!obj) return obj;
  
  if (typeof obj === 'string') {
    return sanitizeForLog(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObjectForLog);
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[sanitizeForLog(key)] = sanitizeObjectForLog(value);
    }
    return sanitized;
  }
  
  return obj;
}