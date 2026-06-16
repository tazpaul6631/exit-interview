export const LOCALE_STORAGE_KEY = 'app_locale';

export interface LocaleOption {
  code: string;
  name: string;
  icon: string;
}

export const LOCALE_OPTIONS: LocaleOption[] = [
  { code: 'vi', name: 'Tiếng Việt', icon: '/assets/icon-locales/vi.svg' },
  { code: 'en', name: 'English', icon: '/assets/icon-locales/en.svg' },
  { code: 'zh-TW', name: '繁體中文', icon: '/assets/icon-locales/zh-TW.svg' },
  { code: 'zh-CN', name: '简体中文', icon: '/assets/icon-locales/zh-CN.svg' },
];

export const LOCALE_CODES = LOCALE_OPTIONS.map((item) => item.code);

export const findLocaleOption = (code: string) =>
  LOCALE_OPTIONS.find((item) => item.code === code);

export const readStoredLocale = (): string | null => {
  if (typeof localStorage === 'undefined') return null;

  const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (saved && LOCALE_CODES.includes(saved)) return saved;

  return null;
};
