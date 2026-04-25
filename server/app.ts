import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { auditLogger } from './middlewares/audit.middleware';

// Routes
import authRoutes from './routes/auth.routes';
import leaseRoutes from './routes/lease.routes';
import clientRoutes from './routes/client.routes';
import accountRoutes from './routes/account.routes';
import cbuRegistryRoutes from './routes/cbu-registry.routes';
import adminRoutes from './routes/admin.routes';
import dashboardRoutes from './routes/dashboard.routes';
import assetRoutes from './routes/asset.routes';
import auditRoutes from './routes/audit.routes';
import userRoutes from './routes/user.routes';
import roleRoutes from './routes/role.routes';
import aiRoutes from './routes/ai.routes';

const app = express();

// ── Strict CORS ──
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}));

// ── Body Parsing & Cookies ──
app.use(express.json());
app.use(cookieParser());

// ── Global Audit Interceptor ──
app.use(auditLogger);

// ── API Routes ──
const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/clients', clientRoutes);
apiRouter.use('/accounts', accountRoutes);
apiRouter.use('/cbu-registry', cbuRegistryRoutes);
apiRouter.use('/leases', leaseRoutes);
apiRouter.use('/settings', adminRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/assets', assetRoutes);
apiRouter.use('/audit-logs', auditRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/roles', roleRoutes);
apiRouter.use('/ai', aiRoutes);

app.use('/api/v1', apiRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
