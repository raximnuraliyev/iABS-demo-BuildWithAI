import { Request, Response } from 'express';
import { LeaseService } from '../services/lease.service';

const service = new LeaseService();

export const leaseController = {
  getAll: async (req: Request, res: Response) => {
    try {
      const { type, status } = req.query;
      const leases = await service.getAllLeases(type as string, status as string);
      res.json(leases);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const lease = await service.getLeaseById(req.params.id);
      res.json(lease);
    } catch (e: any) {
      res.status(404).json({ error: e.message });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const lease = await service.createLease(req.body);
      req.auditInfo = {
        action: 'CREATE_LEASE',
        entity_name: 'leases',
        entity_id: lease.id,
        new_data: lease,
      };
      res.status(201).json(lease);
    } catch (e: any) {
      console.error('Create lease error:', e);
      res.status(400).json({ error: e.message });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const lease = await service.updateLease(req.params.id, req.body);
      req.auditInfo = {
        action: 'UPDATE_LEASE',
        entity_name: 'leases',
        entity_id: req.params.id,
        new_data: lease,
      };
      res.json(lease);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  },

  remove: async (req: Request, res: Response) => {
    try {
      await service.deleteLease(req.params.id);
      req.auditInfo = {
        action: 'DELETE_LEASE',
        entity_name: 'leases',
        entity_id: req.params.id,
      };
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  },

  approve: async (req: Request, res: Response) => {
    try {
      const result = await service.approveLease(req.params.id);
      req.auditInfo = {
        action: 'APPROVE_LEASE',
        entity_name: 'leases',
        entity_id: req.params.id,
        new_data: { status: 'APPROVED' },
      };
      res.json(result);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  },

  returnLease: async (req: Request, res: Response) => {
    try {
      const result = await service.returnLease(req.params.id);
      req.auditInfo = {
        action: 'RETURN_LEASE',
        entity_name: 'leases',
        entity_id: req.params.id,
        new_data: { status: 'RETURNED' },
      };
      res.json(result);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  },

  pay: async (req: Request, res: Response) => {
    try {
      const result = await service.payLease(req.params.id, req.body.mode);
      req.auditInfo = {
        action: 'EXECUTE_PAYMENT',
        entity_name: 'leases',
        entity_id: req.params.id,
        new_data: result,
      };
      res.json(result);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  },
};
