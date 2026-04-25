import { doubleCsrf } from 'csrf-csrf';
import { Request, Response, NextFunction } from 'express';

const {
  generateCsrfToken,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || 'csrf-fallback-secret',
  getSessionIdentifier: (req: Request) => req.user?.tabel_id || 'anonymous',
  cookieName: '__csrf',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  },
  size: 64,
  getCsrfTokenFromRequest: (req: Request) =>
    req.headers['x-csrf-token'] as string,
});

export const csrfProtection = doubleCsrfProtection;

export const csrfTokenHandler = (req: Request, res: Response): void => {
  const token = generateCsrfToken(req, res);
  res.json({ csrfToken: token });
};
