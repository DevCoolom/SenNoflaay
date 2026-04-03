/**
 * Members Routes
 */

import { Router, Response } from 'express';
import { AuthRequest, authenticateToken, validateAssociationId } from '../middleware/auth';
import { validateRequestBody, isValidUUID } from '../middleware/validation';
import { queries } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

/**
 * POST /api/members
 * Create a new member
 */
router.post(
  '/',
  authenticateToken,
  validateAssociationId,
  validateRequestBody(['associationId', 'firstName', 'lastName']),
  async (req: AuthRequest, res: Response) => {
    try {
      const {
        associationId,
        firstName,
        lastName,
        tel,
        city,
        fee,
        joinedDate,
        gender,
        isMinor,
        linkedMemberId,
        linkedPersonName,
      } = req.body;

      const id = uuidv4();

      await queries.createMember({
        id,
        association_id: associationId,
        first_name: firstName,
        last_name: lastName,
        phone: tel,
        city,
        fee: fee || 0,
        joined_date: joinedDate,
        gender,
        is_minor: isMinor ? true : false,
        linked_member_id: linkedMemberId,
        linked_person_name: linkedPersonName,
      });

      res.status(201).json({ success: true, id });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

/**
 * PUT /api/members/:id
 * Update member
 */
router.put(
  '/:id',
  authenticateToken,
  validateAssociationId,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const associationId = (req.query.associationId || req.body.associationId) as string;
      const {
        firstName,
        lastName,
        tel,
        city,
        fee,
        joinedDate,
        gender,
        isMinor,
        linkedMemberId,
        linkedPersonName,
      } = req.body;

      await queries.updateMember(id, associationId, {
        first_name: firstName,
        last_name: lastName,
        phone: tel,
        city,
        fee,
        joined_date: joinedDate,
        gender,
        is_minor: isMinor ? true : false,
        linked_member_id: linkedMemberId,
        linked_person_name: linkedPersonName,
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

/**
 * DELETE /api/members/:id
 * Delete member
 */
router.delete(
  '/:id',
  authenticateToken,
  validateAssociationId,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const associationId = (req.query.associationId || req.body.associationId) as string;

      await queries.deleteMember(id, associationId);

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

export default router;
