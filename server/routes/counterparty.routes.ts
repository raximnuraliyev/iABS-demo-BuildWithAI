import { Router, Request, Response } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();
router.use(verifyToken);

// Legacy endpoint — Counterparty model replaced by Client
// Returns empty array for backward compatibility
router.get('/', (_req: Request, res: Response) => {
  res.json([]);
});

router.post('/', (_req: Request, res: Response) => {
  res.status(410).json({ error: 'Counterparty model deprecated. Use /api/v1/clients instead.' });
});

router.put('/:id', (_req: Request, res: Response) => {
  res.status(410).json({ error: 'Counterparty model deprecated. Use /api/v1/clients instead.' });
});

router.delete('/:id', (_req: Request, res: Response) => {
  res.status(410).json({ error: 'Counterparty model deprecated. Use /api/v1/clients instead.' });
});

export default router;
