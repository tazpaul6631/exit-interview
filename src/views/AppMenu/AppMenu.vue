<template>
  <ion-page class="app-menu-page">
    <ion-content class="app-menu-content" :fullscreen="true">
      <div class="app-menu">
        <header class="app-menu__top">
          <LocaleSelect class="app-menu__locale" variant="popover" input-id="app-menu-locale" append-to="body" />
        </header>

        <section class="app-menu__hero">
          <div class="hero-card">
            <div class="hero-card__backdrop" aria-hidden="true"></div>
            <div class="hero-card__logo">
              <img :src="APP_LOGO_URL" :alt="APP_LOGO_ALT" class="hero-card__logo-img" />
            </div>
            <div class="hero-card__content">
              <h1 class="hero-card__title">{{ t('app.title') }}</h1>
              <span class="hero-card__divider" aria-hidden="true"></span>
              <p class="hero-card__subtitle">{{ t('app_menu.subtitle') }}</p>
            </div>
          </div>
        </section>

        <section class="app-menu__actions">
          <button type="button" class="menu-card" @click="goToFormExit">
            <div class="menu-card__icon">
              <ion-icon :icon="documentTextOutline" />
            </div>
            <div class="menu-card__body">
              <h3>{{ t('app_menu.exit_interview_title') }}</h3>
              <p>{{ t('app_menu.exit_interview_desc') }}</p>
            </div>
            <div class="menu-card__arrow">
              <ion-icon :icon="chevronForwardOutline" />
            </div>
          </button>
        </section>

        <footer class="app-menu__footer">
          <p>{{ t('app_menu.footer') }}</p>
        </footer>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonIcon } from '@ionic/vue';
import { chevronForwardOutline, documentTextOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { APP_LOGO_ALT, APP_LOGO_URL } from '@/constants/branding';
import LocaleSelect from '@/components/LocaleSelect.vue';

const router = useRouter();
const { t } = useI18n();

const goToFormExit = () => {
  void router.push('/formExit');
};
</script>

<style scoped lang="scss">
.app-menu-content {
  --background: transparent;
}

.app-menu {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  padding: max(16px, env(safe-area-inset-top)) 20px max(24px, env(safe-area-inset-bottom));
  background:
    radial-gradient(ellipse 120% 80% at 50% -20%, rgba(49, 130, 206, 0.18), transparent 55%),
    linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
}

.app-menu__top {
  display: flex;
  margin-bottom: 8px;
  width: 100%;
  justify-content: flex-end;
}

.app-menu__locale {
  width: 15%;
}

.app-menu__hero {
  padding: 4px 0 24px;
}

.hero-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 420px;
  margin: 0 auto;
  padding: 28px 24px 26px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.85);
  box-shadow:
    0 16px 40px rgba(49, 130, 206, 0.1),
    0 4px 14px rgba(15, 23, 42, 0.05);
  overflow: hidden;
  backdrop-filter: blur(12px);
  flex-direction: row;
  justify-content: space-evenly;
}

.hero-card__backdrop {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 0%, rgba(49, 130, 206, 0.12), transparent 58%),
    linear-gradient(180deg, rgba(237, 242, 247, 0.5) 0%, transparent 100%);
  pointer-events: none;
}

.hero-card__logo {
  position: relative;
  z-index: 1;
  width: 100px;
  height: 100px;

  &::before {
    content: '';
    position: absolute;
    inset: -5px;
    border-radius: 27px;
    background: linear-gradient(145deg, #3182ce 0%, #90cdf4 100%);
    opacity: 0.22;
  }
}

.hero-card__logo-img {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  border-radius: 22px;
  background: #fff;
  box-shadow: 0 8px 20px rgba(49, 130, 206, 0.18);
}

.hero-card__content {
  position: relative;
  z-index: 1;
  text-align: center;
  margin-left: 16px;
}

.hero-card__title {
  margin: 0;
  font-size: clamp(1.5rem, 5vw, 1.75rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.2;
  color: #3182ce;
}

.hero-card__divider {
  display: block;
  width: 48px;
  height: 4px;
  margin: 14px auto 12px;
  border-radius: 999px;
  background: linear-gradient(90deg, #3182ce, #63b3ed);
}

.hero-card__subtitle {
  margin: 0 auto;
  max-width: 300px;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #3182ce;
}

.app-menu__actions {
  flex: 1;
  max-width: 480px;
  width: 100%;
  margin: 0 auto;
}

.app-menu__section-label {
  margin: 0 0 12px 4px;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #94a3b8;
}

.menu-card {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 18px 16px;
  border: none;
  border-radius: 18px;
  background: #fff;
  text-align: left;
  cursor: pointer;
  box-shadow:
    0 8px 24px rgba(15, 23, 42, 0.06),
    0 1px 2px rgba(15, 23, 42, 0.04);
  transition: transform 0.18s ease, box-shadow 0.18s ease;

  &:active {
    transform: scale(0.985);
  }

  &:focus-visible {
    outline: 2px solid #3182ce;
    outline-offset: 2px;
  }
}

.menu-card__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  color: #3182ce;
  background: color-mix(in srgb, #3182ce 12%, white);

  ion-icon {
    font-size: 1.6rem;
  }
}

.menu-card__body {
  flex: 1;
  min-width: 0;

  h3 {
    margin: 0 0 4px;
    font-size: 1.2rem;
    font-weight: 700;
    color: #3182ce;
  }

  p {
    margin: 0;
    font-size: 1rem;
    line-height: 1.6;
    color: #3182ce;
  }
}

.menu-card__arrow {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  color: #3182ce;
  background: #edf2f7;

  ion-icon {
    font-size: 1.125rem;
  }
}

.app-menu__footer {
  margin-top: auto;
  padding-top: 32px;
  text-align: center;

  p {
    margin: 0;
    font-size: 0.8125rem;
    color: #a0aec0;
  }
}

@media (min-width: 768px) {
  .app-menu {
    padding-inline: 32px;
  }

  .app-menu__hero {
    padding-top: 12px;
    padding-bottom: 32px;
  }

  .menu-card:hover {
    transform: translateY(-2px);
    box-shadow:
      0 14px 32px rgba(49, 130, 206, 0.12),
      0 4px 12px rgba(15, 23, 42, 0.06);
  }
}
</style>
