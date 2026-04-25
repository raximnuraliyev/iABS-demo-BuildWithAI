import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, ArrowDownLeft, Clock, History, FileText, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats } from '../lib/api';

export default function Dashboard() {
  const { t } = useTranslation();
  const [chartMode, setChartMode] = useState<'monthly' | 'quarterly'>('monthly');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 30000, // auto-refresh every 30s
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

  // Chart data
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const quarterLabels = ['Q1', 'Q2', 'Q3', 'Q4'];

  const chartData = chartMode === 'monthly' 
    ? (stats?.monthlyChart ?? []).map((m) => m.outbound + m.inbound)
    : (stats?.quarterlyChart ?? []).map((q) => q.outbound + q.inbound);

  const maxChart = Math.max(...chartData, 1);
  const chartLabels = chartMode === 'monthly' ? monthLabels : quarterLabels;

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

      <div id="bottom-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div id="activity-feed" className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between">
             <h2 className="text-lg font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-sqb-navy" />
              {t('dashboard.recentActivity')}
            </h2>
            <Link to="/activity" className="text-xs font-bold text-sqb-navy hover:underline">View All →</Link>
          </div>
          
          <div className="space-y-1">
            {isLoading ? (
              <div className="text-center py-8 text-gray-400 text-sm">Loading activity...</div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">No recent activity.</div>
            ) : (
              recentActivity.slice(0, 5).map((activity, idx) => (
                <motion.div 
                  key={activity.id || idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (idx * 0.05) + 0.3 }}
                  className="group relative flex gap-4 p-4 rounded-xl hover:bg-white transition-all border border-transparent hover:border-gray-100 hover:shadow-sm"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-sqb-bg flex items-center justify-center border-2 border-white ring-1 ring-gray-100 mb-1 z-10 group-hover:bg-sqb-navy group-hover:text-white transition-colors">
                      {activity.action.includes('APPROVE') ? <CheckCircle2 className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    </div>
                    {idx !== Math.min(recentActivity.length, 5) - 1 && <div className="w-[1px] h-full bg-gray-200" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-bold text-sqb-navy">{activity.tabel_id || 'System'}</p>
                      <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded uppercase">{formatActivityTime(activity.created_at)}</span>
                    </div>
                    <p className="text-xs text-sqb-grey-secondary">
                      {activity.action.replace(/_/g, ' ')} <span className="font-bold text-sqb-navy">{activity.entity_name}</span>
                    </p>
                    <p className="text-[10px] text-gray-400 mt-2 font-medium">{formatActivityDate(activity.created_at)}</p>
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
          
          <div className="flex-1 flex items-end justify-between gap-2 min-h-[240px]">
            {chartData.map((val, i) => {
              const height = maxChart > 0 ? Math.max((val / maxChart) * 100, 3) : 3;
              return (
                <motion.div 
                  key={`${chartMode}-${i}`}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: 0.3 + (i * 0.05), duration: 0.8 }}
                  className={cn(
                    "flex-1 rounded-t-md hover:opacity-80 transition-opacity cursor-pointer relative group",
                    i % 2 === 0 ? "bg-sqb-navy" : "bg-sqb-navy/40"
                  )}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-sqb-navy text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {formatAmount(val)}
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] font-bold text-sqb-grey-secondary uppercase tracking-widest pt-2 border-t border-gray-50">
            {chartLabels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
