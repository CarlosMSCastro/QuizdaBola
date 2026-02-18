import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import pt from './locales/pt.json';
import en from './locales/en.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      pt: { translation: pt },
      en: { translation: en }
    },
    lng: 'pt', // língua default
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false // React já escapa por default
    }
  });

export default i18n;