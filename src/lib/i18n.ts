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
        settings: 'Settings'
      },
      dashboard: {
        title: 'Lease Management Hub',
        stats: {
          activeOutbound: 'Total Active Outbound Leases',
          pendingInbound: 'Pending Inbound Payments',
          pendingApproval: 'Assets Pending Approval'
        },
        recentActivity: 'Recent Activity'
      },
      actions: {
        add: 'Add Record',
        edit: 'Edit',
        delete: 'Delete',
        approve: 'Approve',
        return: 'Return',
        protocol: 'Protocol',
        pay: 'Pay'
      },
      common: {
        search: 'Search INN or Asset ID...',
        user: 'Bank Controller',
        admin: 'Administrator',
        operator: 'Operator'
      }
    }
  },
  ru: {
    translation: {
      sidebar: {
        dashboard: 'Дашборд',
        outbound: 'Исходящая аренда',
        inbound: 'Входящая аренда',
        dictionaries: 'Справочники',
        settings: 'Настройки'
      },
      dashboard: {
        title: 'Управление арендой',
        stats: {
          activeOutbound: 'Активная исходящая аренда',
          pendingInbound: 'Ожидающие платежи',
          pendingApproval: 'Ожидает утверждения'
        },
        recentActivity: 'Последние действия'
      },
      actions: {
        add: 'Добавить',
        edit: 'Изменить',
        delete: 'Удалить',
        approve: 'Утвердить',
        return: 'Возврат',
        protocol: 'Протокол',
        pay: 'Оплатить'
      },
      common: {
        search: 'Поиск ИНН или ID актива...',
        user: 'Контролер банка',
        admin: 'Администратор',
        operator: 'Оператор'
      }
    }
  },
  uz: {
    translation: {
      sidebar: {
        dashboard: 'Boshqaruv paneli',
        outbound: 'Chiquvchi ijara',
        inbound: 'Kiruvchi ijara',
        dictionaries: 'Ma\'lumotnomalar',
        settings: 'Sozlamalar'
      },
      dashboard: {
        title: 'Ijara boshqaruvi hubi',
        stats: {
          activeOutbound: 'Jami faol chiquvchi ijaralar',
          pendingInbound: 'Kutilayotgan kiruvchi to\'lovlar',
          pendingApproval: 'Tasdiqlanishi kutilayotgan aktivlar'
        },
        recentActivity: 'So\'nggi harakatlar'
      },
      actions: {
        add: 'Qo\'shish',
        edit: 'Tahrirlash',
        delete: 'O\'chirish',
        approve: 'Tasdiqlash',
        return: 'Qaytarish',
        protocol: 'Protokol',
        pay: 'To\'lash'
      },
      common: {
        search: 'INN yoki Aktiv ID bo\'yicha qidirish...',
        user: 'Bank nazoratchisi',
        admin: 'Administrator',
        operator: 'Operator'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
