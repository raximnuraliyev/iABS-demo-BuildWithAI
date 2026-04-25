import { Router } from 'express';
import { accountController } from '../controllers/account.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);

router.get('/', accountController.getAll);
router.get('/:id', accountController.getById);
router.post('/', accountController.create);
router.put('/:id', accountController.update);
router.delete('/:id', accountController.remove);

export default router;
