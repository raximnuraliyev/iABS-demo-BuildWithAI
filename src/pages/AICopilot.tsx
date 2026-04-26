import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Bot, User, Sparkles, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMutation } from '@tanstack/react-query';
import { aiCopilot } from '../lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  'What transit account is used for physical persons?',
  'Explain the lease lifecycle in iABS',
  'What are the COA codes for lease income?',
  'Difference between OUTBOUND and INBOUND leases?',
  'What is CBU Resolution 3336?',
];

export default function AICopilot() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Salom! I am the iABS Copilot — your AI assistant for the iABS Demo #BuildWithAI module. I can help you with CBU 3336 regulations, account codes, lease management rules, and more. Ask me anything!',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown(c => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const mutation = useMutation({
    mutationFn: (message: string) => aiCopilot(message),
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        },
      ]);
    },
    onError: (error: Error) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Error: ${error.message}`,
          timestamp: new Date(),
        },
      ]);
    },
  });

  const handleSend = (text?: string) => {
    if (cooldown > 0) return;
    const msg = text || input.trim();
    if (!msg) return;

    setCooldown(45); // 45 seconds cooldown

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: 'user', content: msg, timestamp: new Date() },
    ]);
    setInput('');
    mutation.mutate(msg);
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  return (
    <div id="copilot-page" className="h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-sqb-navy flex items-center gap-3">
            <div className="p-2 bg-sqb-navy rounded-xl text-white">
              <Sparkles size={22} />
            </div>
            {t('sidebar.copilot', 'AI Copilot')}
          </h1>
          <p className="text-sm text-sqb-grey-secondary mt-1">Vertex AI-powered assistant for iABS banking operations</p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-full font-bold">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Gemini 2.5 Flash
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Chat Panel */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-sqb-navy text-white' : 'bg-sqb-navy text-white'
                  }`}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-sqb-navy text-white rounded-tr-md'
                      : 'bg-gray-50 text-gray-800 rounded-tl-md border border-gray-100'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <span className={`text-[10px] mt-1 block ${
                      msg.role === 'user' ? 'text-white/50' : 'text-gray-400'
                    }`}>
                      {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {mutation.isPending && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-sqb-navy text-white flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div className="bg-gray-50 rounded-2xl rounded-tl-md border border-gray-100 px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-sqb-navy" />
                </div>
              </motion.div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={cooldown > 0 ? `Wait ${cooldown}s before sending next prompt...` : "Ask about CBU 3336, account codes, lease rules..."}
                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sqb-navy/20 focus:border-sqb-navy/30 transition-all disabled:opacity-50 disabled:bg-gray-100"
                disabled={mutation.isPending || cooldown > 0}
              />
              <button
                type="submit"
                disabled={!input.trim() || mutation.isPending || cooldown > 0}
                className="bg-sqb-navy text-white px-5 py-3 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-sqb-navy/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {cooldown > 0 ? <span>{cooldown}s</span> : (mutation.isPending ? <Loader2 size={16} className="animate-spin text-white" /> : <Send size={16} />)} Send
              </button>
            </form>
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="w-72 space-y-4 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-sqb-navy flex items-center gap-2 mb-4">
              <Info size={16} /> Quick Questions
            </h3>
            <div className="space-y-2">
              {QUICK_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  disabled={mutation.isPending || cooldown > 0}
                  className="w-full text-left text-xs bg-sqb-bg hover:bg-sqb-muted text-sqb-navy p-3 rounded-xl transition-colors font-medium leading-relaxed disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-sqb-navy rounded-2xl p-5 text-white">
            <h3 className="font-bold text-sm mb-2">💡 Pro Tip</h3>
            <p className="text-xs text-white/80 leading-relaxed">
              Ask in Russian or Uzbek for localized answers. The copilot understands CBU regulations and iABS-specific terminology.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
