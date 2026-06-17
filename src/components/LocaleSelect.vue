<template>
  <div class="locale-select" :class="[`locale-select--${variant}`]" @click="onWrapPointer" @mousedown="onWrapPointer">
    <!-- <label v-if="showLabel" :for="inputId" class="locale-select__label">{{ label }}</label> -->
    <Select :id="inputId" v-model="selectedLanguage" :options="languages" optionLabel="name" optionValue="code"
      :appendTo="appendTo" class="locale-select__control" :aria-label="ariaLabel" @change="onChange">
      <template #value="{ value }">
        <div v-if="value" class="locale-select__value">
          <img :src="getLocaleByCode(value)?.icon" alt="" class="locale-select__flag" />
          <span>{{ getLocaleByCode(value)?.name }}</span>
        </div>
        <span v-else class="locale-select__placeholder">{{ placeholder }}</span>
      </template>
      <template #option="{ option }">
        <div class="locale-select__option">
          <img :src="option.icon" alt="" class="locale-select__flag" />
          <span>{{ option.name }}</span>
        </div>
      </template>
    </Select>
  </div>
</template>

<script setup lang="ts">
import { useAppLocale } from '@/composables/useAppLocale';

const props = withDefaults(
  defineProps<{
    variant?: 'popover' | 'login';
    showLabel?: boolean;
    label?: string;
    placeholder?: string;
    inputId?: string;
    appendTo?: 'body' | 'self';
    stopPropagation?: boolean;
    ariaLabel?: string;
  }>(),
  {
    variant: 'popover',
    showLabel: false,
    label: 'Ngôn ngữ',
    placeholder: 'Chọn ngôn ngữ',
    inputId: 'app-language',
    appendTo: 'body',
    stopPropagation: false,
    ariaLabel: 'Chọn ngôn ngữ',
  },
);

const emit = defineEmits<{
  change: [code: string];
}>();

const { selectedLanguage, languages, getLocaleByCode } = useAppLocale();

const onWrapPointer = (event: Event) => {
  if (props.stopPropagation) {
    event.stopPropagation();
  }
};

const onChange = () => {
  emit('change', selectedLanguage.value);
};
</script>

<style scoped lang="scss">
.locale-select {
  width: 100%;
}

.locale-select__label {
  display: block;
  margin-bottom: 0.35rem;
  padding-inline: 0.35rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.locale-select__control {
  width: 100%;
}

.locale-select__control :deep(.p-select-label) {
  padding-block: 0.55rem;
}

.locale-select__value,
.locale-select__option {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.locale-select__value span,
.locale-select__option span {
  font-size: 0.875rem;
}

.locale-select__placeholder {
  color: #94a3b8;
}

.locale-select__flag {
  width: 24px;
  height: 16px;
  object-fit: cover;
  border-radius: 2px;
  flex-shrink: 0;
  box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.08);
}

.locale-select--popover {
  padding-right: 0.5rem;
}

.locale-select--login {
  position: absolute;
  top: clamp(12px, 2vw, 18px);
  right: clamp(12px, 2vw, 18px);
  width: min(168px, 42%);
  z-index: 1;
}

.locale-select--login .locale-select__control :deep(.p-select-label) {
  padding-block: 0.45rem;
  font-size: 0.875rem;
}

.locale-select--login .locale-select__flag {
  width: 22px;
  height: 14px;
}
</style>
