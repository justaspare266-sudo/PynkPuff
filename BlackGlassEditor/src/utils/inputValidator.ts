// Input validation and sanitization utilities

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  type?: 'string' | 'number' | 'email' | 'url' | 'color' | 'file';
  allowedExtensions?: string[];
  maxFileSize?: number; // in bytes
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: any;
}

export class InputValidator {
  // Sanitize HTML to prevent XSS
  static sanitizeHtml(input: string): string {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  // Sanitize URL to prevent malicious redirects
  static sanitizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      // Only allow http, https, and data URLs
      if (!['http:', 'https:', 'data:'].includes(parsed.protocol)) {
        return '';
      }
      return parsed.toString();
    } catch {
      return '';
    }
  }

  // Sanitize file name
  static sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 255);
  }

  // Validate color values
  static validateColor(color: string): boolean {
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$|^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[01]?\.?\d*\s*\)$/;
    return colorRegex.test(color);
  }

  // Validate email format
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate numeric input
  static validateNumber(value: any, min?: number, max?: number): ValidationResult {
    const num = Number(value);
    const errors: string[] = [];

    if (isNaN(num)) {
      errors.push('Must be a valid number');
    } else {
      if (min !== undefined && num < min) {
        errors.push(`Must be at least ${min}`);
      }
      if (max !== undefined && num > max) {
        errors.push(`Must be at most ${max}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: isNaN(num) ? undefined : num
    };
  }

  // Validate string input
  static validateString(value: string, rules: ValidationRule): ValidationResult {
    const errors: string[] = [];
    let sanitizedValue = this.sanitizeHtml(value.trim());

    if (rules.required && !sanitizedValue) {
      errors.push('This field is required');
    }

    if (sanitizedValue) {
      if (rules.minLength && sanitizedValue.length < rules.minLength) {
        errors.push(`Must be at least ${rules.minLength} characters`);
      }

      if (rules.maxLength && sanitizedValue.length > rules.maxLength) {
        errors.push(`Must be at most ${rules.maxLength} characters`);
        sanitizedValue = sanitizedValue.substring(0, rules.maxLength);
      }

      if (rules.pattern && !rules.pattern.test(sanitizedValue)) {
        errors.push('Invalid format');
      }

      if (rules.type === 'email' && !this.validateEmail(sanitizedValue)) {
        errors.push('Must be a valid email address');
      }

      if (rules.type === 'url') {
        const sanitizedUrl = this.sanitizeUrl(sanitizedValue);
        if (!sanitizedUrl) {
          errors.push('Must be a valid URL');
        } else {
          sanitizedValue = sanitizedUrl;
        }
      }

      if (rules.type === 'color' && !this.validateColor(sanitizedValue)) {
        errors.push('Must be a valid color');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue
    };
  }

  // Validate file input
  static validateFile(file: File, rules: ValidationRule): ValidationResult {
    const errors: string[] = [];

    if (rules.required && !file) {
      errors.push('File is required');
      return { isValid: false, errors };
    }

    if (!file) {
      return { isValid: true, errors: [] };
    }

    // Check file size
    if (rules.maxFileSize && file.size > rules.maxFileSize) {
      errors.push(`File size must be less than ${(rules.maxFileSize / 1024 / 1024).toFixed(1)}MB`);
    }

    // Check file extension
    if (rules.allowedExtensions) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !rules.allowedExtensions.includes(extension)) {
        errors.push(`File type must be one of: ${rules.allowedExtensions.join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: file
    };
  }

  // Validate object properties
  static validateObject(obj: Record<string, any>, schema: Record<string, ValidationRule>): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {};

    for (const [key, rules] of Object.entries(schema)) {
      const value = obj[key];

      if (rules.type === 'file' && value instanceof File) {
        results[key] = this.validateFile(value, rules);
      } else if (rules.type === 'number') {
        results[key] = this.validateNumber(value, rules.min, rules.max);
      } else {
        results[key] = this.validateString(String(value || ''), rules);
      }
    }

    return results;
  }

  // Check if all validations passed
  static isValidObject(validationResults: Record<string, ValidationResult>): boolean {
    return Object.values(validationResults).every(result => result.isValid);
  }

  // Get all errors from validation results
  static getAllErrors(validationResults: Record<string, ValidationResult>): string[] {
    return Object.values(validationResults)
      .flatMap(result => result.errors)
      .filter(Boolean);
  }

  // Get sanitized values from validation results
  static getSanitizedValues(validationResults: Record<string, ValidationResult>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    for (const [key, result] of Object.entries(validationResults)) {
      if (result.sanitizedValue !== undefined) {
        sanitized[key] = result.sanitizedValue;
      }
    }

    return sanitized;
  }

  // Validate canvas dimensions
  static validateCanvasDimensions(width: number, height: number): ValidationResult {
    const errors: string[] = [];

    if (width < 1 || width > 8192) {
      errors.push('Width must be between 1 and 8192 pixels');
    }

    if (height < 1 || height > 8192) {
      errors.push('Height must be between 1 and 8192 pixels');
    }

    const totalPixels = width * height;
    if (totalPixels > 33554432) { // 32MP limit
      errors.push('Total canvas size cannot exceed 32 megapixels');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: { width: Math.max(1, Math.min(8192, width)), height: Math.max(1, Math.min(8192, height)) }
    };
  }

  // Validate transform values
  static validateTransform(transform: { x?: number; y?: number; scaleX?: number; scaleY?: number; rotation?: number }): ValidationResult {
    const errors: string[] = [];
    const sanitized = { ...transform };

    // Validate position
    if (transform.x !== undefined) {
      const xResult = this.validateNumber(transform.x, -10000, 10000);
      if (!xResult.isValid) errors.push(`X position: ${xResult.errors.join(', ')}`);
      else sanitized.x = xResult.sanitizedValue;
    }

    if (transform.y !== undefined) {
      const yResult = this.validateNumber(transform.y, -10000, 10000);
      if (!yResult.isValid) errors.push(`Y position: ${yResult.errors.join(', ')}`);
      else sanitized.y = yResult.sanitizedValue;
    }

    // Validate scale
    if (transform.scaleX !== undefined) {
      const scaleXResult = this.validateNumber(transform.scaleX, 0.01, 100);
      if (!scaleXResult.isValid) errors.push(`X scale: ${scaleXResult.errors.join(', ')}`);
      else sanitized.scaleX = scaleXResult.sanitizedValue;
    }

    if (transform.scaleY !== undefined) {
      const scaleYResult = this.validateNumber(transform.scaleY, 0.01, 100);
      if (!scaleYResult.isValid) errors.push(`Y scale: ${scaleYResult.errors.join(', ')}`);
      else sanitized.scaleY = scaleYResult.sanitizedValue;
    }

    // Validate rotation
    if (transform.rotation !== undefined) {
      const rotationResult = this.validateNumber(transform.rotation, -360, 360);
      if (!rotationResult.isValid) errors.push(`Rotation: ${rotationResult.errors.join(', ')}`);
      else sanitized.rotation = rotationResult.sanitizedValue;
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: sanitized
    };
  }
}