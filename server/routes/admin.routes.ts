import { Router, Request, Response } from 'express';
import { AuthRepository } from '../repositories/auth.repository';
import { verifyToken, requirePermission } from '../middlewares/auth.middleware';
import { auditLogger } from '../middlewares/audit.middleware';

const router = Router();
const repository = new AuthRepository();

router.use(verifyToken);
router.use(auditLogger);

router.put('/roles/:id/permissions', requirePermission('is_superadmin'), async (req: Request, res: Response) => {
  try {
    const { action_name, is_allowed } = req.body;
    await repository.updateRolePermission(req.params.id, action_name, is_allowed);

    req.auditInfo = {
      action: 'UPDATE_ROLE_PERMISSION',
      entity_name: 'role_permissions',
      entity_id: req.params.id,
      new_data: { action_name, is_allowed }
    };

    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
