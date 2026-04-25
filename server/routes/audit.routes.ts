import { Router, Request, Response } from 'express';
import prisma from '../prismaClient';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();
router.use(verifyToken);

router.get('/', async (req: Request, res: Response) => {
  try {
    const { entity, entity_id, limit } = req.query;
    const where: any = {};
    if (entity) where.entity = entity;
    if (entity_id) where.entity_id = entity_id;
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit ? parseInt(limit as string) : 50,
    });
    res.json(logs);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/entity/:entityId', async (req: Request, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      where: { entity_id: req.params.entityId },
      orderBy: { timestamp: 'desc' },
    });
    res.json(logs);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
