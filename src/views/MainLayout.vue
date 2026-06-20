<template>
  <ion-page>
    <ion-split-pane content-id="main-content" when="md" class="layout-container">
      <ion-menu content-id="main-content" menu-id="main-menu" type="overlay" class="verona-sidebar">
        <ion-content class="sidebar-content">
          <div class="sidebar-container">
            <div class="sidebar-top">
              <div class="logo-box">
                <img src="/assets/icons/icon-48.webp" alt="logo-company" type="button"
                  @click="navigateToPath('/dashboard')" class="logo-box__img">
              </div>

              <div class="sidebar-menu">
                <Button v-for="item in menuItems" :key="item.url" :icon="item.icon" :title="t(item.titleKey)" rounded
                  text :severity="isMenuActive(item) ? 'primary' : 'secondary'"
                  :class="['nav-item', { active: isMenuActive(item) }]" @click="handleMenuNav(item.url)" />
              </div>
            </div>
          </div>
        </ion-content>
      </ion-menu>

      <ion-page id="main-content">
        <ion-header class="ion-no-border verona-header">
          <ion-toolbar class="header-toolbar">
            <ion-buttons slot="start" class="header-left">
              <ion-menu-button class="ion-hide-md-up"></ion-menu-button>
            </ion-buttons>
            <ion-buttons slot="end" class="header-actions">
              <LocaleSelect variant="popover" input-id="profile-language" show-label stop-propagation
                @change="dismissProfilePopover" />
            </ion-buttons>
            <ion-buttons slot="end" class="header-actions">
              <button id="profile-trigger" type="button" class="profile-trigger" aria-haspopup="true"
                :aria-label="t('layout.profile_menu')">
                <UserAvatar :label="userInitials" size="sm" />
                <span class="profile-meta ion-hide-sm-down">
                  <span class="profile-name">{{ displayName }}</span>
                  <span class="profile-role">{{ userSubtitle }}</span>
                </span>
                <ion-icon :icon="chevronDownOutline" class="profile-chevron ion-hide-sm-down" aria-hidden="true" />
              </button>

              <ion-popover ref="profilePopoverRef" trigger="profile-trigger" :dismiss-on-select="false"
                class="profile-popover" @didDismiss="onProfilePopoverDismiss">
                <ion-content class="profile-popover__content">
                  <div class="profile-popover__header">
                    <UserAvatar :label="userInitials" size="md" />
                    <div class="profile-popover__info">
                      <p class="profile-popover__name">{{ displayName }}</p>
                      <p class="profile-popover__role">{{ userSubtitle }}</p>
                    </div>
                  </div>
                  <ion-list lines="none" class="profile-popover__menu">
                    <ion-item button @click="handleChangePassword" :detail="false"
                      class="profile-popover__change-password">
                      <ion-icon :icon="keyOutline" slot="start" aria-hidden="true" />
                      <ion-label>{{ t('layout.change_password') }}</ion-label>
                    </ion-item>
                    <ion-item button @click="handleLogout" :detail="false" class="profile-popover__logout">
                      <ion-icon :icon="logOutOutline" slot="start" aria-hidden="true" />
                      <ion-label>{{ t('layout.logout') }}</ion-label>
                    </ion-item>
                  </ion-list>
                </ion-content>
              </ion-popover>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content class="verona-content" :scroll-y="false">
          <div class="content-wrapper">
            <div class="scrollable-area">
              <nav class="breadcrumb-wrapper" :aria-label="t('layout.breadcrumb_nav')">
                <ion-breadcrumbs class="app-breadcrumbs">
                  <ion-breadcrumb class="breadcrumb-item breadcrumb-item--home" @click="navigateToPath('/dashboard')">
                    <span class="breadcrumb-item__inner">
                      <ion-icon :icon="homeOutline" class="breadcrumb-item__icon" aria-hidden="true" />
                      <span class="breadcrumb-item__label">{{ t('layout.dashboard') }}</span>
                    </span>
                  </ion-breadcrumb>
                  <ion-breadcrumb v-for="(item, index) in breadcrumbs" :key="item.title" class="breadcrumb-item"
                    :class="{ 'breadcrumb-item--active': index === breadcrumbs.length - 1, 'breadcrumb-item--clickable': !!item.path }"
                    :active="index === breadcrumbs.length - 1" @click="item.path && navigateToPath(item.path)">
                    <span class="breadcrumb-item__inner">
                      <span class="breadcrumb-item__label">{{ item.title }}</span>
                    </span>
                  </ion-breadcrumb>
                </ion-breadcrumbs>
              </nav>

              <div class="content-card">
                <ion-router-outlet :animated="false" :key="outletKey" />
              </div>

              <footer class="layout-footer">
                <img src="/assets/logocompany.png" alt="JIA HSIN" class="layout-footer__logo" />
                <div class="copyright">© 2026 IT Jia Hsin CO., LTD</div>
              </footer>
            </div>
          </div>
        </ion-content>
      </ion-page>
    </ion-split-pane>

    <ChangePasswordDialog v-model:visible="changePasswordVisible" :user-initials="userInitials"
      :display-name="displayName" :user-subtitle="userSubtitle" />
  </ion-page>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import {
  IonSplitPane, IonMenu, IonList, IonPage,
  IonHeader, IonToolbar, IonButtons, IonMenuButton, IonRouterOutlet,
  IonContent,
  IonIcon, IonBreadcrumbs, IonBreadcrumb, IonPopover, IonLabel, IonItem,
  menuController,
} from '@ionic/vue';
import { Capacitor } from '@capacitor/core';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import {
  chevronDownOutline, homeOutline,
  logOutOutline,
  keyOutline
} from 'ionicons/icons';

