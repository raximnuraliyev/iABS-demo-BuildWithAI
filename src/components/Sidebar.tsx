import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  ArrowUpRight,
  ArrowDownLeft,
  BookOpen,
  Settings,
  Sparkles,
  BarChart3,
  Building,
} from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, labelKey: 'sidebar.dashboard' },
  { to: '/outbound', icon: ArrowUpRight, labelKey: 'sidebar.outbound' },
  { to: '/inbound', icon: ArrowDownLeft, labelKey: 'sidebar.inbound' },
  { to: '/dictionaries', icon: BookOpen, labelKey: 'sidebar.dictionaries' },
  { type: 'divider' as const },
  { to: '/ai-copilot', icon: Sparkles, labelKey: 'sidebar.copilot', badge: 'AI' },
  { to: '/analytics', icon: BarChart3, labelKey: 'sidebar.analytics', badge: 'AI' },
  { to: '/matchmaker', icon: Building, labelKey: 'sidebar.matchmaker', badge: 'AI' },
  { type: 'divider' as const },
  { to: '/settings', icon: Settings, labelKey: 'sidebar.settings' },
];

export function Sidebar() {
  const { t } = useTranslation();

  return (
    <aside
      id="main-sidebar"
      className="w-64 bg-sqb-navy text-white flex flex-col h-screen sticky top-0"
    >
      {/* Logo */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full relative shrink-0"
            style={{
              background: `conic-gradient(#BDBDBD 0deg 120deg, #E30613 120deg 240deg, #1e5aa0 240deg 360deg)`
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-5 bg-sqb-navy rounded-full" />
            </div>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight leading-tight">iABS Demo</h1>
            <p className="text-[10px] font-medium text-white/60">#BuildWithAI</p>
            <p className="text-[10px] text-white/40 font-medium tracking-widest uppercase">
              SQB BANK
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item, i) => {
          if ('type' in item && item.type === 'divider') {
            return <div key={`div-${i}`} className="h-px bg-white/10 my-3 mx-3" />;
          }
          const navItem = item as { to: string; icon: any; labelKey: string; badge?: string };
          const Icon = navItem.icon;
          return (
            <NavLink
              key={navItem.to}
              to={navItem.to}
              end={navItem.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                  isActive
                    ? 'bg-white/15 text-white font-bold shadow-lg shadow-white/5'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                )
              }
            >
              <Icon className="w-[18px] h-[18px]" />
              <span className="truncate">{t(navItem.labelKey, navItem.labelKey)}</span>
              {navItem.badge && (
                <span className="ml-auto text-[9px] bg-sqb-red text-white px-1.5 py-0.5 rounded font-bold">
                  {navItem.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <p className="text-[10px] text-white/30 text-center font-medium">
          v3.0.0 · #BuildWithAI
        </p>
      </div>
    </aside>
  );
}
