/**
 * Authentication Routes
 */

import { Router, Response } from 'express';
import bcrypt from 'bcrypt';
import { AuthRequest, generateToken, authenticateToken } from '../middleware/auth';
import { validateRequestBody, isValidUsername, isStrongPassword, isValidAssociationId } from '../middleware/validation';
import { queries } from '../db';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new association with admin user
 */
router.post(
  '/register',
  validateRequestBody(['id', 'name', 'adminUsername', 'adminPassword']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { id, name, adminUsername, adminPassword } = req.body;

      // Validate inputs
      if (!isValidAssociationId(id)) {
        return res.status(400).json({ 
          error: 'Invalid association ID. Use alphanumeric characters and hyphens only (3-50 chars)' 
        });
      }

      if (!isValidUsername(adminUsername)) {
        return res.status(400).json({ 
          error: 'Invalid username. Use alphanumeric characters, underscore, or dash (3-20 chars)' 
        });
      }

      const passwordCheck = isStrongPassword(adminPassword);
      if (!passwordCheck.isStrong) {
        return res.status(400).json({ error: passwordCheck.message });
      }

      // Check if association already exists
      try {
        await queries.getAssociation(id);
        return res.status(409).json({ error: 'Association ID already exists' });
      } catch {
        // Good - doesn't exist
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      // Create association
      await queries.createAssociation(id, name);

      // Create admin user
      await queries.createUser(adminUsername, id, hashedPassword, 'superadmin');

      // Set default settings
      await queries.setSetting(id, 'logo_url', '');
      await queries.setSetting(id, 'app_name', name);

      res.status(201).json({
        success: true,
        message: 'Association registered successfully',
        associationId: id,
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

/**
 * POST /api/auth/login
 * Login user and return JWT token
 */
router.post(
  '/login',
  validateRequestBody(['associationId', 'username', 'password']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { associationId, username, password } = req.body;

      // Get user from database
      const user = await queries.getUserByCredentials(username, associationId);

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Compare password with hash
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = generateToken(user.username, user.association_id, user.role);

      res.json({
        success: true,
        token,
        user: {
          username: user.username,
          role: user.role,
          associationId: user.association_id,
        },
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

/**
 * POST /api/auth/verify
 * Verify JWT token
 */
router.post('/verify', authenticateToken, (req: AuthRequest, res: Response) => {
  res.json({
    valid: true,
    user: req.user,
  });
});

export default router;
