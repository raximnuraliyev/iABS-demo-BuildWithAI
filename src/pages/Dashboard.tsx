import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, ArrowDownLeft, Clock, History, FileText, CheckCircle2, Sparkles, BarChart3, Building } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats } from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Dashboard() {
  const { t } = useTranslation();
  const [chartMode, setChartMode] = useState<'monthly' | 'quarterly'>('monthly');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 30000,
  });

  const formatAmount = (val: number): string => {
    if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}B`;
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
    return String(val);
  };

  const kpis = [
    {
      label: t('dashboard.stats.activeOutbound'),
      value: isLoading ? '...' : String(stats?.activeOutbound ?? 0),
      increment: 'Active leases',
      icon: ArrowUpRight,
      color: 'text-sqb-navy',
      subColor: 'text-green-600'
    },
    {
      label: t('dashboard.stats.pendingApproval'),
      value: isLoading ? '...' : String(stats?.pendingApproval ?? 0),
      increment: 'Requires action',
      icon: Clock,
      color: 'text-sqb-red',
      subColor: 'text-gray-400'
    },
    {
      label: t('dashboard.stats.pendingInbound'),
      value: isLoading ? '...' : formatAmount(stats?.pendingInboundTotal ?? 0),
      increment: 'Across all regions',
      icon: ArrowDownLeft,
      color: 'text-sqb-navy',
      subColor: 'text-gray-400'
    },
  ];

  const recentActivity = stats?.recentActivity ?? [];

  // Chart data for Recharts
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const quarterLabels = ['Q1', 'Q2', 'Q3', 'Q4'];

  const chartData = chartMode === 'monthly'
    ? (stats?.monthlyChart ?? []).map((m: any, i: number) => ({
        name: monthLabels[i],
        Outbound: m.outbound,
        Inbound: m.inbound,
      }))
    : (stats?.quarterlyChart ?? []).map((q: any, i: number) => ({
        name: quarterLabels[i],
        Outbound: q.outbound,
        Inbound: q.inbound,
      }));

  const formatActivityTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatActivityDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return 'Today';
    if (diff < 172800000) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const aiCards = [
    { to: '/ai-copilot', icon: Sparkles, title: 'AI Copilot', desc: 'Ask about CBU 3336 rules', gradient: 'from-sqb-navy to-[#002244]' },
    { to: '/analytics', icon: BarChart3, title: 'AI Analytics', desc: 'Natural language queries', gradient: 'from-sqb-red to-red-800' },
    { to: '/matchmaker', icon: Building, title: 'Matchmaker', desc: 'Property search with AI', gradient: 'from-slate-800 to-slate-900' },
  ];

  return (
    <div id="dashboard-page" className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-sqb-navy mb-1">{t('dashboard.title')}</h1>
        <p className="text-sqb-grey-secondary font-medium text-sm">Lease audit and liquidity performance dashboard.</p>
      </div>

      <div id="kpi-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm transition-shadow hover:shadow-md cursor-default"
          >
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{kpi.label}</p>
            <h3 className="text-3xl font-bold text-sqb-navy tracking-tight">{kpi.value}</h3>
            <p className={cn("text-xs font-medium mt-2", kpi.subColor)}>{kpi.increment}</p>
          </motion.div>
        ))}
      </div>

      {/* AI Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {aiCards.map((card, idx) => (
          <motion.div
            key={card.to}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + idx * 0.1 }}
          >
            <Link
              to={card.to}
              className={`block p-5 rounded-2xl bg-gradient-to-br ${card.gradient} text-white hover:shadow-lg transition-all group`}
            >
              <div className="flex items-center gap-3 mb-2">
                <card.icon className="w-6 h-6" />
                <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded font-bold">AI</span>
              </div>
              <h3 className="font-bold text-lg">{card.title}</h3>
              <p className="text-white/70 text-xs mt-1">{card.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      <div id="bottom-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div id="activity-feed" className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
             <h2 className="text-lg font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-sqb-navy" />
              {t('dashboard.recentActivity')}
            </h2>
            <Link to="/activity" className="text-xs font-bold text-sqb-navy hover:underline">View All →</Link>
          </div>

          <div className="space-y-0.5 max-h-[320px] overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-6 text-gray-400 text-sm">Loading activity...</div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">No recent activity.</div>
            ) : (
              recentActivity.slice(0, 4).map((activity: any, idx: number) => (
                <motion.div
                  key={activity.id || idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (idx * 0.05) + 0.3 }}
                  className="group relative flex gap-3 p-3 rounded-xl hover:bg-white transition-all border border-transparent hover:border-gray-100 hover:shadow-sm"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-sqb-bg flex items-center justify-center border-2 border-white ring-1 ring-gray-100 mb-1 z-10 group-hover:bg-sqb-navy group-hover:text-white transition-colors">
                      {activity.action?.includes('APPROVE') ? <CheckCircle2 className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                    </div>
                    {idx !== Math.min(recentActivity.length, 4) - 1 && <div className="w-[1px] h-full bg-gray-200" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex justify-between items-start mb-0.5">
                      <p className="text-sm font-bold text-sqb-navy">{activity.tabel_id || 'System'}</p>
                      <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded uppercase">{formatActivityTime(activity.timestamp)}</span>
                    </div>
                    <p className="text-xs text-sqb-grey-secondary">
                      {activity.action?.replace(/_/g, ' ')} <span className="font-bold text-sqb-navy">{activity.entity}</span>
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1 font-medium">{formatActivityDate(activity.timestamp)}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div id="liquidity-chart" className="lg:col-span-2 sqb-card p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Asset Liquidity Forecast</h2>
            <div className="flex gap-2">
               <button
                 onClick={() => setChartMode('monthly')}
                 className={cn(
                   "text-xs px-3 py-1 rounded-full font-bold transition-all",
                   chartMode === 'monthly' ? "bg-sqb-navy text-white" : "text-gray-400 hover:bg-gray-100"
                 )}
               >
                 Monthly
               </button>
               <button
                 onClick={() => setChartMode('quarterly')}
                 className={cn(
                   "text-xs px-3 py-1 rounded-full font-bold transition-all",
                   chartMode === 'quarterly' ? "bg-sqb-navy text-white" : "text-gray-400 hover:bg-gray-100"
                 )}
               >
                 Quarterly
               </button>
            </div>
          </div>

          <div className="flex-1 min-h-[280px]">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(v) => formatAmount(v)} />
                <Tooltip formatter={(value: number) => [`${formatAmount(value)} UZS`, '']} />
                <Legend />
                <Bar dataKey="Outbound" fill="#1a2e4a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Inbound" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
