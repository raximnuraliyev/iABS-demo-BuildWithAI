import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, LogOut, LogIn, Book, Settings, ChevronLeft, ChevronRight, History } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';

export function Sidebar() {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: t('sidebar.dashboard'), path: '/' },
    { icon: LogOut, label: t('sidebar.outbound'), path: '/outbound' },
    { icon: LogIn, label: t('sidebar.inbound'), path: '/inbound' },
    { icon: Book, label: t('sidebar.dictionaries'), path: '/dictionaries' },
    { icon: History, label: 'Activity', path: '/activity' },
    { icon: Settings, label: t('sidebar.settings'), path: '/settings' },
  ];

  return (
    <aside
      id="app-sidebar"
      className={cn(
        "bg-sqb-navy flex flex-col transition-all duration-300 ease-in-out relative group shrink-0",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-6 flex items-center gap-3 border-b border-white/10 shrink-0">
        <div className="w-10 h-10 flex items-center justify-center shrink-0 overflow-hidden relative">
          <div
            className="w-full h-full rounded-full"
            style={{
              background: `conic-gradient(
                #BDBDBD 0deg 120deg,
                #E30613 120deg 240deg,
                #1e5aa0 240deg 360deg
              )`
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 bg-sqb-navy rounded-full" />
          </div>
        </div>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="text-white font-extrabold tracking-tight text-xl leading-[0.8] mb-0.5">SQB</span>
            <span className="text-white/40 text-[9px] uppercase tracking-widest font-bold">iABS UCHET</span>
          </div>
        )}
      </div>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-white border border-gray-100 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 text-sqb-navy"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            id={`nav-link-${item.path.replace('/', 'home') || 'home'}`}
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group whitespace-nowrap",
              isActive
                ? "bg-white/10 text-white font-bold shadow-sm"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5 min-w-[20px] transition-transform group-hover:scale-110",
              isCollapsed && "mx-auto"
            )} />
            {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={cn("p-4 mt-auto border-t border-white/10", isCollapsed ? "text-center" : "")}>
        <div className={cn(
          "bg-white/5 p-3 rounded-lg border border-white/5",
          isCollapsed ? "inline-block" : "block"
        )}>
          {!isCollapsed && (
            <>
               <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1 flex items-center gap-2">
                <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                SYSTEM LIVE
              </p>
              <p className="text-[10px] font-bold text-white/80">SQB iABS v2.0</p>
            </>
          )}
          {isCollapsed && <div className="w-1.5 h-1.5 bg-green-400 rounded-full mx-auto" />}
        </div>
      </div>
    </aside>
  );
}