import { useAuthStore } from '@/store/auth';
import { useUserRole } from '@/composables/useUserRole';
import LocaleSelect from '@/components/LocaleSelect.vue';
import ChangePasswordDialog from '@/components/ChangePasswordDialog.vue';
import UserAvatar from '@/components/UserAvatar.vue';
import { APP_MENU_ITEMS, matchesRoutePrefix, type AppMenuItem } from '@/constants/appMenuItems';
import { hasRouteMenuAccess } from '@/utils/menuAccess';
import { releaseFocus, releaseFocusDeferred } from '@/utils/releaseFocus';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();

const profilePopoverRef = ref<{ $el: HTMLIonPopoverElement } | null>(null);

const dismissProfilePopover = async () => {
  const popover = profilePopoverRef.value?.$el;
  if (!popover) return;

  try {
    await popover.dismiss();
  } catch {
    /* popover may already be closed */
  }
};

const onProfilePopoverDismiss = () => {
  document.getElementById('profile-trigger')?.blur();
  releaseFocus();
};

/** Web: giữ outlet ổn định; hiển thị page do router guard sync, không remount mỗi lần đổi path. */
const outletKey = computed(() =>
  Capacitor.isNativePlatform() ? 'native' : 'web',
);

// 2. Khởi tạo store
const authStore = useAuthStore();
useUserRole();

const displayName = computed(() => {
  const name = authStore.getUserName;
  if (name !== 'Guest') return name;
  return authStore.getUserCode || t('layout.guest_hr');
});

const userSubtitle = computed(() => {
  const code = authStore.getUserCode;
  const role = authStore.getUserRoleLabel;
  return code ? `${role} · ${code}` : role;
});

const userInitials = computed(() => {
  const name = displayName.value.trim();
  if (name) {
    const words = name.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      const first = words[0][0]?.toUpperCase() ?? '';
      const last = words[words.length - 1][0]?.toUpperCase() ?? '';
      if (first && last) return `${first}${last}`;
    }
    if (words.length === 1) {
      const word = words[0];
      if (word.length >= 2) {
        return `${word[0]}${word[word.length - 1]}`.toUpperCase();
      }
      return word[0]?.toUpperCase() ?? '';
    }
  }

  const code = authStore.getUserCode.trim();
  if (code.length >= 2) {
    return `${code[0]}${code[code.length - 1]}`.toUpperCase();
  }
  return code[0]?.toUpperCase() || 'HR';
});

const changePasswordVisible = ref(false);

const handleLogout = async () => {
  await dismissProfilePopover();
  await releaseFocusDeferred();
  await authStore.logout();
};

const handleChangePassword = async () => {
  await dismissProfilePopover();
  await nextTick();
  releaseFocus();
  changePasswordVisible.value = true;
};

const sidebarItems = APP_MENU_ITEMS;

const menuItems = computed(() => {
  const menus = authStore.user?.permissions ?? [];
  return sidebarItems.filter((item) => hasRouteMenuAccess(menus, item.permissionHints));
});

const isMenuActive = (item: AppMenuItem) =>
  item.routePrefixes.some((prefix) => matchesRoutePrefix(route.path, prefix));

const handleMenuNav = async (url: string) => {
  if (route.path !== url) {
    await router.replace(url);
  }

  if (await menuController.isOpen('main-menu')) {
    await menuController.close('main-menu');
  }
};

const navigateToPath = async (path: string) => {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  const backToListFromDetail =
    (route.path.startsWith('/detail-role') && path === '/list-role') ||
    (route.path.startsWith('/detail-exit-interview') && path === '/list-exit-interview');

  if (backToListFromDetail && window.history.length > 1) {
    router.back();
    return;
  }

  if (route.path !== path) {
    await router.replace(path);
  }
};

interface BreadcrumbItem {
  title: string;
  path?: string;
}

