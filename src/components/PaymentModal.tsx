import { useTranslation } from 'react-i18next';
import { CreditCard, Calendar, Clock, Lock, ShieldCheck, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const paymentSchema = z.object({
  scheduleType: z.enum(['now', 'scheduled']),
  notes: z.string().optional(),
});

type PaymentForm = z.infer<typeof paymentSchema>;

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  lease: {
    id?: string;
    counterparty: string;
    account: string;
    amount: string;
    currency: string;
  } | null;
  onPay?: (type: 'IMMEDIATE' | 'NEXT_BUSINESS_DAY') => void;
}

export function PaymentModal({ isOpen, onClose, lease, onPay }: PaymentModalProps) {
  const { t } = useTranslation();
  const { register, handleSubmit, watch, setValue } = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { scheduleType: 'now' }
  });

  const scheduleType = watch('scheduleType');

  if (!lease) return null;

  const onSubmit = (data: PaymentForm) => {
    const paymentType = data.scheduleType === 'now' ? 'IMMEDIATE' : 'NEXT_BUSINESS_DAY';
    if (onPay) {
      onPay(paymentType as 'IMMEDIATE' | 'NEXT_BUSINESS_DAY');
    } else {
      alert(`Payment of ${lease.amount} ${lease.currency} to ${lease.counterparty} initiated via ${data.scheduleType === 'now' ? 'Instant 24/7' : 'Next Working Day'} channel.`);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="payment-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
              <button 
                onClick={onClose}
                className="absolute right-6 top-6 text-white/60 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/10 rounded-lg">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold">Inbound Lease Payment</h2>
              </div>
              <p className="text-white/60 text-sm">Internal Bank Transaction Authorization</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-sqb-bg rounded-xl border border-gray-100">
                  <div>
                    <p className="text-[10px] font-bold text-sqb-grey-secondary uppercase tracking-widest">Counterparty</p>
                    <p className="font-bold text-sqb-navy">{lease.counterparty}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-sqb-grey-secondary uppercase tracking-widest">Account (20-Digit)</p>
                    <p className="font-mono text-xs font-bold text-sqb-navy">{lease.account}</p>
                  </div>
                </div>

                <div className="flex items-center justify-center py-4">
                   <div className="text-center">
                      <p className="text-xs text-sqb-grey-secondary font-bold uppercase mb-1">Authorization Amount</p>
                      <p className="text-4xl font-bold text-sqb-navy tracking-tight">
                        {lease.amount} <span className="text-lg text-sqb-grey-secondary font-bold uppercase">{lease.currency}</span>
                      </p>
                   </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-sqb-navy">Payment Scheduling</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setValue('scheduleType', 'now')}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center",
                      scheduleType === 'now' 
                        ? "bg-sqb-navy/5 border-sqb-navy text-sqb-navy font-bold" 
                        : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                    )}
                  >
                    <Clock size={24} className={scheduleType === 'now' ? "text-sqb-navy" : "text-gray-300"} />
                    <span className="text-xs">Execute Now (24/7)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('scheduleType', 'scheduled')}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center",
                      scheduleType === 'scheduled' 
                        ? "bg-sqb-navy/5 border-sqb-navy text-sqb-navy font-bold" 
                        : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                    )}
                  >
                    <Calendar size={24} className={scheduleType === 'scheduled' ? "text-sqb-navy" : "text-gray-300"} />
                    <span className="text-xs">Next Working Day</span>
                  </button>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-xl flex gap-3 border border-amber-100">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-[10px] text-amber-800 leading-normal">
                  <strong>SECURITY CHECK:</strong> Authentication via Token Required for values exceeding 100,000,000 UZS. 
                  Ensure the correct 20-digit counterparty account is selected manually before signing.
                </p>
              </div>

              <button type="submit" className="w-full sqb-btn-primary py-4 text-lg shadow-lg shadow-sqb-navy/10 flex items-center justify-center gap-2">
                <Lock size={20} /> Authorize Payment
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
