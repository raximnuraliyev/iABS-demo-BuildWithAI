import { Router, Request, Response } from 'express';
import { CBURegistryRepository } from '../repositories/cbu-registry.repository';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();
const repository = new CBURegistryRepository();

router.use(verifyToken);

router.get('/', async (req: Request, res: Response) => {
  try {
    const entries = await repository.findAll();
    res.json(entries);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
