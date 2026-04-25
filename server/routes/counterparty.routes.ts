import { Router, Request, Response } from 'express';
import { CounterpartyRepository } from '../repositories/counterparty.repository';
import { auditLogger } from '../middlewares/audit.middleware';
import { verifyToken } from '../middlewares/auth.middleware';
import { z } from 'zod';

const router = Router();
const repository = new CounterpartyRepository();

const counterpartySchema = z.object({
  inn: z.string().min(1, 'INN is required'),
  name: z.string().min(1, 'Name is required'),
  settlement_account: z.string().min(1, 'Settlement account is required'),
  type: z.enum(['TENANT', 'LESSOR']),
});

router.use(verifyToken);
router.use(auditLogger);

router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, search } = req.query;
    const items = await repository.findAll(type as string, search as string);
    res.json(items);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = counterpartySchema.parse(req.body);
    const item = await repository.create(parsed);
    req.auditInfo = {
      action: 'CREATE_COUNTERPARTY',
      entity_name: 'counterparties',
      entity_id: item.id,
      new_data: item
    };
    res.status(201).json(item);
  } catch (e: any) {
    const msg = e.errors ? e.errors.map((x: any) => x.message).join(', ') : e.message;
    res.status(400).json({ error: msg });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = counterpartySchema.partial().parse(req.body);
    const item = await repository.update(req.params.id, parsed);
    res.json(item);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await repository.delete(req.params.id);
    res.json({ success: true });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
