import { createI18n } from 'vue-i18n';
import vi from './locales/vi.json';
import en from './locales/en.json';
import zhTw from './locales/zh-tw.json';
import zhCn from './locales/zh-cn.json';
import { readStoredLocale } from './constants/locales';

type LocaleMessages = typeof vi;

const messages: Record<string, LocaleMessages> = {
  vi,
  en,
  'zh-TW': zhTw,
  'zh-CN': zhCn,
};

const i18n = createI18n({
  legacy: false,
  locale: readStoredLocale() ?? 'vi',
  fallbackLocale: 'en',
  globalInjection: true,
  messages,
});

export default i18n;