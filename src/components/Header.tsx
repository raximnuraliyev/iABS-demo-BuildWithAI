import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Bell, LogOut, ChevronDown, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/auth';
import { NotificationPanel, useUnreadCount } from './NotificationPanel';
import { motion, AnimatePresence } from 'motion/react';

export function Header() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const unreadCount = useUnreadCount();

  const changeLanguage = (lng: string) => i18n.changeLanguage(lng);

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'ru', label: 'RU' },
    { code: 'uz', label: 'UZ' }
  ];

  const initials = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <>
      <header id="app-header" className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40 shrink-0">
        <div className="flex items-center gap-8 flex-1">
          <div id="global-search" className="relative max-w-sm w-full hidden md:block">
            <div className="flex items-center bg-sqb-muted px-4 py-2 rounded-lg w-full transition-all focus-within:ring-2 focus-within:ring-sqb-navy/10">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t('common.search')}
                className="bg-transparent border-none focus:ring-0 text-sm w-full ml-3 outline-none placeholder:text-gray-400 text-sqb-navy"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex border rounded-md overflow-hidden text-[10px] font-bold shadow-sm">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={cn(
                  "px-3 py-1.5 transition-colors",
                  i18n.language === lang.code
                    ? "bg-sqb-navy text-white"
                    : "bg-white text-sqb-navy hover:bg-gray-50"
                )}
              >
                {lang.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowNotifications(true)}
            className="p-2 hover:bg-sqb-bg rounded-md transition-colors relative text-sqb-navy"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-sqb-red rounded-full ring-2 ring-white flex items-center justify-center text-white text-[9px] font-bold px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              id="user-profile"
              className="flex items-center gap-3 pl-2 group"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-sqb-navy leading-tight">{user?.full_name || 'User'}</p>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">{user?.role?.name || 'Guest'}</p>
              </div>
              <div className="w-10 h-10 bg-sqb-navy rounded-full border-2 border-sqb-red flex items-center justify-center text-white font-bold text-sm shadow-md transition-transform group-hover:scale-105">
                {initials}
              </div>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            <AnimatePresence>
              {showProfile && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    className="absolute right-0 top-14 bg-white border border-gray-100 rounded-xl shadow-xl z-50 w-64 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-100 bg-sqb-bg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sqb-navy rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {initials}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-sqb-navy">{user?.full_name}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{user?.role?.name}</p>
                        </div>
                      </div>
                      <div className="mt-2 text-[10px] text-gray-400">
                        Tabel №: <span className="font-bold text-sqb-navy">{user?.tabel_id}</span>
                        {user?.is_head_admin && (
                          <span className="ml-2 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full text-[9px] font-bold">HEAD ADMIN</span>
                        )}
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => { setShowProfile(false); logout(); }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
}
