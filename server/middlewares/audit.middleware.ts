import { Request, Response, NextFunction } from 'express';
import prisma from '../prismaClient';

export const auditLogger = (req: Request, res: Response, next: NextFunction): void => {
  res.on('finish', async () => {
    if (!req.auditInfo) return;

    try {
      await prisma.auditLog.create({
        data: {
          tabel_id: req.user?.tabel_id || 'system',
          action: req.auditInfo.action,
          entity_name: req.auditInfo.entity_name,
          entity_id: req.auditInfo.entity_id || '00000000-0000-0000-0000-000000000000',
          previous_data: req.auditInfo.previous_data ? JSON.stringify(req.auditInfo.previous_data) : null,
          new_data: req.auditInfo.new_data ? JSON.stringify(req.auditInfo.new_data) : null,
        },
      });
    } catch (error) {
      console.error('Audit Log Error:', error);
    }
  });

  next();
};
