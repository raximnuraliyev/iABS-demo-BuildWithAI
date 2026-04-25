import { Router, Request, Response } from 'express';
import prisma from '../prismaClient';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();
router.use(verifyToken);

router.get('/', async (req: Request, res: Response) => {
  try {
    const roles = await prisma.role.findMany({ include: { permissions: true }, orderBy: { name: 'asc' } });
    res.json(roles);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id/permissions', async (req: Request, res: Response) => {
  try {
    const { action_name, is_allowed } = req.body;
    const roleId = req.params.id;
    const existing = await prisma.rolePermission.findFirst({ where: { role_id: roleId, action_name } });
    let result;
    if (existing) {
      result = await prisma.rolePermission.update({ where: { id: existing.id }, data: { is_allowed } });
    } else {
      result = await prisma.rolePermission.create({ data: { role_id: roleId, action_name, is_allowed } });
    }
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
