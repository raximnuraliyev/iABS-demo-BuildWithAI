import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, CheckCircle, RotateCcw, FileText, Search, Download } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { cn } from '../lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchLeases, createLease, updateLease, deleteLease, approveLease, returnLease, type LeaseRecord } from '../lib/api';
import { ProtocolModal } from '../components/ProtocolModal';
import { useToast } from '../components/Toast';
import { exportToCSV, exportToPDF } from '../lib/export';

import { LeaseFormModal } from '../components/LeaseFormModal';

export default function OutboundLeases() {
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [isProtocolOpen, setIsProtocolOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isLeaseFormOpen, setIsLeaseFormOpen] = useState(false);

  const { data: leases = [], isLoading } = useQuery({
    queryKey: ['leases', 'OUTBOUND'],
    queryFn: () => fetchLeases('OUTBOUND'),
  });

  const createMutation = useMutation({
    mutationFn: createLease,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leases'] });
      setIsLeaseFormOpen(false);
      toast.success('Lease created');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLease,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leases'] });
      setSelectedRow(null);
      toast.success('Lease deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const approveMutation = useMutation({
    mutationFn: approveLease,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leases'] });
      setSelectedRow(null);
      toast.success('Lease approved');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const returnMutation = useMutation({
    mutationFn: returnLease,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leases'] });
      setSelectedRow(null);
      toast.success('Lease returned');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filteredData = leases.filter((lease) => {
    if (searchText) {
      const q = searchText.toLowerCase();
      const matchesTenant = lease.tenant?.name?.toLowerCase().includes(q);
      const matchesAsset = lease.asset_type?.toLowerCase().includes(q);
      const matchesInn = lease.tenant?.inn?.includes(q);
      if (!matchesTenant && !matchesAsset && !matchesInn) return false;
    }
    if (statusFilter && lease.status !== statusFilter) return false;
    return true;
  });

  const columns: ColumnDef<LeaseRecord>[] = [
    {
      id: 'select', header: '',
      cell: ({ row }) => (
        <input
          type="radio"
          checked={selectedRow === row.original.id}
          onChange={() => setSelectedRow(row.original.id)}
          className="w-4 h-4 accent-sqb-navy cursor-pointer"
        />
      )
    },
    {
      accessorKey: 'id', header: 'Lease ID',
      cell: ({ getValue }) => <span className="font-mono text-xs">{(getValue() as string).slice(0, 8)}...</span>
    },
    { accessorKey: 'asset_type', header: 'Asset' },
    {
      accessorKey: 'status', header: 'Status',
      cell: ({ getValue }) => {
        const val = getValue() as string;
        return (
          <span className={cn(
            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
            val === 'APPROVED' && "bg-green-100 text-green-800",
            val === 'INTRODUCED' && "bg-gray-100 text-gray-600 border border-gray-100",
            val === 'RETURNED' && "bg-blue-100 text-blue-800"
          )}>
            {val}
          </span>
        );
      }
    },
    { id: 'tenant', header: 'Tenant', accessorFn: (row) => row.tenant?.name ?? '—' },
    { id: 'inn', header: 'INN', accessorFn: (row) => row.tenant?.inn ?? '—' },
    {
      accessorKey: 'amount', header: 'Amount',
      cell: ({ getValue }) => <span className="font-bold">{Number(getValue()).toLocaleString('en-US')} UZS</span>
    },
    {
      accessorKey: 'start_date', header: 'Start Date',
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString('en-GB'),
    },
    {
      accessorKey: 'end_date', header: 'End Date',
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString('en-GB'),
    },
  ];

  const selectedLease = leases.find(d => d.id === selectedRow);

  const handleDelete = () => {
    if (!selectedRow) return;
    if (confirm('Are you sure you want to delete this lease?')) deleteMutation.mutate(selectedRow);
  };

  const exportCols = [
    { header: 'Asset', accessor: 'asset_type' },
    { header: 'Status', accessor: 'status' },
    { header: 'Tenant', accessor: 'tenant.name' },
    { header: 'INN', accessor: 'tenant.inn' },
    { header: 'Amount', accessor: 'amount' },
    { header: 'Start Date', accessor: 'start_date' },
    { header: 'End Date', accessor: 'end_date' },
  ];

  return (
    <div id="outbound-page" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sqb-navy">{t('sidebar.outbound')}</h1>
          <p className="text-sm text-sqb-grey-secondary">Management of bank-owned assets for external rent (Сдача в аренду).</p>
        </div>

        <div id="action-bar" className="flex flex-wrap gap-2">
          <button className="sqb-btn-primary flex items-center gap-2" onClick={() => setIsLeaseFormOpen(true)}>
            <Plus size={16} /> {t('actions.add')}
          </button>
          <button className="sqb-btn-danger flex items-center gap-2" disabled={selectedLease?.status !== 'INTRODUCED'} onClick={handleDelete}>
            <Trash2 size={16} /> {t('actions.delete')}
          </button>
          <div className="w-px h-8 bg-gray-200 mx-1" />
          <button className="sqb-btn-primary flex items-center gap-2" disabled={selectedLease?.status !== 'INTRODUCED'} onClick={() => selectedRow && approveMutation.mutate(selectedRow)}>
            <CheckCircle size={16} /> {t('actions.approve')}
          </button>
          <button className="sqb-btn-secondary flex items-center gap-2" disabled={selectedLease?.status !== 'APPROVED'} onClick={() => selectedRow && returnMutation.mutate(selectedRow)}>
            <RotateCcw size={16} /> {t('actions.return')}
          </button>
          <button className="sqb-btn-secondary flex items-center gap-2 text-gray-600" disabled={!selectedRow} onClick={() => setIsProtocolOpen(true)}>
            <FileText size={16} /> {t('actions.protocol')}
          </button>

          <div className="relative">
            <button className="sqb-btn-secondary flex items-center gap-2" onClick={() => setShowExportMenu(!showExportMenu)}>
              <Download size={16} /> Export
            </button>
            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl z-40 w-36 overflow-hidden">
                  <button onClick={() => { exportToCSV(filteredData, exportCols, 'outbound_leases'); setShowExportMenu(false); toast.success('CSV downloaded'); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-sqb-bg transition-colors font-medium">📄 CSV</button>
                  <button onClick={() => { exportToPDF(filteredData, exportCols, 'outbound_leases', 'Outbound Leases'); setShowExportMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-sqb-bg transition-colors font-medium">📋 PDF</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div id="table-controls" className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sqb-grey-secondary" />
          <input type="text" placeholder="Search by INN, Tenant, or Asset..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full bg-sqb-bg border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-sqb-navy/20 outline-none transition-all" />
        </div>
        <select className="bg-sqb-bg border-none rounded-lg px-3 py-2 text-xs font-bold text-sqb-navy outline-none" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="INTRODUCED">Introduced</option>
          <option value="APPROVED">Approved</option>
          <option value="RETURNED">Returned</option>
        </select>
      </div>

      <DataTable data={filteredData} columns={columns} isLoading={isLoading} />

      <LeaseFormModal 
        isOpen={isLeaseFormOpen} 
        onClose={() => setIsLeaseFormOpen(false)} 
        onSubmit={(data) => createMutation.mutate(data)} 
        direction="OUTBOUND" 
      />
      <ProtocolModal isOpen={isProtocolOpen} onClose={() => setIsProtocolOpen(false)} entityId={selectedRow || ''} entityName={selectedLease?.asset_type} />
    </div>
  );
}
