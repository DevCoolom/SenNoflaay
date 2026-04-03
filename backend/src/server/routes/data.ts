/**
 * Data Loading Routes
 */

import { Router, Response } from 'express';
import { AuthRequest, authenticateToken, validateAssociationId } from '../middleware/auth';
import { queries } from '../db';

const router = Router();

/**
 * POST /api/data
 * Load all data for an association
 */
router.post(
  '/',
  authenticateToken,
  validateAssociationId,
  async (req: AuthRequest, res: Response) => {
    try {
      const associationId = (req.body.associationId || req.query.associationId) as string;

      // Fetch all data in parallel
      const [
        association,
        members,
        payments,
        objectives,
        expenses,
        events,
        bills,
        corrections,
        users,
        auditLogs,
        settings,
        tasks,
        feeConfig,
      ] = await Promise.all([
        queries.getAssociation(associationId).catch(() => null),
        queries.getMembers(associationId),
        queries.getPayments(associationId),
        queries.getObjectives(associationId),
        queries.getExpenses(associationId),
        queries.getEvents(associationId),
        queries.getBills(associationId),
        queries.getCorrections(associationId),
        queries.getUsers(associationId),
        queries.getAuditLogs(associationId),
        queries.getSettings(associationId),
        queries.getTasks(associationId),
        queries.getMembershipFeeConfig(associationId).catch(() => null),
      ]);

      // Transform and map snake_case to camelCase for frontend
      const mappedMembers = (members || []).map((m: any) => ({
        ...m,
        associationId: m.association_id,
        firstName: m.first_name,
        lastName: m.last_name,
        joinedDate: m.joined_date,
        tel: m.phone,
        isMinor: m.is_minor === true,
        linkedMemberId: m.linked_member_id,
        linkedPersonName: m.linked_person_name,
        payments: (payments || [])
          .filter((p: any) => p.member_id === m.id)
          .map((p: any) => ({
            ...p,
            associationId: p.association_id,
            memberId: p.member_id,
            objectiveId: p.objective_id,
          })),
      }));

      const mappedFeeConfig = feeConfig
        ? {
            associationId: feeConfig.association_id,
            frequency: feeConfig.frequency,
            period: feeConfig.period,
            amountAll: feeConfig.amount_all,
            amountMale: feeConfig.amount_male,
            amountFemale: feeConfig.amount_female,
            amountMinor: feeConfig.amount_minor,
            useCategories: feeConfig.use_categories === true,
          }
        : null;

      res.json({
        association: association
          ? {
              ...association,
              logoUrl: association.logo_url,
              createdAt: association.created_at,
            }
          : null,
        members: mappedMembers,
        objectives: (objectives || []).map((o: any) => ({
          ...o,
          associationId: o.association_id,
        })),
        expenses: (expenses || []).map((e: any) => ({
          ...e,
          associationId: e.association_id,
          objectiveId: e.objective_id,
          desc: e.description,
        })),
        events: (events || []).map((ev: any) => ({
          ...ev,
          associationId: ev.association_id,
          bookId: ev.book_id,
          player: ev.speaker,
          place: ev.location,
        })),
        bills: (bills || []).map((b: any) => ({
          ...b,
          associationId: b.association_id,
          fileUrl: b.file_url,
          fileName: b.file_name,
        })),
        corrections: (corrections || []).map((c: any) => ({
          ...c,
          associationId: c.association_id,
        })),
        users: (users || []).map((u: any) => ({
          ...u,
          associationId: u.association_id,
        })),
        auditLogs: (auditLogs || []).map((l: any) => ({
          ...l,
          associationId: l.association_id,
          user: l.user_name,
        })),
        settings: settings || {},
        tasks: (tasks || []).map((t: any) => ({
          ...t,
          associationId: t.association_id,
          createdAt: t.created_at,
        })),
        membershipFeeConfig: mappedFeeConfig,
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
);

export default router;
