import { nextTick } from 'vue';

/** Gỡ focus khỏi phần tử đang active — tránh aria-hidden trên ion-page ẩn. */
export function releaseFocus(): void {
  const active = document.activeElement;
  if (active instanceof HTMLElement) {
    active.blur();
  }
}

/** Blur lại sau popover dismiss / chuyển route (focus hay quay về trigger). */
export async function releaseFocusDeferred(): Promise<void> {
  releaseFocus();
  await nextTick();
  releaseFocus();
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });
  releaseFocus();
}

export function focusLoginField(): void {
  const loginInput = document.getElementById('login-code');
  if (loginInput instanceof HTMLElement) {
    loginInput.focus({ preventScroll: true });
  }
}
