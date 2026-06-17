<template>
  <div class="desktop-layout">
    <div class="banner-side">
      <div class="banner-lottie" aria-hidden="true">
        <DotLottieVue class="banner-lottie__player" src="/assets/animations/logo-left-login.lottie" autoplay loop
          :speed="0.85" :layout="{ fit: 'contain', align: [0.5, 0.5] }" />
      </div>
      <div class="banner-overlay"></div>
      <div class="banner-content animate__animated animate__fadeInUp">
        <h1>{{ t('login.banner_title') }}</h1>
        <div class="divider"></div>
        <h2>{{ t('login.banner_subtitle') }}</h2>
        <p>{{ t('login.banner_dept') }}</p>
      </div>
    </div>

    <div class="form-side">
      <LocaleSelect variant="login" input-id="login-language" />

      <div class="form-side__panel animate__animated animate__fadeInRight">
        <div class="form-header">
          <div class="logo-wrap">
            <img :src="APP_LOGO_URL" :alt="APP_LOGO_ALT" class="form-logo" />
          </div>
          <h3>{{ t('login.greeting') }}</h3>
          <p>{{ t('login.subtitle') }}</p>
        </div>

        <form class="login-form" @submit.prevent="onLoginSubmit">
          <div class="field">
            <label for="login-code" class="field-label">
              {{ t('login.code_label') }} <span class="field-required">*</span>
            </label>
            <IconField iconPosition="left" class="login-icon-field">
              <InputText id="login-code" v-model="code" :placeholder="t('login.code_placeholder')" class="login-input"
                :invalid="submitCount > 0 && !!errors.code" autocomplete="username" fluid />
            </IconField>
          </div>

          <div class="field">
            <label for="login-password" class="field-label">
              {{ t('login.password_label') }} <span class="field-required">*</span>
            </label>
            <IconField iconPosition="left" class="login-icon-field">
              <Password id="login-password" v-model="password" :placeholder="t('login.password_placeholder')"
                class="login-input login-password" :invalid="submitCount > 0 && !!errors.password" toggle-mask
                :feedback="false" autocomplete="current-password" fluid />
            </IconField>
          </div>

          <Button type="submit" :label="t('login.submit')" icon="pi pi-arrow-right" icon-pos="right"
            class="w-full login-btn" :loading="loading" />
        </form>

        <div class="footer-text">
          <p>{{ t('login.footer') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { DotLottieVue } from '@lottiefiles/dotlottie-vue';
import { APP_LOGO_ALT, APP_LOGO_URL } from '@/constants/branding';
import LocaleSelect from '@/components/LocaleSelect.vue';

defineProps<{
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'login', payload: { code: string; password: string }): void;
}>();

const toast = useToast();
const { t } = useI18n();

const showToast = (
  severity: 'success' | 'info' | 'warn' | 'error',
  summary: string,
  detail?: string,
) => {
  toast.add({
    severity,
    summary,
    detail: detail ?? summary,
    life: 3000,
  });
};

const loginSchema = computed(() =>
  toTypedSchema(
    z.object({
      code: z
        .string({ required_error: t('login.errors.code_required') })
        .trim()
        .min(1, t('login.errors.code_required'))
        .max(50, t('login.errors.code_max')),
      password: z
        .string({ required_error: t('login.errors.password_required') })
        .min(1, t('login.errors.password_required'))
        .max(100, t('login.errors.password_max')),
    }),
  ),
);

const { handleSubmit, submitCount, errors } = useForm({
  validationSchema: loginSchema,
  initialValues: {
    code: '',
    password: '',
  },
});

const { value: code } = useField<string>('code');
const { value: password } = useField<string>('password');

const onLoginSubmit = handleSubmit(
  (values) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    emit('login', {
      code: values.code.trim(),
      password: values.password,
    });
  },
  ({ errors: formErrors }) => {
    const messages = [formErrors.code, formErrors.password].filter(Boolean);
    if (messages.length === 0) return;

    showToast('warn', t('login.check_form'), messages.join('\n'));
  },
);
</script>

<style scoped>
.desktop-layout {
  display: flex;
  height: 100vh;
  background-color: #f0f2f5;
}

.banner-side {
  flex: 7;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  overflow: hidden;
  background:
    radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.18), transparent 42%),
    radial-gradient(circle at 80% 80%, rgba(56, 189, 248, 0.14), transparent 40%),
    linear-gradient(145deg, #eef2ff 0%, #f8fafc 45%, #e0e7ff 100%);
}

.banner-lottie {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(32px, 6vw, 72px);
  pointer-events: none;
}

