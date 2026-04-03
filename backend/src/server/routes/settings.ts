/**
 * Settings & Tasks Routes
 */

import { Router, Response } from 'express';
import { AuthRequest, authenticateToken, validateAssociationId } from '../middleware/auth';
import { validateRequestBody } from '../middleware/validation';
import { queries } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// === SETTINGS ===

/**
 * POST /api/settings
 * Set a configuration setting
 */
router.post(
  '/',
  authenticateToken,
  validateAssociationId,
  validateRequestBody(['associationId', 'key', 'value']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { associationId, key, value } = req.body;

      await queries.setSetting(associationId, key, value);

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

// === TASKS ===

/**
 * POST /api/tasks
 * Create a task
 */
router.post(
  '/',
  authenticateToken,
  validateAssociationId,
  validateRequestBody(['associationId', 'title']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { associationId, title, description, status, priority } = req.body;

      const id = uuidv4();

      await queries.createTask({
        id,
        association_id: associationId,
        title,
        description,
        status: status || 'todo',
        priority: priority || 0,
        created_at: new Date().toISOString(),
      });

      res.status(201).json({ success: true, id });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

/**
 * PUT /api/tasks/:id
 * Update task
 */
router.put(
  '/:id',
  authenticateToken,
  validateAssociationId,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const associationId = (req.query.associationId || req.body.associationId) as string;
      const { title, description, status, priority } = req.body;

      await queries.updateTask(id, associationId, {
        title,
        description,
        status,
        priority,
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

/**
 * DELETE /api/tasks/:id
 * Delete task
 */
router.delete(
  '/:id',
  authenticateToken,
  validateAssociationId,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const associationId = (req.query.associationId || req.body.associationId) as string;

      await queries.deleteTask(id, associationId);

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

/**
 * POST /api/tasks/reorder
 * Reorder tasks by priority
 */
router.post(
  '/reorder',
  authenticateToken,
  validateAssociationId,
  validateRequestBody(['associationId', 'tasks']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { associationId, tasks } = req.body; // Array of { id, priority }

      // Update each task's priority
      for (const task of tasks) {
        await queries.updateTask(task.id, associationId, { priority: task.priority });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

export default router;
