import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      sidebar: {
        dashboard: 'Dashboard',
        outbound: 'Outbound Leases',
        inbound: 'Inbound Leases',
        dictionaries: 'Dictionaries',
        settings: 'Settings',
        copilot: 'AI Copilot',
        analytics: 'AI Analytics',
        matchmaker: 'Matchmaker',
      },
      dashboard: {
        title: 'Lease Management Hub',
        stats: {
          activeOutbound: 'Total Active Outbound Leases',
          pendingInbound: 'Pending Inbound Payments',
          pendingApproval: 'Assets Pending Approval',
        },
        recentActivity: 'Recent Activity',
      },
      actions: {
        add: 'Add Record',
        edit: 'Edit',
        delete: 'Delete',
        approve: 'Approve',
        return: 'Return',
        protocol: 'Protocol',
        pay: 'Pay',
        search: 'Search',
        save: 'Save',
        cancel: 'Cancel',
      },
      dictionaries: {
        clients: 'Clients',
        accounts: 'Accounts',
        cbuRegistry: 'CBU Registry',
        physical: 'Physical Person',
        juridical: 'Juridical Entity',
      },
      ai: {
        copilot: 'AI Copilot',
        analytics: 'AI Analytics',
        matchmaker: 'Property Matchmaker',
        askQuestion: 'Ask a question...',
        analyzing: 'Analyzing...',
      },
      common: {
        search: 'Search INN or Asset ID...',
        user: 'Bank Controller',
        admin: 'Administrator',
        operator: 'Operator',
        loading: 'Loading...',
        noData: 'No data found',
      },
    },
  },
  ru: {
    translation: {
      sidebar: {
        dashboard: 'Дашборд',
        outbound: 'Исходящая аренда',
        inbound: 'Входящая аренда',
        dictionaries: 'Справочники',
        settings: 'Настройки',
        copilot: 'ИИ Помощник',
        analytics: 'ИИ Аналитика',
        matchmaker: 'Подбор недвижимости',
      },
      dashboard: {
        title: 'Управление арендой',
        stats: {
          activeOutbound: 'Активная исходящая аренда',
          pendingInbound: 'Ожидающие платежи',
          pendingApproval: 'Ожидает утверждения',
        },
        recentActivity: 'Последние действия',
      },
      actions: {
        add: 'Добавить',
        edit: 'Изменить',
        delete: 'Удалить',
        approve: 'Утвердить',
        return: 'Возврат',
        protocol: 'Протокол',
        pay: 'Оплатить',
        search: 'Поиск',
        save: 'Сохранить',
        cancel: 'Отмена',
      },
      dictionaries: {
        clients: 'Контрагенты',
        accounts: 'Счета',
        cbuRegistry: 'Реестр МБ',
        physical: 'Физическое лицо',
        juridical: 'Юридическое лицо',
      },
      ai: {
        copilot: 'ИИ Помощник',
        analytics: 'ИИ Аналитика',
        matchmaker: 'Подбор недвижимости',
        askQuestion: 'Задайте вопрос...',
        analyzing: 'Анализ...',
      },
      common: {
        search: 'Поиск ИНН или ID актива...',
        user: 'Контролер банка',
        admin: 'Администратор',
        operator: 'Оператор',
        loading: 'Загрузка...',
        noData: 'Данные не найдены',
      },
    },
  },
  uz: {
    translation: {
      sidebar: {
        dashboard: 'Boshqaruv paneli',
        outbound: 'Chiquvchi ijara',
        inbound: 'Kiruvchi ijara',
        dictionaries: 'Ma\'lumotnomalar',
        settings: 'Sozlamalar',
        copilot: 'AI Yordamchi',
        analytics: 'AI Tahlil',
        matchmaker: 'Ko\'chmas mulk',
      },
      dashboard: {
        title: 'Ijara boshqaruvi hubi',
        stats: {
          activeOutbound: 'Jami faol chiquvchi ijaralar',
          pendingInbound: 'Kutilayotgan kiruvchi to\'lovlar',
          pendingApproval: 'Tasdiqlanishi kutilayotgan aktivlar',
        },
        recentActivity: 'So\'nggi harakatlar',
      },
      actions: {
        add: 'Qo\'shish',
        edit: 'Tahrirlash',
        delete: 'O\'chirish',
        approve: 'Tasdiqlash',
        return: 'Qaytarish',
        protocol: 'Protokol',
        pay: 'To\'lash',
        search: 'Qidirish',
        save: 'Saqlash',
        cancel: 'Bekor qilish',
      },
      dictionaries: {
        clients: 'Mijozlar',
        accounts: 'Hisoblar',
        cbuRegistry: 'MB Reestri',
        physical: 'Jismoniy shaxs',
        juridical: 'Yuridik shaxs',
      },
      ai: {
        copilot: 'AI Yordamchi',
        analytics: 'AI Tahlil',
        matchmaker: 'Ko\'chmas mulk qidirish',
        askQuestion: 'Savol bering...',
        analyzing: 'Tahlil qilinyapti...',
      },
      common: {
        search: 'INN yoki Aktiv ID bo\'yicha qidirish...',
        user: 'Bank nazoratchisi',
        admin: 'Administrator',
        operator: 'Operator',
        loading: 'Yuklanmoqda...',
        noData: 'Ma\'lumot topilmadi',
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