.banner-lottie__player {
  display: block;
  width: min(90%, 640px);
  height: min(78vh, 640px);
  filter: drop-shadow(0 24px 48px rgba(79, 70, 229, 0.12));
}

.banner-lottie__player :deep(canvas) {
  width: 100% !important;
  height: 100% !important;
}

.banner-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(180deg,
      rgba(255, 255, 255, 0.05) 0%,
      rgba(255, 255, 255, 0.35) 55%,
      rgba(248, 250, 252, 0.92) 100%);
  pointer-events: none;
}

.banner-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 32px 40px 48px;
  margin-bottom: auto;
  margin-left: auto;
  margin-right: auto;
  margin-top: 20px;
  align-self: flex-end;
  width: 100%;
  max-width: 720px;
}

.banner-content h1 {
  font-size: 3rem;
  font-weight: 800;
  margin: 0 0 10px;
  letter-spacing: 0.04em;
  color: #587bb4;
  line-height: 1.2;
  white-space: nowrap;
}

.divider {
  width: 64px;
  height: 4px;
  background: linear-gradient(90deg, #6366f1, #38bdf8);
  margin: 16px auto 18px;
  border-radius: 999px;
}

.banner-content h2 {
  font-size: clamp(1rem, 1.8vw, 1.35rem);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: #4f46e5;
  margin: 0 0 10px;
}

.banner-content p {
  margin: 0;
  font-size: 1.2rem;
  color: #64748b;
  letter-spacing: 0.02em;
}

.form-side {
  flex: 5;
  align-self: stretch;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: clamp(20px, 4vw, 48px);
  overflow: hidden;
  background:
    radial-gradient(circle at 85% 15%, rgba(99, 102, 241, 0.1), transparent 38%),
    linear-gradient(160deg, #ffffff 0%, #f8fafc 55%, #f1f5f9 100%);
}

.form-side__panel {
  position: relative;
  width: 100%;
  max-width: 440px;
  padding: clamp(28px, 4vw, 40px);
  padding-top: clamp(52px, 8vw, 60px);
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow:
    0 4px 6px rgba(15, 23, 42, 0.04),
    0 20px 48px rgba(79, 70, 229, 0.08);
}

.form-header {
  margin-bottom: 28px;
  text-align: center;
}

.logo-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: min(220px, 72%);
  height: 150px;
  margin: 0 auto 18px;
}

.form-logo {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.form-header h3 {
  font-size: 1.5rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: #4f46e5;
  margin: 0 0 10px;
}

.form-header p {
  color: #64748b;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
  margin-inline: auto;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 1.2rem;
  font-weight: 600;
  color: #475569;
  letter-spacing: 0.02em;
}

.field-required {
  color: #ef4444;
}

.login-icon-field {
  width: 100%;
}

.login-input {
  width: 100%;
}

:deep(.login-icon-field .p-inputicon) {
  color: #94a3b8;
  font-size: 1rem;
}

:deep(.login-input.p-inputtext),
:deep(.login-password .p-password-input) {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  border-color: #e2e8f0;
  background: #f8fafc;
  font-size: 0.9375rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

:deep(.login-input.p-inputtext:enabled:hover),
:deep(.login-password .p-password-input:enabled:hover) {
  border-color: #cbd5e1;
  background: #ffffff;
}

:deep(.login-input.p-inputtext:enabled:focus),
:deep(.login-password .p-password-input:enabled:focus) {
  border-color: #6366f1;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

:deep(.login-password.p-password) {
  width: 100%;
}

:deep(.login-password .p-password-toggle-mask-icon) {
  color: #94a3b8;
}

.login-btn {
  margin-top: 6px;
  height: 50px;
  font-weight: 700;
  font-size: 0.9375rem;
  letter-spacing: 0.04em;
  border-radius: 12px;
  border: none;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    box-shadow: 0 12px 28px rgba(67, 233, 136, 0.34);
    transform: translateY(-1px);
  }
}

.footer-text {
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
  text-align: center;
  color: #94a3b8;
  font-size: 0.8125rem;
}

.footer-text p {
  margin: 0;
  line-height: 1.5;
}

@media (max-width: 960px) {
  .desktop-layout {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
  }

  .banner-side {
    flex: none;
    min-height: 42vh;
  }

  .form-side {
    flex: 1;
    min-height: auto;
    padding: 24px 20px 32px;
  }

  .banner-lottie__player {
    width: min(88%, 480px);
    height: min(50vh, 420px);
  }

  .form-side__panel {
    max-width: 480px;
  }

  .banner-content {
    padding: 24px 20px 32px;
  }
}
</style>