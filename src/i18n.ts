import { createI18n } from 'vue-i18n';
import vi from './locales/vi.json';
import en from './locales/en.json';
import zh from './locales/zh-tw.json';
import { readStoredLocale } from './constants/locales';

const i18n = createI18n({
  legacy: false,
  locale: readStoredLocale() ?? 'vi',
  fallbackLocale: 'en',
  globalInjection: true,
  messages: {
    vi,
    en,
    zh,
    'zh-TW': zh,
    'zh-CN': zh,
  } as Record<string, typeof vi>,
});

export default i18n;