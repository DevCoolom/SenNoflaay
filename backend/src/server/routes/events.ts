/**
 * Events Routes
 */

import { Router, Response } from 'express';
import { AuthRequest, authenticateToken, validateAssociationId } from '../middleware/auth';
import { validateRequestBody } from '../middleware/validation';
import { queries } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * POST /api/events
 * Create an event
 */
router.post(
  '/',
  authenticateToken,
  validateAssociationId,
  validateRequestBody(['associationId', 'name', 'date']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { associationId, name, date, time, place, player, description, bookId, participants } =
        req.body;

      const id = uuidv4();

      await queries.createEvent({
        id,
        association_id: associationId,
        name,
        date,
        time,
        location: place,
        speaker: player,
        description,
        book_id: bookId,
        participants: participants || 0,
      });

      res.status(201).json({ success: true, id });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

/**
 * PUT /api/events/:id
 * Update event
 */
router.put('/:id', authenticateToken, validateAssociationId, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const associationId = (req.query.associationId || req.body.associationId) as string;
    const { name, date, time, place, player, description, bookId, participants } = req.body;

    await queries.updateEvent(id, associationId, {
      name,
      date,
      time,
      location: place,
      speaker: player,
      description,
      book_id: bookId,
      participants,
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * DELETE /api/events/:id
 * Delete event
 */
router.delete(
  '/:id',
  authenticateToken,
  validateAssociationId,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const associationId = (req.query.associationId || req.body.associationId) as string;

      await queries.deleteEvent(id, associationId);

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

export default router;
