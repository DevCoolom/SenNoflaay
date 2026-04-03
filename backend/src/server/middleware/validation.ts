/**
 * Input Validation & Security Utilities
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Sanitize string input - prevent SQL injection and XSS
 */
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Remove potentially dangerous characters
    return input
      .trim()
      .replace(/[<>\"'%;()&+]/g, '')
      .substring(0, 255); // Limit length
  }

  if (typeof input === 'object' && input !== null) {
    if (Array.isArray(input)) {
      return input.map((item) => sanitizeInput(item));
    }

    const sanitized: any = {};
    for (const key of Object.keys(input)) {
      sanitized[key] = sanitizeInput(input[key]);
    }
    return sanitized;
  }

  return input;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate required fields
 */
export function validateRequired(data: any, fields: string[]): string | null {
  for (const field of fields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      return `Field '${field}' is required`;
    }
  }
  return null;
}

/**
 * Validate username format
 */
export function isValidUsername(username: string): boolean {
  // Alphanumeric, underscore, dash, 3-20 chars
  return /^[a-zA-Z0-9_-]{3,20}$/.test(username);
}

/**
 * Middleware for request body validation
 */
export function validateRequestBody(
  requiredFields: string[]
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const validation = validateRequired(req.body, requiredFields);
    if (validation) {
      return res.status(400).json({ error: validation });
    }

    // Sanitize input
    req.body = sanitizeInput(req.body);

    next();
  };
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate association ID (alphanumeric with hyphens)
 */
export function isValidAssociationId(id: string): boolean {
  return /^[a-zA-Z0-9-]{3,50}$/.test(id);
}

/**
 * Password strength validator
 */
export function isStrongPassword(password: string): {
  isStrong: boolean;
  message: string;
} {
  if (password.length < 8) {
    return { isStrong: false, message: 'Password must be at least 8 characters' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isStrong: false, message: 'Password must contain uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { isStrong: false, message: 'Password must contain lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { isStrong: false, message: 'Password must contain number' };
  }

  return { isStrong: true, message: 'Password is strong' };
}
