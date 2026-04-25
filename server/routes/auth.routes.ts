import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const router = Router();
const service = new AuthService();

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { tabel_id, password } = req.body;
    if (!tabel_id || !password) {
      res.status(400).json({ error: 'Tabel ID and password are required' });
      return;
    }

    const result = await service.login(tabel_id, password);
    if (!result) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
