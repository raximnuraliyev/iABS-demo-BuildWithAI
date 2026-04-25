import { Router, Request, Response } from 'express';
import prisma from '../prismaClient';
import { verifyToken } from '../middlewares/auth.middleware';
import bcrypt from 'bcryptjs';

const router = Router();
router.use(verifyToken);

// Get current logged-in user profile
router.get('/me', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { tabel_id: req.user!.tabel_id },
      include: { role: { include: { permissions: true } } },
    });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    const { password_hash, ...safe } = user;
    res.json(safe);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// List all users
router.get('/', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: { role: { include: { permissions: true } } },
      orderBy: { full_name: 'asc' },
    });
    // Strip password_hash from response
    const safe = users.map(({ password_hash, ...rest }) => rest);
    res.json(safe);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Create user (head admin only)
router.post('/', async (req: Request, res: Response) => {
  try {
    // Check if requester is head admin
    const requester = await prisma.user.findUnique({ where: { tabel_id: req.user!.tabel_id } });
    if (!requester?.is_head_admin) {
      res.status(403).json({ error: 'Only the head administrator can create users' });
      return;
    }

    const { tabel_id, full_name, password, permissions = [] } = req.body;
    if (!tabel_id || !full_name || !password) {
      res.status(400).json({ error: 'tabel_id, full_name, and password are required' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);
    
    // Create a custom role for this specific user to support button-level permissions
    const customRoleName = `CustomRole_${tabel_id}_${Date.now()}`;
    const allActions = [
      'can_add_lease', 
      'can_approve_lease', 
      'can_execute_payment', 
      'can_view_audit', 
      'can_manage_users'
    ];
    
    const role = await prisma.role.create({
      data: {
        name: customRoleName,
        permissions: {
          create: allActions.map(action => ({
            action_name: action,
            is_allowed: permissions.includes(action)
          }))
        }
      }
    });

    const user = await prisma.user.create({
      data: { tabel_id, full_name, role_id: role.id, password_hash },
      include: { role: true },
    });

    const { password_hash: _, ...safe } = user;
    res.status(201).json(safe);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Update user
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { full_name, role_id, password } = req.body;
    const data: any = {};
    if (full_name) data.full_name = full_name;
    if (role_id) data.role_id = role_id;
    if (password) data.password_hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { tabel_id: req.params.id },
      data,
      include: { role: true },
    });
    const { password_hash, ...safe } = user;
    res.json(safe);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Delete user
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const target = await prisma.user.findUnique({ where: { tabel_id: req.params.id } });
    if (target?.is_head_admin) {
      res.status(403).json({ error: 'Cannot delete the head administrator' });
      return;
    }
    await prisma.user.delete({ where: { tabel_id: req.params.id } });
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
