import { Request, Response } from 'express';
import { AccountService } from '../services/account.service';

const service = new AccountService();

export const accountController = {
  getAll: async (req: Request, res: Response) => {
    try {
      const { client_id, code_coa } = req.query;
      const accounts = await service.getAllAccounts({
        client_id: client_id as string,
        code_coa: code_coa as string,
      });
      res.json(accounts);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const account = await service.getAccountById(req.params.id);
      res.json(account);
    } catch (e: any) {
      res.status(404).json({ error: e.message });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const account = await service.createAccount(req.body);
      req.auditInfo = {
        action: 'CREATE_ACCOUNT',
        entity_name: 'accounts',
        entity_id: account.id,
        new_data: account,
      };
      res.status(201).json(account);
    } catch (e: any) {
      // COA validation error comes through here
      res.status(400).json({ error: e.message });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const account = await service.updateAccount(req.params.id, req.body);
      req.auditInfo = {
        action: 'UPDATE_ACCOUNT',
        entity_name: 'accounts',
        entity_id: req.params.id,
        new_data: account,
      };
      res.json(account);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  },

  remove: async (req: Request, res: Response) => {
    try {
      await service.deleteAccount(req.params.id);
      req.auditInfo = {
        action: 'DELETE_ACCOUNT',
        entity_name: 'accounts',
        entity_id: req.params.id,
      };
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  },
};
