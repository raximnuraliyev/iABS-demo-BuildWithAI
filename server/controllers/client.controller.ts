import { Request, Response } from 'express';
import { ClientService } from '../services/client.service';

const service = new ClientService();

export const clientController = {
  getAll: async (req: Request, res: Response) => {
    try {
      const { subject, search, code_filial, condition } = req.query;
      const clients = await service.getAllClients({
        subject: subject as string,
        search: search as string,
        code_filial: code_filial as string,
        condition: condition as string,
      });
      res.json(clients);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const client = await service.getClientById(req.params.id);
      res.json(client);
    } catch (e: any) {
      res.status(404).json({ error: e.message });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const client = await service.createClient(req.body);
      req.auditInfo = {
        action: 'CREATE_CLIENT',
        entity_name: 'clients',
        entity_id: client.id,
        new_data: client,
      };
      res.status(201).json(client);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const client = await service.updateClient(req.params.id, req.body);
      req.auditInfo = {
        action: 'UPDATE_CLIENT',
        entity_name: 'clients',
        entity_id: req.params.id,
        new_data: client,
      };
      res.json(client);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  },

  remove: async (req: Request, res: Response) => {
    try {
      await service.deleteClient(req.params.id);
      req.auditInfo = {
        action: 'DELETE_CLIENT',
        entity_name: 'clients',
        entity_id: req.params.id,
      };
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  },
};
