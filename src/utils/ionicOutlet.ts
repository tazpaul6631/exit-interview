import { nextTick } from 'vue';

export const NESTED_OUTLET_SELECTOR = '.content-card ion-router-outlet';

export const ROUTE_PAGE_CLASS: Record<string, string> = {
  Dashboard: 'dashboard-page',
  ListRole: 'role-list-page',
  DetailRole: 'role-detail-page',
  ListUser: 'user-list-page',
  ListOrganization: 'organization-list-page',
  ListExitInterview: 'list-exit-interview-page',
  DetailExitInterview: 'detail-exit-interview-page',
  NotFound: 'not-found-ion-page',
};

export const OUTLET_PAGE_ACTIVATED = 'outlet-page-activated';

export function queryOutletPages(selector: string): HTMLElement[] {
  const outlet = document.querySelector(selector);
  if (!outlet) return [];

  const directPages = Array.from(
    outlet.querySelectorAll<HTMLElement>(':scope > .ion-page'),
  );
  if (directPages.length > 0) return directPages;

  return Array.from(outlet.querySelectorAll<HTMLElement>('.ion-page'));
}

function pickVisiblePage(
  pages: HTMLElement[],
  routeName?: string | symbol | null,
): HTMLElement | null {
  const name = routeName != null ? String(routeName) : '';
  const pageClass = name ? ROUTE_PAGE_CLASS[name] : undefined;

  if (pageClass) {
    const matching = pages.filter((page) => page.classList.contains(pageClass));
    if (matching.length > 0) {
      return matching[0]!;
    }
    // Component lazy-load chưa mount — không fallback sang page khác.
    return null;
  }

  return pages[pages.length - 1] ?? null;
}

let lastOutletActivation: { name: string; at: number } | null = null;

function emitOutletPageActivated(routeName?: string | symbol | null) {
  if (routeName == null || typeof window === 'undefined') return;

  const name = String(routeName);
  const now = Date.now();
  if (
    lastOutletActivation?.name === name &&
    now - lastOutletActivation.at < 150
  ) {
    return;
  }
  lastOutletActivation = { name, at: now };

  window.dispatchEvent(
    new CustomEvent(OUTLET_PAGE_ACTIVATED, {
      detail: { routeName: name },
    }),
  );
}

/** Web: chỉ giữ 1 ion-page hiển thị trong nested outlet. */
export function syncOutletPages(
  selector: string,
  routeName?: string | symbol | null,
): boolean {
  const pages = queryOutletPages(selector);
  if (pages.length === 0) return false;

  const visiblePage = pickVisiblePage(pages, routeName);
  if (!visiblePage) return false;

  pages.forEach((page) => {
    page.classList.toggle('ion-page-hidden', page !== visiblePage);
  });

  const isVisible = !visiblePage.classList.contains('ion-page-hidden');
  if (isVisible) {
    emitOutletPageActivated(routeName);
  }
  return isVisible;
}

export async function syncOutletPagesDeferred(
  selector: string,
  routeName?: string | symbol | null,
) {
  const delays = [0, 16, 50, 120, 250, 400, 600, 800];

  for (const delay of delays) {
    if (delay > 0) {
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, delay);
      });
    }
    await nextTick();
    if (syncOutletPages(selector, routeName)) return;
  }
}
