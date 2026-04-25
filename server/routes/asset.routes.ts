import { Router, Request, Response } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();
router.use(verifyToken);

// Legacy endpoint — Asset model removed; asset info is now inline on Lease
// Returns empty array for backward compatibility
router.get('/', (_req: Request, res: Response) => {
  res.json([]);
});

router.post('/', (_req: Request, res: Response) => {
  res.status(410).json({ error: 'Asset model deprecated. Asset info is now inline on Lease records.' });
});

router.delete('/:id', (_req: Request, res: Response) => {
  res.status(410).json({ error: 'Asset model deprecated. Asset info is now inline on Lease records.' });
});

export default router;
