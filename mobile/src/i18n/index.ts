import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import tr from './resources/tr.json';

void i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  lng: 'tr',
  fallbackLng: 'tr',
  resources: {
    tr: { translation: tr },
  },
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
});

export { i18n };
export const t = i18n.t.bind(i18n);

export async function setAppLanguage(locale: string) {
  await i18n.changeLanguage(locale);
}

export default i18n;
