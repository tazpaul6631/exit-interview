import type { Composer } from 'vue-i18n';

export function syncAppDocumentTitle(i18n: Composer) {
  const title = i18n.t('app.title');
  document.title = title;
  document.documentElement.lang = i18n.locale.value;

  const appleTitleMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]');
  appleTitleMeta?.setAttribute('content', title);
}
