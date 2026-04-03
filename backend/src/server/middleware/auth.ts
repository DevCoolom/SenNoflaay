/**
 * Authentication & JWT Middleware
 */

import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

export interface AuthRequest extends Request {
  user?: {
    username: string;
    associationId: string;
    role: string;
  };
}

/**
 * Generate JWT token
 */
export function generateToken(username: string, associationId: string, role: string): string {
  return jwt.sign(
    { username, associationId, role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Middleware to verify JWT token
 */
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const user = verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ error: (error as Error).message });
  }
}

/**
 * Check if user has required role
 */
export function authorizeRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

/**
 * Ensure associationId matches
 */
export function validateAssociationId(req: AuthRequest, res: Response, next: NextFunction) {
  const associationId = (req.query.associationId || req.body.associationId) as string;
  
  if (!associationId) {
    return res.status(400).json({ error: 'associationId required' });
  }

  if (req.user && req.user.associationId !== associationId && req.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Access denied for this association' });
  }

  next();
}
