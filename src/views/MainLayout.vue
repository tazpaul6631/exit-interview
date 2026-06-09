<template>
  <ion-page>
    <ion-split-pane content-id="main-content" when="md" class="layout-container">
      <ion-menu content-id="main-content" type="overlay" class="verona-sidebar">
        <ion-content class="sidebar-content">
          <div class="sidebar-container">
            <div class="sidebar-top">
              <div class="logo-box">
                <img src="/assets/icon/icon1.png" alt="logo-company">
              </div>

              <div class="sidebar-menu">
                <ion-list lines="none" class="menu-list">
                  <ion-menu-toggle :auto-hide="false" v-for="item in menuItems" :key="item.title">
                    <router-link :to="item.url" custom v-slot="{ navigate, isActive }">
                      <button @click="navigate" :class="['nav-item', { 'active': isActive }]" :title="item.title">
                        <ion-icon :icon="item.icon" />
                      </button>
                    </router-link>
                  </ion-menu-toggle>
                </ion-list>
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

            <ion-buttons slot="end">
              <ion-chip id="profile-trigger" class="profile-chip">
                <ion-avatar>
                  <img alt="User Avatar" src="https://i.pravatar.cc/100?img=3" />
                </ion-avatar>
                <div class="profile-info ion-hide-sm-down">
                  <span class="name">Thuận Cheat</span>
                  <span class="role">Developer</span>
                </div>
                <ion-icon :icon="chevronDownOutline" class="dropdown-icon ion-hide-sm-down"></ion-icon>
              </ion-chip>

              <ion-popover trigger="profile-trigger" dismiss-on-select="true">
                <ion-content>
                  <ion-list lines="none" class="ion-no-padding">
                    <ion-item button @click="handleLogout" :detail="false">
                      <ion-icon :icon="logOutOutline" slot="start" color="danger"></ion-icon>
                      <ion-label color="danger">Đăng xuất</ion-label>
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
              <nav class="breadcrumb-wrapper" aria-label="Breadcrumb">
                <ion-breadcrumbs class="app-breadcrumbs">
                  <ion-breadcrumb class="breadcrumb-item breadcrumb-item--home" @click="router.push('/dashboard')">
                    <span class="breadcrumb-item__inner">
                      <ion-icon :icon="homeOutline" class="breadcrumb-item__icon" aria-hidden="true" />
                      <span class="breadcrumb-item__label">Dashboard</span>
                    </span>
                  </ion-breadcrumb>
                  <ion-breadcrumb v-for="(item, index) in breadcrumbs" :key="item.title" class="breadcrumb-item"
                    :class="{ 'breadcrumb-item--active': index === breadcrumbs.length - 1, 'breadcrumb-item--clickable': !!item.path }"
                    :active="index === breadcrumbs.length - 1" @click="item.path && router.push(item.path)">
                    <span class="breadcrumb-item__inner">
                      <span class="breadcrumb-item__label">{{ item.title }}</span>
                    </span>
                  </ion-breadcrumb>
                </ion-breadcrumbs>
              </nav>

              <div class="content-card">
                <ion-router-outlet></ion-router-outlet>
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
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  IonSplitPane, IonMenu, IonList, IonPage,
  IonHeader, IonToolbar, IonButtons, IonMenuButton, IonRouterOutlet,
  IonContent, IonMenuToggle, IonChip, IonAvatar,
  IonIcon, IonBreadcrumbs, IonBreadcrumb, IonPopover, IonLabel, IonItem
} from '@ionic/vue';
import { useRouter, useRoute } from 'vue-router';
import {
  chevronDownOutline, homeOutline, settingsOutline,
  logOutOutline,
  documentTextOutline
} from 'ionicons/icons';

import { useAuthStore } from '@/store/auth';

const router = useRouter();
const route = useRoute();

// 2. Khởi tạo store
const authStore = useAuthStore();

const handleLogout = async () => {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  await authStore.logout();
};

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: homeOutline },
  // { title: 'FormCRUD', url: '/form-crud', icon: documentTextOutline },
  { title: 'ListExitInterview', url: '/list-exit-interview', icon: documentTextOutline },
  { title: '404', url: '/404', icon: settingsOutline },
];

interface BreadcrumbItem {
  title: string;
  path?: string;
}

const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  if (route.path.startsWith('/detail-exit-interview')) {
    return [
      { title: 'Dữ Liệu Nghỉ Việc', path: '/list-exit-interview' },
      { title: 'Chi Tiết Đơn Nghỉ Việc' },
    ];
  }

  switch (route.path) {
    case '/list-exit-interview':
      return [{ title: 'Dữ Liệu Nghỉ Việc' }];
    case '/404':
      return [{ title: '404' }];
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
  width: 42px;
  height: 42px;
}

.menu-list {
  background: transparent;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}

.nav-item {
  background: transparent;
  border: none;
  width: 48px;
  height: 48px;
  margin: 0.25rem auto;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 50%;

  ion-icon {
    font-size: 1.25rem;
  }

  &:hover {
    background-color: #f1f5f9;
    color: #0f172a;
  }

  &.active {
    background-color: #e0e7ff;
    color: #4f46e5;
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

/* --- PROFILE CHIP & DROPDOWN --- */
.profile-chip {
  --background: transparent;
  border-radius: 30px;
  padding: 0.25rem 0.5rem 0.25rem 0.25rem;
  height: auto;
  gap: 0.75rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    --background: #f1f5f9;
  }

  ion-avatar {
    width: 36px;
    height: 36px;

    &:first-child {
      margin-inline: 0;
    }
  }

  .profile-info {
    display: flex;
    flex-direction: column;
    text-align: left;
    line-height: 1.2;

    .name {
      font-size: 0.875rem;
      font-weight: 600;
      color: #0f172a;
    }

    .role {
      font-size: 0.75rem;
      color: #64748b;
    }
  }

  .dropdown-icon {
    font-size: 1rem;
    color: #64748b;
  }
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
    display: block;
    contain: none;
  }

  :deep(.ion-page:not(.ion-page-hidden)) {
    position: relative !important;
    flex: 1;
    display: flex !important;
    flex-direction: column;
    height: auto !important;
    min-height: 100%;
    contain: none !important;
    overflow: visible !important;
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
      background: white;
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
    height: 36px;
    width: auto;
    object-fit: contain;
    padding-bottom: 15px;
  }

  .copyright {
    width: fit-content;
    padding-bottom: 15px;
  }
}
</style>