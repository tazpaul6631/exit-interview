import { getCurrentInstance, onMounted, onUnmounted } from 'vue';
import { onIonViewWillEnter } from '@ionic/vue';
import { useRoute } from 'vue-router';
import { Capacitor } from '@capacitor/core';
import { OUTLET_PAGE_ACTIVATED } from '@/utils/ionicOutlet';

const REFRESH_DEBOUNCE_MS = 150;

function getHostIonPage(): HTMLElement | null {
  const root = getCurrentInstance()?.proxy?.$el;
  if (!root || !(root instanceof HTMLElement)) return null;
  return root.classList.contains('ion-page') ? root : root.closest('.ion-page');
}

/** Gọi load 1 lần khi page thực sự hiển thị — tránh gọi API lặp trên web. */
export function usePageDataRefresh(routeName: string, load: () => void | Promise<void>) {
  const route = useRoute();
  let lastRefreshAt = 0;
  let inFlight = false;

  const refreshIfActive = () => {
    if (route.name !== routeName) return;

    const page = getHostIonPage();
    if (page?.classList.contains('ion-page-hidden')) return;

    const now = Date.now();
    if (now - lastRefreshAt < REFRESH_DEBOUNCE_MS) return;
    lastRefreshAt = now;

    if (inFlight) return;
    inFlight = true;
    void Promise.resolve(load()).finally(() => {
      inFlight = false;
    });
  };

  if (Capacitor.isNativePlatform()) {
    onIonViewWillEnter(refreshIfActive);
    return;
  }

  const onOutletActivated = (event: Event) => {
    const name = (event as CustomEvent<{ routeName?: string }>).detail?.routeName;
    if (name === routeName) {
      refreshIfActive();
    }
  };

  onMounted(() => {
    window.addEventListener(OUTLET_PAGE_ACTIVATED, onOutletActivated);
    refreshIfActive();
  });

  onUnmounted(() => {
    window.removeEventListener(OUTLET_PAGE_ACTIVATED, onOutletActivated);
  });
}
