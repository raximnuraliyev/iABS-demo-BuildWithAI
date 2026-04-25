import { Request, Response, NextFunction } from 'express';
import prisma from '../prismaClient';

/**
 * Global Audit Interceptor
 * Captures request user, method, URL, and body.
 * Writes asynchronously to AuditLog after response is sent.
 */
export const auditLogger = (req: Request, res: Response, next: NextFunction): void => {
  res.on('finish', async () => {
    // Only log state-changing requests
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return;

    // Skip CSRF token and auth endpoints
    if (req.path.includes('csrf-token') || req.path.includes('/auth/')) return;

    try {
      const auditData = req.auditInfo
        ? {
            tabel_id: req.user?.tabel_id || 'system',
            action: req.auditInfo.action,
            entity: req.auditInfo.entity_name,
            entity_id: req.auditInfo.entity_id || '00000000-0000-0000-0000-000000000000',
            payload: req.auditInfo.previous_data || req.auditInfo.new_data
              ? {
                  previous: req.auditInfo.previous_data ?? null,
                  current: req.auditInfo.new_data ?? null,
                }
              : undefined,
          }
        : {
            tabel_id: req.user?.tabel_id || 'system',
            action: `${req.method} ${req.path}`,
            entity: req.path.split('/').filter(Boolean)[0] || 'unknown',
            entity_id: '00000000-0000-0000-0000-000000000000',
            payload: {
              method: req.method,
              url: req.originalUrl,
              body: req.body && Object.keys(req.body).length > 0 ? req.body : undefined,
              status_code: res.statusCode,
            },
          };

      await prisma.auditLog.create({ data: auditData });
    } catch (error) {
      console.error('Audit Log Error:', error);
    }
  });

  next();
};
