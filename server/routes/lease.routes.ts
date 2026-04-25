import { Router } from 'express';
import { leaseController } from '../controllers/lease.controller';
import { auditLogger } from '../middlewares/audit.middleware';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);
router.use(auditLogger);

router.get('/', leaseController.getAll);
router.get('/:id', leaseController.getById);
router.post('/', leaseController.create);
router.put('/:id', leaseController.update);
router.delete('/:id', leaseController.remove);

router.post('/:id/approve', leaseController.approve);
router.post('/:id/return', leaseController.returnLease);
router.post('/:id/pay', leaseController.pay);

export default router;
