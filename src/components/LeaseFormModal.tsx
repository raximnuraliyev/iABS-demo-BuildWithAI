import { useState, useEffect } from 'react';
import { X, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { fetchClients, type LeaseRecord, type ClientRecord } from '../lib/api';

interface LeaseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  direction: 'OUTBOUND' | 'INBOUND';
  editData?: LeaseRecord | null;
}

export function LeaseFormModal({ isOpen, onClose, onSubmit, direction, editData }: LeaseFormModalProps) {
  const [formData, setFormData] = useState({
    asset_type: '',
    measurement_unit: 'PIECES',
    client_id: '',
    amount: '',
    income_expense_account: '',
    transit_account: '',
    start_date: '',
    end_date: '',
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => fetchClients(),
    enabled: isOpen,
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        asset_type: editData.asset_type,
        measurement_unit: editData.measurement_unit,
        client_id: direction === 'OUTBOUND' ? editData.tenant_id : editData.lessor_id,
        amount: String(editData.amount),
        income_expense_account: editData.income_expense_account,
        transit_account: editData.transit_account,
        start_date: editData.start_date.slice(0, 10),
        end_date: editData.end_date.slice(0, 10),
      });
    } else {
      setFormData({ asset_type: '', measurement_unit: 'PIECES', client_id: '', amount: '', income_expense_account: '', transit_account: '', start_date: '', end_date: '' });
    }
  }, [editData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type: direction,
      asset_type: formData.asset_type,
      measurement_unit: formData.measurement_unit,
      tenant_id: direction === 'OUTBOUND' ? formData.client_id : undefined,
      lessor_id: direction === 'INBOUND' ? formData.client_id : undefined,
      amount: parseFloat(formData.amount),
      income_expense_account: formData.income_expense_account,
      transit_account: formData.transit_account,
      start_date: new Date(formData.start_date).toISOString(),
      end_date: new Date(formData.end_date).toISOString(),
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-sqb-navy/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative z-10"
          >
            <div className="bg-sqb-navy p-6 text-white relative">
              <button onClick={onClose} className="absolute right-6 top-6 text-white/60 hover:text-white transition-colors">
                <X size={20} />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/10 rounded-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold">{editData ? 'Edit' : 'New'} {direction === 'OUTBOUND' ? 'Outbound' : 'Inbound'} Lease</h2>
              </div>
              <p className="text-white/60 text-sm">Fill in all required fields below.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-sqb-navy uppercase tracking-widest">Asset Type</label>
                  <input
                    required
                    value={formData.asset_type}
                    onChange={(e) => setFormData({ ...formData, asset_type: e.target.value })}
                    className="w-full bg-sqb-bg border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-sqb-navy/20 text-sm"
                    placeholder="e.g. Server Rack HP-99"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-sqb-navy uppercase tracking-widest">Unit</label>
                  <select
                    value={formData.measurement_unit}
                    onChange={(e) => setFormData({ ...formData, measurement_unit: e.target.value })}
                    className="w-full bg-sqb-bg border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-sqb-navy/20 text-sm"
                  >
                    <option value="PIECES">Pieces</option>
                    <option value="SQ_METERS">m²</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-sqb-navy uppercase tracking-widest">
                  {direction === 'OUTBOUND' ? 'Tenant' : 'Lessor'}
                </label>
                <select
                  required
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className="w-full bg-sqb-bg border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-sqb-navy/20 text-sm"
                >
                  <option value="">Select client...</option>
                  {clients.map((c: ClientRecord) => (
                    <option key={c.id} value={c.id}>{c.name} (INN: {c.inn})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-sqb-navy uppercase tracking-widest">Contract Amount (UZS)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full bg-sqb-bg border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-sqb-navy/20 text-sm font-mono"
                  placeholder="0.00"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-sqb-navy uppercase tracking-widest">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full bg-sqb-bg border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-sqb-navy/20 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-sqb-navy uppercase tracking-widest">End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full bg-sqb-bg border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-sqb-navy/20 text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 sqb-btn-ghost">Cancel</button>
                <button type="submit" className="flex-1 sqb-btn-primary justify-center">
                  {editData ? 'Save Changes' : 'Create Lease'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
