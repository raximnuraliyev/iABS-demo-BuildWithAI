import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Building2, FileCheck, Search, UserPlus, Package } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCounterparties, createCounterparty, fetchAssets, createAsset, type Counterparty, type Asset } from '../lib/api';
import { useToast } from '../components/Toast';

export default function Dictionaries() {
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState('tenants');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Form state
  const [formName, setFormName] = useState('');
  const [formInn, setFormInn] = useState('');
  const [formAccount, setFormAccount] = useState('');
  // Asset form
  const [assetName, setAssetName] = useState('');
  const [assetCategory, setAssetCategory] = useState('PC');
  const [assetUnit, setAssetUnit] = useState('PIECES');

  const categories = [
    { id: 'tenants', label: 'Tenants (Arendatori)', icon: Users },
    { id: 'lessors', label: 'Lessors (Arendodateli)', icon: Building2 },
    { id: 'assets', label: 'Asset Registry', icon: Package },
  ];

  const counterpartyType = activeCategory === 'tenants' ? 'TENANT' : 'LESSOR';

  const { data: counterparties = [], isLoading: cpLoading } = useQuery({
    queryKey: ['counterparties', counterpartyType],
    queryFn: () => fetchCounterparties(counterpartyType),
    enabled: activeCategory !== 'assets',
  });

  const { data: assets = [], isLoading: assetLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => fetchAssets(),
    enabled: activeCategory === 'assets',
  });

  const createCpMutation = useMutation({
    mutationFn: createCounterparty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counterparties'] });
      setIsDrawerOpen(false);
      resetForm();
      toast.success('Counterparty created');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createAssetMutation = useMutation({
    mutationFn: createAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setIsDrawerOpen(false);
      resetForm();
      toast.success('Asset created');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resetForm = () => {
    setFormName('');
    setFormInn('');
    setFormAccount('');
    setAssetName('');
    setAssetCategory('PC');
    setAssetUnit('PIECES');
  };

  const filteredCounterparties = counterparties.filter((cp) => {
    if (!searchText) return true;
    const q = searchText.toLowerCase();
    return cp.name.toLowerCase().includes(q) || cp.inn.includes(q);
  });

  const filteredAssets = assets.filter((a) => {
    if (!searchText) return true;
    return a.name.toLowerCase().includes(searchText.toLowerCase()) || a.category.toLowerCase().includes(searchText.toLowerCase());
  });

  const handleSave = () => {
    if (activeCategory === 'assets') {
      createAssetMutation.mutate({
        name: assetName,
        category: assetCategory,
        measurement_unit: assetUnit,
      });
    } else {
      createCpMutation.mutate({
        name: formName,
        inn: formInn,
        settlement_account: formAccount,
        type: counterpartyType as 'TENANT' | 'LESSOR',
      });
    }
  };

  const isLoading = activeCategory === 'assets' ? assetLoading : cpLoading;

  const unitLabels: Record<string, string> = { PIECES: 'Pieces', SQ_METERS: 'm²' };

  return (
    <div id="dictionaries-page" className="h-[calc(100vh-140px)] flex gap-8">
      {/* Left Pane */}
      <div id="category-sidebar" className="w-72 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-sqb-navy mb-2">{t('sidebar.dictionaries')}</h1>
        <div className="sqb-card flex-1 overflow-hidden p-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setSearchText(''); }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-200 group text-left",
                activeCategory === cat.id 
                  ? "bg-sqb-navy text-white shadow-lg" 
                  : "text-sqb-grey-secondary hover:bg-gray-50"
              )}
            >
              <cat.icon className={cn("w-5 h-5", activeCategory === cat.id ? "text-white" : "text-sqb-navy")} />
              <span className="font-bold text-sm tracking-tight">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right Pane */}
      <div id="category-content" className="flex-1 flex flex-col gap-6">
        <div className="flex items-center justify-between">
           <div>
              <h2 className="text-xl font-bold text-sqb-navy capitalize">{activeCategory} Management</h2>
              <p className="text-xs text-sqb-grey-secondary font-medium">Standardized reference data for leasing contracts.</p>
           </div>
           <button 
             onClick={() => { resetForm(); setIsDrawerOpen(true); }}
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
            ) : activeCategory === 'assets' ? (
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-[#fcfcfd] border-b border-gray-100 uppercase text-[10px] font-bold text-sqb-grey-secondary">
                  <tr>
                    <th className="px-6 py-3">Asset Name</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Unit</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredAssets.length === 0 ? (
                    <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-400">No assets found.</td></tr>
                  ) : (
                    filteredAssets.map((item) => (
                      <tr key={item.id} className="border-b border-gray-50 hover:bg-sqb-bg/20">
                        <td className="px-6 py-4 font-bold text-sqb-navy">{item.name}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-sqb-bg text-sqb-navy">{item.category}</span>
                        </td>
                        <td className="px-6 py-4 text-xs text-sqb-grey-secondary">{unitLabels[item.measurement_unit] || item.measurement_unit}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
             <table className="w-full text-left">
                <thead className="sticky top-0 bg-[#fcfcfd] border-b border-gray-100 uppercase text-[10px] font-bold text-sqb-grey-secondary">
                  <tr>
                    <th className="px-6 py-3">Entity Name</th>
                    <th className="px-6 py-3">INN</th>
                    <th className="px-6 py-3">Settlement Account</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredCounterparties.length === 0 ? (
                    <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-400">No counterparties found.</td></tr>
                  ) : (
                    filteredCounterparties.map((item) => (
                      <tr key={item.id} className="border-b border-gray-50 hover:bg-sqb-bg/20">
                        <td className="px-6 py-4">
                          <p className="font-bold text-sqb-navy">{item.name}</p>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">{item.inn}</td>
                        <td className="px-6 py-4 font-mono text-xs text-sqb-grey-secondary">{item.settlement_account}</td>
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
                    <UserPlus /> Add New {activeCategory === 'assets' ? 'Asset' : 'Counterparty'}
                  </h3>
                   <p className="text-white/60 text-xs mt-1 italic">Antigravity Data Normalization Layer</p>
                </div>
                
                <div className="flex-1 p-8 space-y-6 overflow-y-auto">
                  {activeCategory === 'assets' ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-sqb-navy uppercase tracking-widest">Asset Name</label>
                        <input 
                          className="w-full bg-sqb-bg border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-sqb-navy/20" 
                          placeholder="e.g. Server Rack HP-99"
                          value={assetName}
                          onChange={(e) => setAssetName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-sqb-navy uppercase tracking-widest">Category</label>
                        <select 
                          className="w-full bg-sqb-bg border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-sqb-navy/20"
                          value={assetCategory}
                          onChange={(e) => setAssetCategory(e.target.value)}
                        >
                          <option value="PC">PC</option>
                          <option value="FURNITURE">Furniture</option>
                          <option value="BUILDING">Building</option>
                          <option value="LAND">Land</option>
                          <option value="ATM">ATM</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-sqb-navy uppercase tracking-widest">Measurement Unit</label>
                        <select 
                          className="w-full bg-sqb-bg border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-sqb-navy/20"
                          value={assetUnit}
                          onChange={(e) => setAssetUnit(e.target.value)}
                        >
                          <option value="PIECES">Pieces</option>
                          <option value="SQ_METERS">Square Meters</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-sqb-navy uppercase tracking-widest">Legal Name</label>
                        <input 
                          className="w-full bg-sqb-bg border-none rounded-xl p-3 outline-none focus:ring-2 focus:ring-sqb-navy/20" 
                          placeholder="e.g. UzAuto Motors JSC"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-sqb-navy uppercase tracking-widest">INN (9-Digits)</label>
                          <input 
                            className="w-full bg-sqb-bg border-none rounded-xl p-3 font-mono outline-none focus:ring-2 focus:ring-sqb-navy/20" 
                            placeholder="123456789"
                            maxLength={9}
                            value={formInn}
                            onChange={(e) => setFormInn(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-sqb-navy uppercase tracking-widest">Type</label>
                          <input 
                            className="w-full bg-sqb-bg border-none rounded-xl p-3 outline-none" 
                            value={activeCategory === 'tenants' ? 'TENANT' : 'LESSOR'}
                            disabled
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-sqb-navy uppercase tracking-widest">Settlement Account (20-Digits)</label>
                        <input 
                          className="w-full bg-sqb-bg border-none rounded-xl p-3 font-mono outline-none focus:ring-2 focus:ring-sqb-navy/20" 
                          placeholder="20208000000000000000"
                          maxLength={20}
                          value={formAccount}
                          onChange={(e) => setFormAccount(e.target.value)}
                        />
                      </div>
                    </>
                  )}
                </div>
                
                <div className="p-6 border-t border-gray-100 flex gap-4">
                   <button onClick={() => setIsDrawerOpen(false)} className="flex-1 sqb-btn-ghost">Cancel</button>
                   <button 
                     onClick={handleSave} 
                     className="flex-1 sqb-btn-primary justify-center"
                     disabled={createCpMutation.isPending || createAssetMutation.isPending}
                   >
                     {(createCpMutation.isPending || createAssetMutation.isPending) ? 'Saving...' : 'Save Entry'}
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
