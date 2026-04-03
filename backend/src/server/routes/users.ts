/**
 * Users & Admin Routes
 */

import { Router, Response } from 'express';
import bcrypt from 'bcrypt';
import { AuthRequest, authenticateToken, validateAssociationId, authorizeRole } from '../middleware/auth';
import {
  validateRequestBody,
  isValidUsername,
  isStrongPassword,
} from '../middleware/validation';
import { queries } from '../db';

const router = Router();

/**
 * POST /api/users
 * Create a new user (admin only)
 */
router.post(
  '/',
  authenticateToken,
  validateAssociationId,
  authorizeRole('superadmin', 'admin'),
  validateRequestBody(['username', 'associationId', 'password', 'role']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { username, associationId, password, role } = req.body;

      if (!isValidUsername(username)) {
        return res.status(400).json({
          error:
            'Invalid username. Use alphanumeric, underscore, or dash (3-20 chars)',
        });
      }

      const passwordCheck = isStrongPassword(password);
      if (!passwordCheck.isStrong) {
        return res.status(400).json({ error: passwordCheck.message });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      await queries.createUser(username, associationId, hashedPassword, role);

      res.status(201).json({ success: true });
    } catch (error) {
      const msg = (error as Error).message;
      if (msg.includes('unique')) {
        res.status(409).json({ error: 'Username already exists for this association' });
      } else {
        res.status(500).json({ error: msg });
      }
    }
  }
);

/**
 * PUT /api/users/:username
 * Update user (change password or role)
 */
router.put(
  '/:username',
  authenticateToken,
  validateAssociationId,
  authorizeRole('superadmin', 'admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { username } = req.params;
      const associationId = (req.query.associationId || req.body.associationId) as string;
      const { password, role } = req.body;

      const updates: any = { role };

      if (password && password.trim() !== '') {
        const passwordCheck = isStrongPassword(password);
        if (!passwordCheck.isStrong) {
          return res.status(400).json({ error: passwordCheck.message });
        }
        updates.password = await bcrypt.hash(password, 10);
      }

      await queries.updateUser(username, associationId, updates);

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

/**
 * DELETE /api/users/:username
 * Delete user (admin only)
 */
router.delete(
  '/:username',
  authenticateToken,
  validateAssociationId,
  authorizeRole('superadmin', 'admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const { username } = req.params;
      const associationId = (req.query.associationId || req.body.associationId) as string;

      // Prevent deleting the current user
      if (req.user?.username === username) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }

      await queries.deleteUser(username, associationId);

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

/**
 * POST /api/audit-logs
 * Create audit log entry
 */
router.post(
  '/',
  authenticateToken,
  validateAssociationId,
  validateRequestBody(['action']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { action, details } = req.body;
      const associationId = (req.query.associationId || req.body.associationId) as string;

      await queries.createAuditLog({
        association_id: associationId,
        user_name: req.user?.username || 'unknown',
        action,
        details,
        timestamp: new Date().toISOString(),
      });

      res.status(201).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

export default router;
