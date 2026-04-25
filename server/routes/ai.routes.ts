import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(verifyToken);

router.post('/copilot', aiController.copilot);
router.post('/matchmaker', aiController.matchmaker);
router.post('/analytics', aiController.analytics);

export default router;
