import { Router, Request, Response } from 'express';
import { aiController } from '../controllers/ai.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { AIService } from '../services/ai.service';

const router = Router();

router.use(verifyToken);

router.post('/copilot', aiController.copilot);
router.post('/matchmaker', aiController.matchmaker);
router.post('/analytics', aiController.analytics);

// Diagnostics: check which model is currently active
router.get('/model-status', (req: Request, res: Response) => {
  const service = new AIService();
  res.json(service.getModelStatus());
});

export default router;