const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  if (route.path.startsWith('/detail-exit-interview')) {
    return [
      { title: t('layout.breadcrumb.exit_interview_list'), path: '/list-exit-interview' },
      { title: t('layout.breadcrumb.exit_interview_detail') },
    ];
  }

  if (route.path.startsWith('/detail-role')) {
    return [
      { title: t('layout.breadcrumb.role_list'), path: '/list-role' },
      { title: t('layout.breadcrumb.role_detail'), path: '/detail-role' },
    ];
  }

  switch (route.path) {
    case '/list-exit-interview':
      return [{ title: t('layout.breadcrumb.exit_interview_list') }];
    case '/detail-exit-interview':
      return [{ title: t('layout.breadcrumb.exit_interview_detail') }];
    case '/list-role':
      return [{ title: t('layout.breadcrumb.role_list') }];
    case '/detail-role':
      return [{ title: t('layout.breadcrumb.role_detail') }];
    case '/list-organization':
      return [{ title: t('layout.breadcrumb.organization_list') }];
    case '/list-user':
      return [{ title: t('layout.breadcrumb.user_list') }];
    case '/404':
      return [{ title: t('layout.breadcrumb.not_found') }];
    default:
      return [];
  }
});
</script>

<style scoped lang="scss">
/* --- TỔNG THỂ --- */
.layout-container {
  --side-width: 80px;
  --side-max-width: 80px;
  --side-min-width: 80px;
}

/* SIDEBAR (80px) --- */
ion-menu.verona-sidebar {
  --width: 80px;
  --background: #ffffff;
  border-right: none;

  &::part(container) {
    box-shadow: none;
  }
}

.sidebar-content {
  --background: #ffffff;
  --padding-top: 1.5rem;
  --padding-bottom: 1.5rem;
}

.sidebar-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: center;
}

.sidebar-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.logo-box {
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 52px;
  height: 52px;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);

  &__img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.logo-box__img:hover {
  cursor: pointer;
}

.sidebar-menu {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}

.nav-item {
  width: 48px !important;
  height: 48px !important;
  margin: 0.25rem auto;
  padding: 0 !important;
  border: none;
  color: #64748b;
  transition: all 0.2s ease;

  :deep(.p-button-icon) {
    font-size: 1.25rem;
  }

  &:hover {
    background-color: #f1f5f9 !important;
    color: #0f172a !important;
  }

  &.active {
    background-color: #e0e7ff !important;
    color: #4f46e5 !important;
  }
}

/* HEADER --- */
.verona-header {
  --background: #ffffff;
  background-color: #ffffff;
  position: relative;
  z-index: 999 !important;
  contain: none !important;
  overflow: visible !important;
  pointer-events: auto;

  .header-toolbar {
    --background: transparent;
    --min-height: 70px;
    --padding-start: 1.5rem;
    --padding-end: 1.5rem;
    contain: none !important;
    overflow: visible !important;
    pointer-events: auto;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-actions {
  margin-inline-end: 0;
}

.profile-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.35rem 0.65rem 0.35rem 0.35rem;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;

  &:hover {
    border-color: #c7d2fe;
    background: #f8fafc;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);
  }

  &:focus-visible {
    outline: 2px solid #818cf8;
    outline-offset: 2px;
  }
}

.profile-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.25;
  min-width: 0;
}

.profile-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
  white-space: nowrap;
}

.profile-role {
  font-size: 0.75rem;
  color: #64748b;
  white-space: nowrap;
}

.profile-chevron {
  flex-shrink: 0;
  font-size: 0.95rem;
  color: #94a3b8;
  transition: transform 0.2s ease;
}

.profile-trigger:hover .profile-chevron {
  color: #6366f1;
}

/* NỘI DUNG CHÍNH */
#main-content {
  background: #ffffff;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.verona-content {
  --background: transparent;
  flex: 1;
  min-height: 0;
}

.content-wrapper {
  background-color: #f8fafc;
  border-top-left-radius: 30px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  border-top: 1px solid #e2e8f0;
  border-left: 1px solid #e2e8f0;
  position: relative;
  z-index: 1;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.1);
}

.scrollable-area {
  flex: 1;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  padding: 0 2rem;
  display: flex;
  flex-direction: column;
}

.content-card {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  &:has(.list-exit-interview-page:not(.ion-page-hidden)) {
    overflow: hidden;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: #94a3b8;
  }

  ion-router-outlet {
    position: relative;
    flex: 1;
    min-height: 0;
    display: block;
    contain: none;
  }

  :deep(ion-router-outlet > .ion-page.ion-page-hidden) {
    display: none !important;
    pointer-events: none;
  }

  :deep(ion-router-outlet > .ion-page:not(.ion-page-hidden)) {
    position: relative !important;
    flex: 1;
    display: flex !important;
    flex-direction: column;
    width: 100%;
    min-height: 100%;
    contain: none !important;
    overflow: auto !important;
    background: transparent !important;
  }
}

