import { Router } from 'express';
import { leaseController } from '../controllers/lease.controller';
import { verifyToken, requirePermission } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);

router.get('/', leaseController.getAll);
router.get('/:id', leaseController.getById);
router.post('/', requirePermission('can_add_lease'), leaseController.create);
router.put('/:id', requirePermission('can_add_lease'), leaseController.update);
router.delete('/:id', requirePermission('can_add_lease'), leaseController.remove);

router.post('/:id/approve', requirePermission('can_approve_lease'), leaseController.approve);
router.post('/:id/return', requirePermission('can_approve_lease'), leaseController.returnLease);
router.post('/:id/pay', requirePermission('can_execute_payment'), leaseController.pay);

export default router;
