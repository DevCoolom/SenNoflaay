/**
 * Finance Routes (Payments, Objectives, Expenses)
 */

import { Router, Response } from 'express';
import { AuthRequest, authenticateToken, validateAssociationId } from '../middleware/auth';
import { validateRequestBody } from '../middleware/validation';
import { queries } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// === PAYMENTS ===

/**
 * POST /api/finance/payments
 * Record a payment
 */
router.post(
  '/payments',
  authenticateToken,
  validateAssociationId,
  validateRequestBody(['associationId', 'memberId', 'amount', 'date']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { associationId, memberId, objectiveId, amount, date, method } = req.body;

      const id = uuidv4();

      await queries.createPayment({
        id,
        association_id: associationId,
        member_id: memberId,
        objective_id: objectiveId || null,
        amount,
        date,
        method,
      });

      res.status(201).json({ success: true, id });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

// === OBJECTIVES ===

/**
 * POST /api/finance/objectives
 * Create a financial objective
 */
router.post(
  '/objectives',
  authenticateToken,
  validateAssociationId,
  validateRequestBody(['associationId', 'name', 'target']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { associationId, name, description, target, color } = req.body;

      const id = uuidv4();

      await queries.createObjective({
        id,
        association_id: associationId,
        name,
        description,
        target,
        color,
      });

      res.status(201).json({ success: true, id });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

/**
 * DELETE /api/finance/objectives/:id
 * Delete objective
 */
router.delete(
  '/objectives/:id',
  authenticateToken,
  validateAssociationId,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const associationId = (req.query.associationId || req.body.associationId) as string;

      await queries.deleteObjective(id, associationId);

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

// === EXPENSES ===

/**
 * POST /api/finance/expenses
 * Record an expense
 */
router.post(
  '/expenses',
  authenticateToken,
  validateAssociationId,
  validateRequestBody(['associationId', 'amount', 'date']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { associationId, objectiveId, amount, date, desc, category } = req.body;

      const id = uuidv4();

      await queries.createExpense({
        id,
        association_id: associationId,
        objective_id: objectiveId || null,
        category,
        amount,
        date,
        description: desc,
      });

      res.status(201).json({ success: true, id });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

// === CORRECTIONS ===

/**
 * POST /api/finance/corrections
 * Record a correction (adjustment)
 */
router.post(
  '/corrections',
  authenticateToken,
  validateAssociationId,
  validateRequestBody(['associationId', 'year', 'amount']),
  async (req: AuthRequest, res: Response) => {
    try {
      const { associationId, year, amount, reason } = req.body;

      await queries.upsertCorrection(associationId, year, amount, reason);

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

// === MEMBERSHIP FEE CONFIG ===

/**
 * POST /api/finance/membership-fee-config
 * Configure membership fees
 */
router.post(
  '/membership-fee-config',
  authenticateToken,
  validateAssociationId,
  validateRequestBody(['associationId']),
  async (req: AuthRequest, res: Response) => {
    try {
      const {
        associationId,
        frequency,
        period,
        amountAll,
        amountMale,
        amountFemale,
        amountMinor,
        useCategories,
      } = req.body;

      await queries.upsertMembershipFeeConfig({
        association_id: associationId,
        frequency,
        period,
        amount_all: amountAll,
        amount_male: amountMale,
        amount_female: amountFemale,
        amount_minor: amountMinor,
        use_categories: useCategories ? true : false,
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

export default router;
