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

router.post('/', async (req: Request, res: Response) => {
  try {
    const { coa_code, description, account_type } = req.body;
    if (!coa_code || !description || !account_type) {
      res.status(400).json({ error: 'coa_code, description, and account_type are required' });
      return;
    }
    if (!/^\d{5}$/.test(coa_code)) {
      res.status(400).json({ error: 'COA code must be exactly 5 digits' });
      return;
    }
    if (!['INCOME', 'EXPENSE', 'TRANSIT'].includes(account_type)) {
      res.status(400).json({ error: 'account_type must be INCOME, EXPENSE, or TRANSIT' });
      return;
    }
    const entry = await repository.create({ coa_code, description, account_type });
    req.auditInfo = {
      action: 'CREATE_CBU_ENTRY',
      entity_name: 'cbu_registry',
      entity_id: entry.id,
      new_data: entry,
    };
    res.status(201).json(entry);
  } catch (e: any) {
    if (e.code === 'P2002') {
      res.status(400).json({ error: `COA code "${req.body.coa_code}" already exists in the registry` });
      return;
    }
    res.status(400).json({ error: e.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await repository.delete(req.params.id);
    req.auditInfo = {
      action: 'DELETE_CBU_ENTRY',
      entity_name: 'cbu_registry',
      entity_id: req.params.id,
    };
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
