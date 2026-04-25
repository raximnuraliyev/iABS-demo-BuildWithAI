import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, Send, Loader2, Code, Table } from 'lucide-react';
import { motion } from 'motion/react';
import { useMutation } from '@tanstack/react-query';
import { aiAnalytics } from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const CHART_COLORS = ['#1a2e4a', '#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

const EXAMPLE_QUERIES = [
  'Show total lease amounts grouped by type',
  'Count of leases by status',
  'Monthly lease creation trend for 2024',
  'Top 5 lessors by total amount',
  'Average lease amount by asset type',
];

export default function Analytics() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{ sql: string; data: any[] } | null>(null);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'table'>('bar');

  const mutation = useMutation({
    mutationFn: (q: string) => aiAnalytics(q),
    onSuccess: (data) => setResult(data),
  });

  const handleQuery = (q?: string) => {
    const text = q || query.trim();
    if (!text) return;
    setQuery(text);
    mutation.mutate(text);
  };

  const dataKeys = result?.data?.[0] ? Object.keys(result.data[0]) : [];
  const labelKey = dataKeys[0] || '';
  const valueKeys = dataKeys.slice(1);

  // Try to convert string numbers
  const chartData = (result?.data || []).map((row: any) => {
    const cleaned: any = {};
    for (const key of dataKeys) {
      const val = row[key];
      cleaned[key] = typeof val === 'string' && !isNaN(Number(val)) ? Number(val) : val;
    }
    return cleaned;
  });

  return (
    <div id="analytics-page" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-sqb-navy flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl text-white">
              <BarChart3 size={22} />
            </div>
            {t('sidebar.analytics', 'AI Analytics')}
          </h1>
          <p className="text-sm text-sqb-grey-secondary mt-1">Natural language queries → dynamic charts powered by Vertex AI</p>
        </div>
      </div>

      {/* Query Input */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <form onSubmit={(e) => { e.preventDefault(); handleQuery(); }} className="flex gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about your lease data in natural language..."
            className="flex-1 bg-sqb-bg border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
            disabled={mutation.isPending}
          />
          <button
            type="submit"
            disabled={!query.trim() || mutation.isPending}
            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-amber-500/25 transition-all disabled:opacity-40 flex items-center gap-2"
          >
            {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Analyze
          </button>
        </form>

        {/* Quick Queries */}
        <div className="flex flex-wrap gap-2 mt-4">
          {EXAMPLE_QUERIES.map((eq, i) => (
            <button
              key={i}
              onClick={() => handleQuery(eq)}
              disabled={mutation.isPending}
              className="text-xs bg-sqb-bg hover:bg-amber-50 text-sqb-navy px-3 py-1.5 rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              {eq}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {mutation.isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {(mutation.error as Error).message}
        </div>
      )}

      {/* Results */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Generated SQL */}
          <div className="bg-gray-900 rounded-2xl p-5 overflow-hidden">
            <div className="flex items-center gap-2 text-gray-400 text-xs font-bold mb-3">
              <Code size={14} /> Generated SQL
            </div>
            <pre className="text-green-400 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
              {result.sql}
            </pre>
          </div>

          {/* Chart Controls */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-sqb-navy">Results ({result.data.length} rows)</h3>
              <div className="flex gap-1 bg-sqb-bg rounded-lg p-1">
                {(['bar', 'line', 'table'] as const).map((ct) => (
                  <button
                    key={ct}
                    onClick={() => setChartType(ct)}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all capitalize ${
                      chartType === ct ? 'bg-sqb-navy text-white' : 'text-gray-500 hover:text-sqb-navy'
                    }`}
                  >
                    {ct === 'table' ? <Table size={14} /> : ct}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5">
              {chartType === 'table' ? (
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {dataKeys.map((k) => (
                          <th key={k} className="text-left px-4 py-2 text-[10px] font-bold uppercase text-sqb-grey-secondary tracking-wider">{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.map((row: any, i: number) => (
                        <tr key={i} className="border-b border-gray-50 hover:bg-sqb-bg/50">
                          {dataKeys.map((k) => (
                            <td key={k} className="px-4 py-2.5 font-mono text-xs">{String(row[k])}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  {chartType === 'bar' ? (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey={labelKey} tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      {valueKeys.map((key, i) => (
                        <Bar key={key} dataKey={key} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />
                      ))}
                    </BarChart>
                  ) : (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey={labelKey} tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      {valueKeys.map((key, i) => (
                        <Line key={key} dataKey={key} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={{ r: 4 }} />
                      ))}
                    </LineChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
