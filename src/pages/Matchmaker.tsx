import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Building, Send, Loader2, MapPin, Ruler, DollarSign, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { useMutation } from '@tanstack/react-query';
import { aiMatchmaker } from '../lib/api';

export default function Matchmaker() {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<{ query: any; results: any[] } | null>(null);

  const mutation = useMutation({
    mutationFn: (p: string) => aiMatchmaker(p),
    onSuccess: (data) => setResult(data),
  });

  const handleSearch = (text?: string) => {
    const p = text || prompt.trim();
    if (!p) return;
    setPrompt(p);
    mutation.mutate(p);
  };

  const examples = [
    'I need a 200 sqm office in Tashkent center with parking, budget up to 50 million UZS',
    'Looking for a warehouse near Sergeli district, at least 500 sqm',
    'Modern co-working space for 20 people in Yunusabad',
  ];

  return (
    <div id="matchmaker-page" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-sqb-navy flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl text-white">
            <Building size={22} />
          </div>
          {t('sidebar.matchmaker', 'Property Matchmaker')}
        </h1>
        <p className="text-sm text-sqb-grey-secondary mt-1">AI-powered real estate matching via natural language (Comet API integration)</p>
      </div>

      {/* Input */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-3">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the property you're looking for in natural language..."
            className="flex-1 bg-sqb-bg border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
            disabled={mutation.isPending}
          />
          <button
            type="submit"
            disabled={!prompt.trim() || mutation.isPending}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-40 flex items-center gap-2"
          >
            {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-2 mt-4">
          {examples.map((ex, i) => (
            <button
              key={i}
              onClick={() => handleSearch(ex)}
              disabled={mutation.isPending}
              className="text-xs bg-sqb-bg hover:bg-emerald-50 text-sqb-navy px-3 py-1.5 rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {mutation.isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {(mutation.error as Error).message}
        </div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Extracted Query */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-sqb-navy mb-3">🧠 Extracted Requirements</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(result.query).map(([key, value]) => (
                <div key={key} className="bg-sqb-bg rounded-xl p-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">{key.replace(/_/g, ' ')}</span>
                  <span className="text-sm font-bold text-sqb-navy">{Array.isArray(value) ? (value as any[]).join(', ') : String(value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Property Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {result.results.map((prop, i) => (
              <motion.div
                key={prop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="h-40 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 flex items-center justify-center relative">
                  <Building className="w-16 h-16 text-emerald-200" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 text-xs font-bold text-emerald-700">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    {Math.round(prop.match_score * 100)}% match
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <h4 className="font-bold text-sqb-navy">{prop.title}</h4>
                  <div className="space-y-2 text-xs text-sqb-grey-secondary">
                    <div className="flex items-center gap-2"><MapPin size={13} /> {prop.address}</div>
                    <div className="flex items-center gap-2"><Ruler size={13} /> {prop.sqm} m²</div>
                    <div className="flex items-center gap-2"><DollarSign size={13} /> {Number(prop.price).toLocaleString()} {prop.currency}/mo</div>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-2">
                    {(prop.features || []).map((f: string) => (
                      <span key={f} className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">{f}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
