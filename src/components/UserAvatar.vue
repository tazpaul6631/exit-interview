<template>
  <span
    class="user-avatar"
    :class="[`user-avatar--${size}`]"
    :style="{ '--avatar-bg': avatarColor }"
    aria-hidden="true"
  >
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { useUserAvatarColor } from '@/composables/useUserAvatarColor';

withDefaults(
  defineProps<{
    label: string;
    size?: 'sm' | 'md' | 'lg';
  }>(),
  {
    size: 'sm',
  },
);

const avatarColor = useUserAvatarColor();
</script>

<style scoped lang="scss">
.user-avatar {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #fff;
  background-color: var(--avatar-bg, #607d8b) !important;
  background-image: none !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22);
  transition: background-color 0.45s ease, box-shadow 0.45s ease;
}

.user-avatar--sm {
  width: 36px;
  height: 36px;
  font-size: 0.8125rem;
}

.user-avatar--md {
  width: 42px;
  height: 42px;
  font-size: 0.875rem;
}

.user-avatar--lg {
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
}
</style>
