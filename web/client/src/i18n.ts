/**
 * @file i18n.ts
 * @description Module handling i18n.ts functionality for the MPL Interactive IDE.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from '@/locales/en.json';
import esTranslation from '@/locales/es.json';
import { LocalStorageKey } from '@/constants/enums';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslation },
    es: { translation: esTranslation },
  },
  lng: localStorage.getItem(LocalStorageKey.LANGUAGE) || 'en', // Default language
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React already safeguards from XSS
  },
});

export default i18n;
