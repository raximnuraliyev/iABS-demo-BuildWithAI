import { Router, Request, Response } from 'express';
import prisma from '../prismaClient';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();
router.use(verifyToken);

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [outboundActive, pendingApproval, inboundPayments, recentAudit, monthlyData] = await Promise.all([
      prisma.lease.count({ where: { lease_direction: 'OUTBOUND', status: { not: 'RETURNED' } } }),
      prisma.lease.count({ where: { status: 'INTRODUCED' } }),
      prisma.lease.aggregate({ where: { lease_direction: 'INBOUND', status: 'APPROVED' }, _sum: { contract_amount: true } }),
      prisma.auditLog.findMany({ orderBy: { created_at: 'desc' }, take: 10 }),
      prisma.lease.findMany({ select: { start_date: true, contract_amount: true, lease_direction: true } }),
    ]);

    const monthlyChart = Array.from({ length: 12 }, (_, i) => ({ month: i, outbound: 0, inbound: 0 }));
    for (const lease of monthlyData) {
      const month = new Date(lease.start_date).getMonth();
      const amount = Number(lease.contract_amount);
      if (lease.lease_direction === 'OUTBOUND') monthlyChart[month].outbound += amount;
      else monthlyChart[month].inbound += amount;
    }

    const quarterlyChart = [0, 1, 2, 3].map((q) => ({
      quarter: q,
      outbound: monthlyChart.slice(q * 3, q * 3 + 3).reduce((s, m) => s + m.outbound, 0),
      inbound: monthlyChart.slice(q * 3, q * 3 + 3).reduce((s, m) => s + m.inbound, 0),
    }));

    res.json({
      activeOutbound: outboundActive,
      pendingApproval,
      pendingInboundTotal: Number(inboundPayments._sum.contract_amount || 0),
      recentActivity: recentAudit,
      monthlyChart,
      quarterlyChart,
    });
  } catch (e: any) {
    console.error('Dashboard stats error:', e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
