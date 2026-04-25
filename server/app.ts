import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import leaseRoutes from './routes/lease.routes';
import counterpartyRoutes from './routes/counterparty.routes';
import adminRoutes from './routes/admin.routes';
import dashboardRoutes from './routes/dashboard.routes';
import assetRoutes from './routes/asset.routes';
import auditRoutes from './routes/audit.routes';
import userRoutes from './routes/user.routes';
import roleRoutes from './routes/role.routes';

const app = express();

app.use(cors());
app.use(express.json());

// Main API routes
const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/counterparties', counterpartyRoutes);
apiRouter.use('/leases', leaseRoutes);
apiRouter.use('/settings', adminRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/assets', assetRoutes);
apiRouter.use('/audit-logs', auditRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/roles', roleRoutes);

app.use('/api/v1', apiRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
