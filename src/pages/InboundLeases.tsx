import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, Search, Plus, Clock, Download } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { cn } from '../lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchLeases, payLease, createLease, type LeaseRecord } from '../lib/api';
import { PaymentModal } from '../components/PaymentModal';
import { LeaseFormModal } from '../components/LeaseFormModal';
import { useToast } from '../components/Toast';
import { exportToCSV, exportToPDF } from '../lib/export';

export default function InboundLeases() {
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const { data: leases = [], isLoading } = useQuery({
    queryKey: ['leases', 'INBOUND'],
    queryFn: () => fetchLeases('INBOUND'),
  });

  const payMutation = useMutation({
    mutationFn: ({ id, type }: { id: string; type: 'IMMEDIATE' | 'NEXT_BUSINESS_DAY' }) => payLease(id, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leases'] });
      setIsPaymentOpen(false);
      toast.success('Payment processed');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => createLease(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leases'] });
      setIsFormOpen(false);
      toast.success('Contract created successfully');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filteredData = leases.filter((lease) => {
    if (searchText) {
      const q = searchText.toLowerCase();
      return lease.counterparty?.name?.toLowerCase().includes(q) ||
        lease.asset?.name?.toLowerCase().includes(q) ||
        lease.counterparty?.inn?.toLowerCase().includes(q);
    }
    return true;
  });

  const approvedLeases = leases.filter(l => l.status === 'APPROVED');
  const totalPending = approvedLeases.reduce((s, l) => s + Number(l.contract_amount), 0);

  const formatAmount = (val: number): string => {
    if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}B`;
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
    return String(val);
  };

  const columns: ColumnDef<LeaseRecord>[] = [
    {
      id: 'select', header: '',
      cell: ({ row }) => (
        <input type="radio" checked={selectedRow === row.original.id} onChange={() => setSelectedRow(row.original.id)} className="w-4 h-4 accent-sqb-navy cursor-pointer" />
      )
    },
    { accessorKey: 'id', header: 'Lease ID', cell: ({ getValue }) => <span className="font-mono text-xs">{(getValue() as string).slice(0, 8)}...</span> },
    { id: 'lessor', header: 'Lessor Name', accessorFn: (row) => row.counterparty?.name ?? '—' },
    { id: 'account', header: 'Settlement Account', accessorFn: (row) => row.counterparty?.settlement_account ?? '—', cell: ({ getValue }) => <span className="font-mono text-xs">{getValue() as string}</span> },
    { accessorKey: 'contract_amount', header: 'Amount Due', cell: ({ getValue }) => <span className="font-bold">{Number(getValue()).toLocaleString('en-US')} UZS</span> },
    {
      accessorKey: 'status', header: 'Status',
      cell: ({ getValue }) => {
        const val = getValue() as string;
        return <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
          val === 'APPROVED' && "bg-amber-100 text-amber-800",
          val === 'RETURNED' && "bg-green-100 text-green-800",
          val === 'INTRODUCED' && "bg-gray-100 text-gray-600"
        )}>{val}</span>;
      }
    },
    { accessorKey: 'end_date', header: 'Due Date', cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString('en-GB') },
  ];

  const selectedLease = leases.find(d => d.id === selectedRow);

  const upcomingPayments = [...approvedLeases].sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime()).slice(0, 3);

  const exportCols = [
    { header: 'Lessor', accessor: 'counterparty.name' },
    { header: 'Account', accessor: 'counterparty.settlement_account' },
    { header: 'Amount', accessor: 'contract_amount' },
    { header: 'Status', accessor: 'status' },
    { header: 'Due Date', accessor: 'end_date' },
  ];

  return (
    <div id="inbound-page" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sqb-navy">{t('sidebar.inbound')}</h1>
          <p className="text-sm text-sqb-grey-secondary">Managing assets rented by the bank from third parties.</p>
        </div>
        <div className="flex gap-2">
          <button className="sqb-btn-primary flex items-center gap-2 bg-amber-600 border-amber-600 hover:bg-amber-700" onClick={() => setIsPaymentOpen(true)} disabled={selectedLease?.status !== 'APPROVED'}>
            <CreditCard size={18} /> {t('actions.pay')}
          </button>
          <button className="sqb-btn-primary flex items-center gap-2" onClick={() => setIsFormOpen(true)}>
            <Plus size={18} /> New Contract
          </button>
          <div className="relative">
            <button className="sqb-btn-secondary flex items-center gap-2" onClick={() => setShowExportMenu(!showExportMenu)}>
              <Download size={16} /> Export
            </button>
            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl z-40 w-36 overflow-hidden">
                  <button onClick={() => { exportToCSV(filteredData, exportCols, 'inbound_leases'); setShowExportMenu(false); toast.success('CSV downloaded'); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-sqb-bg transition-colors font-medium">📄 CSV</button>
                  <button onClick={() => { exportToPDF(filteredData, exportCols, 'inbound_leases', 'Inbound Leases'); setShowExportMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-sqb-bg transition-colors font-medium">📋 PDF</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input placeholder="Search inbound contracts..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full bg-sqb-bg border-none rounded-lg py-2 pl-10 text-sm outline-none" />
            </div>
          </div>
          <DataTable data={filteredData} columns={columns} isLoading={isLoading} />
        </div>

        <div className="md:col-span-1 space-y-4">
          <div className="sqb-card p-6 bg-sqb-navy text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-4">Pending Payments</p>
            <p className="text-xs mb-1">Total Approved Inbound</p>
            <p className="text-xl font-bold mb-6 tracking-tight">UZS {formatAmount(totalPending)}</p>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div className="bg-green-400 h-full" style={{ width: `${Math.min((approvedLeases.length / Math.max(leases.length, 1)) * 100, 100)}%` }} />
            </div>
            <p className="text-[10px] text-white/50 mt-2 italic">{approvedLeases.length} of {leases.length} awaiting payment</p>
          </div>

          <div className="sqb-card p-6">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-sqb-navy" /> Upcoming Payments</h3>
            <div className="space-y-4">
              {upcomingPayments.length === 0 ? <p className="text-xs text-gray-400">No pending payments.</p> : (
                upcomingPayments.map((lease) => (
                  <div key={lease.id} className="flex justify-between items-center text-xs">
                    <span className="text-sqb-grey-secondary font-medium">{new Date(lease.end_date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}</span>
                    <span className="font-bold text-sqb-navy">{formatAmount(Number(lease.contract_amount))} UZS</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        lease={selectedLease ? { id: selectedLease.id, counterparty: selectedLease.counterparty?.name ?? '', account: selectedLease.counterparty?.settlement_account ?? '', amount: Number(selectedLease.contract_amount).toLocaleString('en-US'), currency: 'UZS' } : null}
        onPay={(type) => { if (selectedRow) payMutation.mutate({ id: selectedRow, type }); }}
      />

      <LeaseFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSubmit={(data) => createMutation.mutate(data)} direction="INBOUND" />
    </div>
  );
}
