<template>
  <ion-page>
    <ion-split-pane content-id="main-content" :disabled="isIpadMode" when="md" class="layout-container">
      <ion-menu v-show="!isIpadMode" content-id="main-content" type="overlay" class="verona-sidebar">
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

        <ion-header v-show="!isIpadMode" class="ion-no-border verona-header">
          <ion-toolbar class="header-toolbar">
            <ion-buttons slot="start" class="header-left">
              <ion-menu-button class="ion-hide-md-up"></ion-menu-button>
            </ion-buttons>

            <ion-buttons slot="end">
              <ion-chip class="profile-chip" @click="isDropdownOpen = !isDropdownOpen">
                <ion-avatar>
                  <img alt="User Avatar" src="https://i.pravatar.cc/100?img=3" />
                </ion-avatar>
                <div class="profile-info ion-hide-sm-down">
                  <span class="name">Thuận Cheat</span>
                  <span class="role">Developer</span>
                </div>
                <ion-icon :icon="chevronDownOutline" class="dropdown-icon ion-hide-sm-down"></ion-icon>
              </ion-chip>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content :class="isIpadMode ? 'ipad-fullscreen' : 'verona-content'">
          <div class="content-wrapper">
            <div class="breadcrumb-wrapper" v-show="!isIpadMode">
              <ion-breadcrumbs>
                <ion-breadcrumb @click="router.push('/dashboard')" class="breadcrumb-link">
                  <ion-icon :icon="homeOutline"></ion-icon>
                  Dashboard
                </ion-breadcrumb>
                <ion-breadcrumb v-if="route.path !== '/dashboard'" active>
                  {{ currentRouteTitle }}
                </ion-breadcrumb>
              </ion-breadcrumbs>
            </div>

            <div :class="isIpadMode ? 'ipad-card' : 'content-card'">
              <ion-router-outlet></ion-router-outlet>
            </div>

            <footer class="layout-footer" v-show="!isIpadMode">
              <div class="copyright">© 2026 IT Jia Hsin</div>
            </footer>
          </div>
        </ion-content>

        <div v-show="isDropdownOpen" class="dropdown-overlay" @click.stop="isDropdownOpen = false"></div>

        <div v-show="isDropdownOpen" class="normal-dropdown">
          <button class="dropdown-item text-danger" @click.stop="handleLogout">
            <ion-icon :icon="logOutOutline"></ion-icon>
            <span>Đăng xuất</span>
          </button>
        </div>
      </ion-page>
    </ion-split-pane>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {
  IonSplitPane, IonMenu, IonList, IonPage,
  IonHeader, IonToolbar, IonButtons, IonMenuButton, IonRouterOutlet,
  IonContent, IonMenuToggle, isPlatform, IonChip, IonAvatar,
  IonIcon, IonBreadcrumbs, IonBreadcrumb,
} from '@ionic/vue';
import { useRouter, useRoute } from 'vue-router';
import {
  chevronDownOutline, homeOutline, settingsOutline,
  logOutOutline
} from 'ionicons/icons';

const router = useRouter();
const route = useRoute();
const isIpadMode = ref(isPlatform('tablet') || isPlatform('capacitor'));

const isDropdownOpen = ref(false);

const handleLogout = () => {
  router.push('/login');
};

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: homeOutline },
  // { title: 'Exit Interview', url: '/formExit', icon: documentTextOutline },
  { title: '404', url: '/404', icon: settingsOutline },
];

const currentRouteTitle = computed(() => {
  switch (route.path) {
    case '/dashboard': return 'Dashboard';
    // case '/formExit': return 'Exit Interview';
    case '/settings': return 'Settings';
    default: return 'Current View';
  }
});

onMounted(() => {
  if (isIpadMode.value) {
    router.replace('/formExit');
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
  /* Thêm dòng này */

  .header-toolbar {
    --background: transparent;
    --min-height: 70px;
    --padding-start: 1.5rem;
    --padding-end: 1.5rem;
    contain: none !important;
    overflow: visible !important;
    pointer-events: auto;
    /* Thêm dòng này */
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
}

.verona-content {
  --background: transparent;
}

.content-wrapper {
  background-color: #f8fafc;
  border-top-left-radius: 30px;
  padding: 2rem 2rem 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-top: 1px solid #e2e8f0;
  border-left: 1px solid #e2e8f0;
  position: relative;
  z-index: 1;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.content-card {
  background-color: #ffffff;
  border-radius: 30px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  margin-bottom: 0.5rem;

  ion-router-outlet {
    height: 100%;
    width: 100%;
  }
}

/* --- CUSTOM BREADCRUMB IONIC --- */
.breadcrumb-wrapper {
  margin-bottom: 1.5rem;

  ion-breadcrumbs {
    /* Đổi màu chữ cho đường dẫn chưa active (màu xám nhạt) */
    --color: #64748b;
    /* Đổi màu chữ cho đường dẫn active (màu đen/đậm) */
    --color-active: #0f172a;
    /* Đổi màu biểu tượng phân cách (dấu /) */
    --separator-color: #cbd5e1;

    font-size: 0.875rem;
    font-weight: 500;
  }

  /* Tạo hiệu ứng con trỏ cho thư mục gốc */
  .breadcrumb-link {
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: #0f172a;
      /* Hover vào Dashboard sẽ sáng lên */
    }

    ion-icon {
      margin-right: 4px;
      font-size: 1.1rem;
    }
  }
}

/* --- FOOTER TRONG CONTENT --- */
.layout-footer {
  display: flex;
  justify-content: end;
  align-items: center;
  padding-top: 1rem;
  color: #64748b;
  font-size: 0.875rem;

  .copyright {
    width: fit-content;
    padding-bottom: 15px;
  }
}

/* --- CUSTOM DROPDOWN BÌNH THƯỜNG --- */
.profile-dropdown-wrapper {
  position: relative;
}

/* --- CUSTOM DROPDOWN BÌNH THƯỜNG --- */
.dropdown-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
}

/* Khung menu thả xuống */
.normal-dropdown {
  position: absolute;
  top: 70px;
  right: 1.5rem;
  margin-top: 8px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  min-width: 160px;
  z-index: 1000;
  overflow: hidden;
}

/* Nút bấm bên trong dropdown */
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1.25rem;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.dropdown-item i {
  font-size: 1.1rem;
}

/* Style cho nút đăng xuất */
.dropdown-item.text-danger {
  color: #e11d48;
}

.dropdown-item:hover {
  background-color: #fff1f2;
}

/* --- CHẾ ĐỘ IPAD / KIOSK --- */
.ipad-fullscreen {
  --background: #ffffff;
  --padding-top: 0px;
  --padding-bottom: 0px;

  display: flex;
  flex-direction: column;

  &::part(scroll) {
    padding-top: 0 !important;
    margin-top: 0 !important;
  }
}

/* Khung chứa cho chế độ iPad */
.ipad-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.ipad-card {
  flex: 1;
  position: relative;
  width: 100%;
  height: 100%;
}
</style>