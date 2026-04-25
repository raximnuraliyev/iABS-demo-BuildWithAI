import { useState } from 'react';
import { X, Bell, CheckCircle2, FileText, Shield, UserCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { fetchAuditLogs } from '../lib/api';
import { cn } from '../lib/utils';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const { data: logs = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetchAuditLogs(undefined, 20),
    enabled: isOpen,
    refetchInterval: 15000,
  });

  const [readIds, setReadIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('read_notifications');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const markAllRead = () => {
    const allIds = new Set(logs.map(l => l.id));
    setReadIds(allIds);
    localStorage.setItem('read_notifications', JSON.stringify([...allIds]));
  };

  const unreadCount = logs.filter(l => !readIds.has(l.id)).length;

  const formatTime = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/10"
          />
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className="absolute right-4 top-16 w-96 max-h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h3 className="font-bold text-sqb-navy flex items-center gap-2">
                  <Bell size={16} /> Notifications
                </h3>
                {unreadCount > 0 && (
                  <p className="text-[10px] text-gray-400">{unreadCount} unread</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[10px] text-sqb-navy font-bold hover:underline">
                    Mark all read
                  </button>
                )}
                <button onClick={onClose} className="text-gray-400 hover:text-sqb-navy">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">No notifications yet.</div>
              ) : (
                logs.map((log) => {
                  const isRead = readIds.has(log.id);
                  return (
                    <div
                      key={log.id}
                      className={cn(
                        "flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50/50 transition-colors",
                        !isRead && "bg-blue-50/30"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                        !isRead ? "bg-sqb-navy text-white" : "bg-gray-100 text-gray-400"
                      )}>
                        {log.action.includes('APPROVE') ? <CheckCircle2 size={14} /> :
                         log.action.includes('CREATE') ? <FileText size={14} /> :
                         <Shield size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-xs", !isRead ? "font-bold text-sqb-navy" : "font-medium text-gray-600")}>
                          {log.action.replace(/_/g, ' ')}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {log.tabel_id} • {log.entity_name}
                        </p>
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0 flex items-center gap-1">
                        <Clock size={10} />
                        {formatTime(log.created_at)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function useUnreadCount() {
  const { data: logs = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetchAuditLogs(undefined, 20),
    refetchInterval: 30000,
  });
  const saved = localStorage.getItem('read_notifications');
  const readIds = saved ? new Set(JSON.parse(saved)) : new Set();
  return logs.filter(l => !readIds.has(l.id)).length;
}
