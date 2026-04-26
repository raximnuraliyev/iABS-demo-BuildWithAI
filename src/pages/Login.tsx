import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { useToast } from '../components/Toast';
import { motion } from 'motion/react';
import { Lock, User, AlertTriangle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const [tabelId, setTabelId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(tabelId, password);
      toast.success('Welcome back!');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sqb-navy flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full relative"
              style={{
                background: `conic-gradient(#BDBDBD 0deg 120deg, #E30613 120deg 240deg, #1e5aa0 240deg 360deg)`
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-7 h-7 bg-sqb-navy rounded-full" />
              </div>
            </div>
            <div>
              <h1 className="text-white text-3xl font-extrabold tracking-tight leading-none">SQB</h1>
              <p className="text-white/40 text-[10px] uppercase tracking-[0.25em] font-bold">iABS Demo #BuildWithAI</p>
            </div>
          </div>
          <p className="text-white/50 text-sm">Lease Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8 pb-2">
            <h2 className="text-xl font-bold text-sqb-navy mb-1">Sign In</h2>
            <p className="text-sm text-gray-400">Enter your credentials to access the system</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm"
              >
                <AlertTriangle size={16} />
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-sqb-navy uppercase tracking-widest">Табель №</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={tabelId}
                  onChange={(e) => setTabelId(e.target.value)}
                  placeholder="e.g. admin"
                  className="w-full bg-sqb-bg border-none rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-sqb-navy/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-sqb-navy uppercase tracking-widest">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-sqb-bg border-none rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-sqb-navy/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sqb-btn-primary py-3.5 text-base justify-center shadow-lg shadow-sqb-navy/20 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-[10px] mt-8 uppercase tracking-widest">
          SQB Internal Banking System • v2.0
        </p>
      </motion.div>
    </div>
  );
}
