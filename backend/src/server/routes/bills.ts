/**
 * Bills Routes
 */

import { Router, Response } from 'express';
import { AuthRequest, authenticateToken, validateAssociationId } from '../middleware/auth';
import { validateRequestBody } from '../middleware/validation';
import { queries } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * POST /api/bills
 * Create a bill
 */
router.post(
  '/',
  authenticateToken,
  validateAssociationId,
  validateRequestBody(['associationId', 'title', 'amount', 'date']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { associationId, title, amount, date, category, fileUrl, fileName, description } =
        req.body;

      const id = uuidv4();

      await queries.createBill({
        id,
        association_id: associationId,
        title,
        amount,
        date,
        category,
        file_url: fileUrl,
        file_name: fileName,
        description,
      });

      res.status(201).json({ success: true, id });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

/**
 * DELETE /api/bills/:id
 * Delete bill
 */
router.delete(
  '/:id',
  authenticateToken,
  validateAssociationId,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const associationId = (req.query.associationId || req.body.associationId) as string;

      await queries.deleteBill(id, associationId);

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

export default router;
