import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, CreditCard, FileCheck, Search, UserPlus, BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchClients, createClient, fetchAccounts, createAccount, fetchCBURegistry, createCBUEntry, type ClientRecord, type AccountRecord, type CBURegistryEntry } from '../lib/api';
import { useToast } from '../components/Toast';

type Tab = 'clients' | 'accounts' | 'cbu_registry';

export default function Dictionaries() {
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('clients');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Client form
  const [clientForm, setClientForm] = useState({ code: '', name: '', subject: 'J' as 'P' | 'J', code_filial: '00450', inn: '', address: '', phone: '' });
  // Account form
  const [accountForm, setAccountForm] = useState({ client_id: '', code: '', code_filial: '00450', code_currency: '000' });
  // CBU Registry form
  const [cbuForm, setCbuForm] = useState({ coa_code: '', description: '', account_type: 'INCOME' as 'INCOME' | 'EXPENSE' | 'TRANSIT' });

  const tabs = [
    { id: 'clients' as Tab, label: t('dictionaries.clients', 'Clients'), icon: Users },
    { id: 'accounts' as Tab, label: t('dictionaries.accounts', 'Accounts'), icon: CreditCard },
    { id: 'cbu_registry' as Tab, label: t('dictionaries.cbuRegistry', 'CBU Registry'), icon: FileCheck },
  ];

  // ── Data Queries ──
  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ['clients', searchText],
    queryFn: () => fetchClients(undefined, searchText || undefined),
    enabled: activeTab === 'clients' || activeTab === 'accounts' || isDrawerOpen,
  });

  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => fetchAccounts(),
    enabled: activeTab === 'accounts',
  });

  const { data: cbuRegistry = [], isLoading: cbuLoading } = useQuery({
    queryKey: ['cbu-registry'],
    queryFn: () => fetchCBURegistry(),
    enabled: activeTab === 'cbu_registry',
  });

  // ── Mutations ──
  const createClientMutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsDrawerOpen(false);
      toast.success('Client created');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createAccountMutation = useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setIsDrawerOpen(false);
      toast.success('Account created');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createCBUMutation = useMutation({
    mutationFn: createCBUEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cbu-registry'] });
      setIsDrawerOpen(false);
      toast.success('CBU Registry entry created');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSave = () => {
    if (activeTab === 'clients') {
      createClientMutation.mutate(clientForm);
    } else if (activeTab === 'accounts') {
      createAccountMutation.mutate(accountForm);
    } else if (activeTab === 'cbu_registry') {
      createCBUMutation.mutate(cbuForm);
    }
  };

  const resetForms = () => {
    setClientForm({ code: '', name: '', subject: 'J', code_filial: '00450', inn: '', address: '', phone: '' });
    setAccountForm({ client_id: '', code: '', code_filial: '00450', code_currency: '000' });
    setCbuForm({ coa_code: '', description: '', account_type: 'INCOME' });
  };

  const filteredAccounts = accounts.filter((a: AccountRecord) => {
    if (!searchText) return true;
    return a.code.includes(searchText) || a.code_coa.includes(searchText) || a.client?.name?.toLowerCase().includes(searchText.toLowerCase());
  });

  const filteredCBU = cbuRegistry.filter((entry: CBURegistryEntry) => {
    if (!searchText) return true;
    return entry.coa_code.includes(searchText) || entry.description.toLowerCase().includes(searchText.toLowerCase());
  });

  const isLoading = activeTab === 'clients' ? clientsLoading : activeTab === 'accounts' ? accountsLoading : cbuLoading;
  const isMutating = createClientMutation.isPending || createAccountMutation.isPending || createCBUMutation.isPending;

  const accountTypeColors: Record<string, string> = {
    INCOME: 'bg-green-100 text-green-800',
    EXPENSE: 'bg-red-100 text-red-800',
    TRANSIT: 'bg-blue-100 text-blue-800',
  };

  return (
    <div id="dictionaries-page" className="h-[calc(100vh-140px)] flex gap-8">
      {/* Left Pane */}
      <div id="category-sidebar" className="w-72 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-sqb-navy mb-2">{t('sidebar.dictionaries')}</h1>
        <div className="sqb-card flex-1 overflow-hidden p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchText(''); }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-200 group text-left",
                activeTab === tab.id
                  ? "bg-sqb-navy text-white shadow-lg"
                  : "text-sqb-grey-secondary hover:bg-gray-50"
              )}
            >
              <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "text-white" : "text-sqb-navy")} />
              <span className="font-bold text-sm tracking-tight">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right Pane */}
      <div id="category-content" className="flex-1 flex flex-col gap-6">
        <div className="flex items-center justify-between">
           <div>
              <h2 className="text-xl font-bold text-sqb-navy capitalize">{tabs.find(t => t.id === activeTab)?.label} Management</h2>
              <p className="text-xs text-sqb-grey-secondary font-medium">Standardized reference data per CBU Resolution 3336.</p>
           </div>
           <button
             onClick={() => { resetForms(); setIsDrawerOpen(true); }}
             className="sqb-btn-primary flex items-center gap-2"
           >
             <UserPlus size={18} /> {t('actions.add')}
           </button>
        </div>

        <div className="sqb-card flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  placeholder="Filter dictionary data..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-10 text-sm outline-none shadow-sm"
                />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
                <div className="w-4 h-4 border-2 border-sqb-navy/30 border-t-sqb-navy rounded-full animate-spin" />
                Loading...
              </div>
            ) : activeTab === 'clients' ? (
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-[#fcfcfd] border-b border-gray-100 uppercase text-[10px] font-bold text-sqb-grey-secondary">
                  <tr>
                    <th className="px-6 py-3">Code</th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Subject</th>
                    <th className="px-6 py-3">INN</th>
                    <th className="px-6 py-3">Filial</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {clients.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No clients found.</td></tr>
                  ) : (
                    clients.map((item: ClientRecord) => (
                      <tr key={item.id} className="border-b border-gray-50 hover:bg-sqb-bg/20">
                        <td className="px-6 py-4 font-mono text-xs font-bold text-sqb-navy">{item.code}</td>
                        <td className="px-6 py-4 font-bold text-sqb-navy">{item.name}</td>
                        <td className="px-6 py-4">
                          <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                            item.subject === 'J' ? "bg-indigo-100 text-indigo-800" : "bg-amber-100 text-amber-800"
                          )}>
                            {item.subject === 'J' ? 'Juridical' : 'Physical'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">{item.inn}</td>
                        <td className="px-6 py-4 text-xs text-sqb-grey-secondary">{item.code_filial}</td>
                        <td className="px-6 py-4">
                          <span className={cn("text-[10px] font-bold flex items-center gap-1",
                            item.condition ? "text-green-600" : "text-gray-400"
                          )}>
                            <span className={cn("w-1.5 h-1.5 rounded-full", item.condition ? "bg-green-500" : "bg-gray-300")} />
                            {item.condition ? 'Active' : 'Passive'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : activeTab === 'accounts' ? (
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-[#fcfcfd] border-b border-gray-100 uppercase text-[10px] font-bold text-sqb-grey-secondary">
                  <tr>
                    <th className="px-6 py-3">Account Code (20-digit)</th>
                    <th className="px-6 py-3">COA</th>
                    <th className="px-6 py-3">Client</th>
                    <th className="px-6 py-3">Currency</th>
                    <th className="px-6 py-3">Filial</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredAccounts.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No accounts found.</td></tr>
                  ) : (
                    filteredAccounts.map((item: AccountRecord) => (
                      <tr key={item.id} className="border-b border-gray-50 hover:bg-sqb-bg/20">
                        <td className="px-6 py-4 font-mono text-xs font-bold text-sqb-navy">{item.code}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-sqb-bg text-sqb-navy">{item.code_coa}</span>
                        </td>
                        <td className="px-6 py-4 text-xs">{item.client?.name || '—'}</td>
                        <td className="px-6 py-4 text-xs text-sqb-grey-secondary">{item.code_currency === '000' ? 'UZS' : item.code_currency === '840' ? 'USD' : item.code_currency}</td>
                        <td className="px-6 py-4 text-xs text-sqb-grey-secondary">{item.code_filial}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-[#fcfcfd] border-b border-gray-100 uppercase text-[10px] font-bold text-sqb-grey-secondary">
                  <tr>
                    <th className="px-6 py-3">COA Code</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3">Account Type</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredCBU.length === 0 ? (
                    <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-400">No registry entries found.</td></tr>
                  ) : (
                    filteredCBU.map((item: CBURegistryEntry) => (
                      <tr key={item.id} className="border-b border-gray-50 hover:bg-sqb-bg/20">
                        <td className="px-6 py-4 font-mono text-sm font-bold text-sqb-navy">{item.coa_code}</td>
                        <td className="px-6 py-4 text-sm">{item.description}</td>
                        <td className="px-6 py-4">
                          <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase", accountTypeColors[item.account_type] || 'bg-gray-100 text-gray-600')}>
                            {item.account_type}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Slide Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div id="drawer-overlay" className="fixed inset-0 z-50 overflow-hidden">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDrawerOpen(false)} className="absolute inset-0 bg-sqb-navy/40 backdrop-blur-[2px]" />
             <motion.div
               initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col"
              >
                <div className="bg-sqb-navy p-6 text-white">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <UserPlus /> Add New {activeTab === 'clients' ? 'Client' : activeTab === 'accounts' ? 'Account' : 'CBU Entry'}
                  </h3>
                   <p className="text-white/60 text-xs mt-1 italic">CBU 3336 Compliant Data Entry</p>
                </div>

                <div className="flex-1 p-8 space-y-6 overflow-y-auto">
                  {activeTab === 'clients' ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-sqb-navy uppercase tracking-widest">Client Code</label>
                          <input
                            className="w-full bg-sqb-bg border-none rounded-xl p-3 font-mono outline-none focus:ring-2 focus:ring-sqb-navy/20"
                            placeholder="CL-009"
                            value={clientForm.code}
                            onChange={(e) => setClientForm({ ...clientForm, code: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-sqb-navy uppercase tracking-widest">Subject Type</label>
                          <select
                            className="w-full bg-sqb-bg border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-sqb-navy/20"
                            value={clientForm.subject}
                            onChange={(e) => setClientForm({ ...clientForm, subject: e.target.value as 'P' | 'J' })}
                          >
                            <option value="J">Juridical (Юридик шахс)</option>
                            <option value="P">Physical (Жисмоний шахс)</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-sqb-navy uppercase tracking-widest">Legal Name</label>
                        <input
                          className="w-full bg-sqb-bg border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-sqb-navy/20"
                          placeholder="e.g. UzAuto Motors JSC"
                          value={clientForm.name}
                          onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-sqb-navy uppercase tracking-widest">INN (9-Digits)</label>
                          <input
                            className="w-full bg-sqb-bg border-none rounded-xl p-3 font-mono outline-none focus:ring-2 focus:ring-sqb-navy/20"
                            placeholder="123456789"
                            maxLength={9}
                            value={clientForm.inn}
                            onChange={(e) => setClientForm({ ...clientForm, inn: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-sqb-navy uppercase tracking-widest">Branch Code</label>
                          <input
                            className="w-full bg-sqb-bg border-none rounded-xl p-3 font-mono outline-none focus:ring-2 focus:ring-sqb-navy/20"
                            placeholder="00450"
                            value={clientForm.code_filial}
                            onChange={(e) => setClientForm({ ...clientForm, code_filial: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-sqb-navy uppercase tracking-widest">Address</label>
                        <input
                          className="w-full bg-sqb-bg border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-sqb-navy/20"
                          placeholder="Tashkent, Amir Temur 42"
                          value={clientForm.address}
                          onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-sqb-navy uppercase tracking-widest">Phone</label>
                        <input
                          className="w-full bg-sqb-bg border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-sqb-navy/20"
                          placeholder="+998901234567"
                          value={clientForm.phone}
                          onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                        />
                      </div>
                    </>
                  ) : activeTab === 'accounts' ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-sqb-navy uppercase tracking-widest">Client</label>
                        <select
                          className="w-full bg-sqb-bg border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-sqb-navy/20"
                          value={accountForm.client_id}
                          onChange={(e) => setAccountForm({ ...accountForm, client_id: e.target.value })}
                        >
                          <option value="">Select client...</option>
                          {clients.map((c: ClientRecord) => (
                            <option key={c.id} value={c.id}>{c.name} ({c.inn})</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-sqb-navy uppercase tracking-widest">Account Code (20 Digits)</label>
                        <input
                          className="w-full bg-sqb-bg border-none rounded-xl p-3 font-mono outline-none focus:ring-2 focus:ring-sqb-navy/20"
                          placeholder="20208000000000000000"
                          maxLength={20}
                          value={accountForm.code}
                          onChange={(e) => setAccountForm({ ...accountForm, code: e.target.value })}
                        />
                        <p className="text-[10px] text-sqb-grey-secondary">First 5 digits must match a valid CBU Registry COA code</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-sqb-navy uppercase tracking-widest">Branch Code</label>
                          <input
                            className="w-full bg-sqb-bg border-none rounded-xl p-3 font-mono outline-none focus:ring-2 focus:ring-sqb-navy/20"
                            value={accountForm.code_filial}
                            onChange={(e) => setAccountForm({ ...accountForm, code_filial: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-sqb-navy uppercase tracking-widest">Currency</label>
                          <select
                            className="w-full bg-sqb-bg border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-sqb-navy/20"
                            value={accountForm.code_currency}
                            onChange={(e) => setAccountForm({ ...accountForm, code_currency: e.target.value })}
                          >
                            <option value="000">UZS (000)</option>
                            <option value="840">USD (840)</option>
                            <option value="978">EUR (978)</option>
                          </select>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-sqb-navy uppercase tracking-widest">COA Code (5 Digits)</label>
                        <input
                          className="w-full bg-sqb-bg border-none rounded-xl p-3 font-mono outline-none focus:ring-2 focus:ring-sqb-navy/20"
                          placeholder="e.g. 16310"
                          maxLength={5}
                          value={cbuForm.coa_code}
                          onChange={(e) => setCbuForm({ ...cbuForm, coa_code: e.target.value })}
                        />
                        <p className="text-[10px] text-sqb-grey-secondary">Must be exactly 5 digits per CBU Resolution 3336</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-sqb-navy uppercase tracking-widest">Description</label>
                        <input
                          className="w-full bg-sqb-bg border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-sqb-navy/20"
                          placeholder="e.g. Operativ ijara daromadlari"
                          value={cbuForm.description}
                          onChange={(e) => setCbuForm({ ...cbuForm, description: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-sqb-navy uppercase tracking-widest">Account Type</label>
                        <select
                          className="w-full bg-sqb-bg border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-sqb-navy/20"
                          value={cbuForm.account_type}
                          onChange={(e) => setCbuForm({ ...cbuForm, account_type: e.target.value as 'INCOME' | 'EXPENSE' | 'TRANSIT' })}
                        >
                          <option value="INCOME">Income (Даромад)</option>
                          <option value="EXPENSE">Expense (Харажат)</option>
                          <option value="TRANSIT">Transit (Транзит)</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>

                <div className="p-6 border-t border-gray-100 flex gap-4">
                   <button onClick={() => setIsDrawerOpen(false)} className="flex-1 sqb-btn-ghost">{t('actions.cancel', 'Cancel')}</button>
                   <button
                     onClick={handleSave}
                     className="flex-1 sqb-btn-primary justify-center"
                     disabled={isMutating}
                   >
                     {isMutating ? 'Saving...' : t('actions.save', 'Save Entry')}
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
