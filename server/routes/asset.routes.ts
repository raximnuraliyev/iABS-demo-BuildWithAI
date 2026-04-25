import { Router, Request, Response } from 'express';
import prisma from '../prismaClient';
import { verifyToken } from '../middlewares/auth.middleware';
import { z } from 'zod';

const router = Router();
router.use(verifyToken);

const assetSchema = z.object({
  name: z.string().min(1),
  category: z.enum(['PC', 'FURNITURE', 'BUILDING', 'LAND', 'ATM']),
  measurement_unit: z.enum(['PIECES', 'SQ_METERS']),
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const where: any = {};
    if (category) where.category = category;
    const assets = await prisma.asset.findMany({ where, orderBy: { name: 'asc' } });
    res.json(assets);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = assetSchema.parse(req.body);
    const asset = await prisma.asset.create({ data: parsed });
    res.status(201).json(asset);
  } catch (e: any) {
    res.status(400).json({ error: e.errors ? e.errors.map((x: any) => x.message).join(', ') : e.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = assetSchema.partial().parse(req.body);
    const asset = await prisma.asset.update({ where: { id: req.params.id }, data: parsed });
    res.json(asset);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.asset.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
