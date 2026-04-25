import { useTranslation } from 'react-i18next';
import { History, X, CheckCircle2, UserCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { fetchAuditLogs } from '../lib/api';

interface ProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  entityName?: string;
}

export function ProtocolModal({ isOpen, onClose, entityId, entityName }: ProtocolModalProps) {
  const { t } = useTranslation();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['audit-logs', entityId],
    queryFn: () => fetchAuditLogs(entityId),
    enabled: isOpen && !!entityId,
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-sqb-navy/20 backdrop-blur-[2px]" />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white w-full max-w-lg rounded-2xl shadow-xl relative z-10 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-sqb-navy flex items-center gap-2 italic">
                <History className="w-5 h-5" /> Audit History{entityName ? `: ${entityName}` : ''}
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-sqb-navy transition-colors"><X size={20} /></button>
            </div>
            
            <div className="p-8 max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
                  <div className="w-4 h-4 border-2 border-sqb-navy/30 border-t-sqb-navy rounded-full animate-spin" />
                  Loading audit trail...
                </div>
              ) : logs.length === 0 ? (
                <p className="text-center text-gray-400 py-8 text-sm">No audit entries found for this record.</p>
              ) : (
                <div className="space-y-8 relative">
                  <div className="absolute left-4 top-4 bottom-4 w-[1px] bg-gray-100" />
                  {logs.map((log, idx) => (
                    <div key={log.id || idx} className="relative pl-12">
                      <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm z-10">
                        <CheckCircle2 className="w-4 h-4 text-sqb-navy" />
                      </div>
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-xs font-bold text-sqb-navy">{log.action.replace(/_/g, ' ')}</p>
                        <span className="text-[10px] text-sqb-grey-secondary font-medium tracking-tight uppercase flex items-center gap-1">
                          <Clock size={10} /> {formatDate(log.created_at)} @ {formatTime(log.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-medium text-sqb-grey-secondary uppercase">
                        <UserCircle size={12} /> {log.tabel_id || 'System'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 bg-sqb-bg flex justify-end">
               <button onClick={onClose} className="sqb-btn-primary px-8">Close Protocol</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
