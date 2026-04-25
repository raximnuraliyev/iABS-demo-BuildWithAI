import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { fetchAuditLogs, type AuditLogEntry } from '../lib/api';
import { History, Search, CheckCircle2, FileText, UserCircle, CreditCard, Shield, Trash2, Clock } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const actionIcons: Record<string, any> = {
  APPROVE_LEASE: CheckCircle2,
  CREATE_LEASE: FileText,
  UPDATE_LEASE: FileText,
  DELETE_LEASE: Trash2,
  CREATE_COUNTERPARTY: UserCircle,
  CREATE_CLIENT: UserCircle,
  UPDATE_ROLE_PERMISSION: Shield,
  EXECUTE_PAYMENT: CreditCard,
  LOGIN: UserCircle,
};

const actionColors: Record<string, string> = {
  APPROVE_LEASE: 'bg-green-100 text-green-700',
  CREATE_LEASE: 'bg-blue-100 text-blue-700',
  DELETE_LEASE: 'bg-red-100 text-red-700',
  CREATE_COUNTERPARTY: 'bg-purple-100 text-purple-700',
  CREATE_CLIENT: 'bg-purple-100 text-purple-700',
  UPDATE_ROLE_PERMISSION: 'bg-amber-100 text-amber-700',
  EXECUTE_PAYMENT: 'bg-emerald-100 text-emerald-700',
  LOGIN: 'bg-gray-100 text-gray-700',
};

export default function Activity() {
  const [searchText, setSearchText] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit-logs-all'],
    queryFn: () => fetchAuditLogs(undefined, 200),
    refetchInterval: 10000,
  });

  const filtered = logs.filter((log) => {
    if (actionFilter && log.action !== actionFilter) return false;
    if (searchText) {
      const q = searchText.toLowerCase();
      return log.tabel_id.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        (log.entity || '').toLowerCase().includes(q);
    }
    return true;
  });

  const uniqueActions = [...new Set(logs.map(l => l.action))];

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const formatTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div id="activity-page" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-sqb-navy flex items-center gap-2">
          <History className="w-6 h-6" /> Recent Activity
        </h1>
        <p className="text-sm text-sqb-grey-secondary">Complete audit trail of all system operations.</p>
      </div>

      <div className="sqb-card p-4 flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input
            placeholder="Search by user, action, or entity..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full bg-sqb-bg border-none rounded-lg py-2 pl-10 text-sm outline-none"
          />
        </div>
        <select
          className="bg-sqb-bg border-none rounded-lg px-3 py-2 text-xs font-bold text-sqb-navy outline-none"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
        >
          <option value="">All Actions</option>
          {uniqueActions.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
        </select>
        <span className="text-xs text-gray-400 font-medium">{filtered.length} entries</span>
      </div>

      <div className="sqb-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
            <div className="w-4 h-4 border-2 border-sqb-navy/30 border-t-sqb-navy rounded-full animate-spin" />
            Loading activity...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">No activity records found.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((log, idx) => {
              const Icon = actionIcons[log.action] || FileText;
              const colorClass = actionColors[log.action] || 'bg-gray-100 text-gray-700';
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0", colorClass)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-sqb-navy">{log.action.replace(/_/g, ' ')}</span>
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase font-bold">{log.entity}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      by <span className="font-bold text-sqb-grey-secondary">{log.tabel_id}</span>
                      {' • '}ID: <span className="font-mono">{log.entity_id?.slice(0, 8)}...</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-sqb-navy">{formatDate(log.timestamp)}</p>
                    <p className="text-[10px] text-gray-400 flex items-center justify-end gap-1">
                      <Clock size={10} /> {formatTime(log.timestamp)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
