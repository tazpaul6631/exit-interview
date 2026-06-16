import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  findLocaleOption,
  LOCALE_OPTIONS,
  LOCALE_STORAGE_KEY,
  readStoredLocale,
} from '@/constants/locales';

export function useAppLocale() {
  const { locale } = useI18n();

  const selectedLanguage = ref(locale.value);

  watch(selectedLanguage, (code) => {
    if (!code || code === locale.value) return;

    locale.value = code;
    localStorage.setItem(LOCALE_STORAGE_KEY, code);
  });

  const syncLocaleFromStorage = () => {
    const saved = readStoredLocale();
    if (!saved) return;

    selectedLanguage.value = saved;
    locale.value = saved;
  };

  syncLocaleFromStorage();

  return {
    selectedLanguage,
    languages: LOCALE_OPTIONS,
    getLocaleByCode: findLocaleOption,
  };
}