/* --- BREADCRUMB --- */
.breadcrumb-wrapper {
  flex-shrink: 0;
  padding: 0.5rem 0;
}

.app-breadcrumbs {
  --color: #64748b;
  --color-active: #0f172a;
  --separator-color: #94a3b8;
  --separator-size: 0.875rem;
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.25;
}

:deep(.app-breadcrumbs ion-breadcrumb) {
  &::part(separator) {
    margin-inline: 0;
    opacity: 0.85;
  }

  &::part(native) {
    padding: 0.2rem 0.35rem;
    border-radius: 6px;
    transition: background-color 0.15s ease, color 0.15s ease;
  }
}

.breadcrumb-item__inner {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  max-width: 100%;
  padding: 0.28rem 0.55rem;
  border-radius: 6px;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.15s ease;
}

.breadcrumb-item__icon {
  font-size: 1rem;
  color: #6366f1;
  flex-shrink: 0;
  transition: color 0.2s ease, transform 0.15s ease;
}

.breadcrumb-item__label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 16rem;
  transition: color 0.2s ease;
  font-size: 1.3rem;
}

:deep(.breadcrumb-item--home) {
  cursor: pointer;

  &::part(native) {
    color: #0f172a;
  }

  @media (hover: hover) {

    &:hover::part(native),
    &:focus-visible::part(native) {
      background: transparent;
      color: #0f172a;
    }

    &:hover .breadcrumb-item__inner,
    &:focus-visible .breadcrumb-item__inner {
      color: #0f172a;
      transform: translateY(-1px);
    }

    &:hover .breadcrumb-item__icon,
    &:focus-visible .breadcrumb-item__icon {
      color: #4f46e5;
      transform: scale(1.08);
    }

    &:hover .breadcrumb-item__label,
    &:focus-visible .breadcrumb-item__label {
      color: #0f172a;
    }
  }
}

:deep(.breadcrumb-item--clickable:not(.breadcrumb-item--active)) {
  cursor: pointer;

  &::part(native) {
    color: #0f172a;
  }

  @media (hover: hover) {

    &:hover .breadcrumb-item__inner,
    &:focus-visible .breadcrumb-item__inner {
      color: #0f172a;
      transform: translateY(-1px);
    }

    &:hover .breadcrumb-item__label,
    &:focus-visible .breadcrumb-item__label {
      color: #0f172a;
      font-weight: 600;
    }
  }
}

:deep(.breadcrumb-item--active) {
  cursor: default;

  &::part(native) {
    color: #0f172a;
    font-weight: 600;
    background: transparent;
  }
}

/* --- FOOTER TRONG CONTENT --- */
.layout-footer {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  color: #64748b;
  font-size: 0.875rem;

  &__logo {
    height: 40px;
    width: auto;
    max-width: 140px;
    object-fit: contain;
    padding-bottom: 15px;
  }

  .copyright {
    width: fit-content;
    padding-bottom: 15px;
  }
}
</style>

<style lang="scss">
.profile-popover {
  --width: 268px;
  --box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
  --backdrop-opacity: 0.18;
}

.profile-popover__content {
  --background: #fff;
  --padding-top: 0;
  --padding-bottom: 0;
}

.profile-popover__header {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 1rem 0.85rem;
  border-bottom: 1px solid #f1f5f9;
}

.profile-popover__info {
  min-width: 0;
}

.profile-popover__name {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.3;
}

.profile-popover__role {
  margin: 0.15rem 0 0;
  font-size: 0.8125rem;
  color: #64748b;
}

.profile-popover__menu {
  padding: 0.35rem;
  background: transparent;
}

.profile-popover__change-password {
  --background: transparent;
  --background-hover: #eef2ff;
  --background-focused: #eef2ff;
  --border-radius: 10px;
  --padding-start: 12px;
  --min-height: 44px;
  font-size: 1rem;
  font-weight: 500;

  ion-icon {
    font-size: 1.2rem !important;
    margin-inline-end: 10px;
  }

  ion-label {
    font-size: 1rem !important;
  }
}

.profile-popover__logout {
  --background: transparent;
  --background-hover: #fef2f2;
  --background-focused: #fef2f2;
  --border-radius: 10px;
  --padding-start: 12px;
  --min-height: 44px;
  font-size: 1rem;
  font-weight: 500;

  ion-icon {
    color: #ef4444;
    font-size: 1.2rem !important;
    margin-inline-end: 10px;
  }

  ion-label {
    font-size: 1rem !important;
    color: #dc2626 !important;
  }
}
</style>