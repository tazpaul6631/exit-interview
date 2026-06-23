<template>
  <div :class="isSelectable ? 'dynamic-field-radio' : 'dynamic-field'">
    <div v-if="answer.allowRating" class="rating-card">
      <div class="rating-info">
        <p class="vn">{{ answer.answerName }}</p>
      </div>
      <div class="rating-stars">
        <label v-for="n in (maxRating || 5)" :key="n" class="star-item">
          <input type="radio" :value="n" :checked="Number(fieldValue) === n" @change="fieldValue = n" />
          <span class="num"
            :class="{ 'num-error': submitCount > 0 && errorMessage, 'is-active': Number(fieldValue) === n }">
            {{ n }}
          </span>
        </label>
      </div>
    </div>

    <template v-else-if="isSelectable">
      <label v-if="isRadio" class="pill-radio"
        :class="{ 'active': String(fieldValue) === String(answer.answerId), 'invalid-pill': submitCount > 0 && errorMessage }">
        <input type="radio" :name="'radio_q_' + questionId" :value="answer.answerId"
          :checked="String(fieldValue) === String(answer.answerId)" @change="fieldValue = answer.answerId" />
        <span>{{ answer.answerName }}</span>
      </label>

      <label v-else class="checkbox-card"
        :class="{ 'is-checked': !!fieldValue, 'is-disabled': isCheckboxDisabled, 'is-invalid': submitCount > 0 && errorMessage }">
        <input type="checkbox" v-model="fieldValue" :value="true" :disabled="isCheckboxDisabled" />
        <div class="card-body"><span class="title-vn-cn">{{ answer.answerName }}</span></div>
      </label>
    </template>

    <div v-else-if="answer.allowText" class="text-input-box" :data-answer-id="answer.answerId">
      <p class="text-label" v-if="answer.answerName && answer.answerName !== 'Trả lời/答:'"><span
          class="request">*</span>{{
            answer.answerName }}
      </p>
      <textarea :value="textAnswer" :class="{ 'is-invalid': showTextInvalid }"
        :placeholder="answer.answerName || 'Vui lòng nhập lý do...'" @input="onTextInput"
        @compositionstart="isComposing = true" @compositionend="onTextCompositionEnd"></textarea>
      <p class="error-msg" v-if="textFormatError">{{ textFormatError }}</p>
      <p class="error-msg" v-else-if="submitCount > 0 && errorMessage">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useField, useFormValues, useSubmitCount } from 'vee-validate';
import { computed, onMounted, ref } from 'vue';
import { useModalFieldValidation } from '@/composables/useModalFieldValidation';

const props = defineProps({
  answer: { type: Object, required: true },
  questionId: { type: [Number, String], default: null },
  maxRating: { type: Number, default: 5 },
  maxSelect: { type: Number, default: 2 }
});

const isRadio = computed(() => !!props.questionId);
const isSelectable = computed(() => props.answer.allowCheck || props.answer.allowSelect);

const fieldName = computed(() => {
  if (isRadio.value && isSelectable.value) return `answersData.q_${props.questionId}`;
  return `answersData.${props.answer.answerId}`;
});

const submitCount = useSubmitCount();
const formValues = useFormValues();

// Cấu hình vee-validate cho Radio
const fieldOptions: any = {};
if (isRadio.value && isSelectable.value) {
  fieldOptions.type = 'radio';
  fieldOptions.valueProp = props.answer.answerId;
}

const { value: fieldValue, errorMessage, setValue, setErrors, validate } = useField<any>(() => fieldName.value, undefined, fieldOptions);

const { getNameFormatError } = useModalFieldValidation();
const isComposing = ref(false);
const textFormatError = ref('');

const textAnswer = computed(() => (typeof fieldValue.value === 'string' ? fieldValue.value : ''));

const showTextInvalid = computed(
  () => !!textFormatError.value || (submitCount.value > 0 && !!errorMessage.value),
);

const updateTextFormatError = async (value: string) => {
  const err = getNameFormatError(value);
  textFormatError.value = err;
  setErrors(err);
  await validate();
};

const onTextInput = (event: Event) => {
  if (isComposing.value) return;
  const value = (event.target as HTMLTextAreaElement).value;
  setValue(value);
  updateTextFormatError(value);
};

const onTextCompositionEnd = (event: CompositionEvent) => {
  isComposing.value = false;
  const value = (event.target as HTMLTextAreaElement).value;
  setValue(value);
  updateTextFormatError(value);
};

const currentSelectedCount = computed(() => {
  const data = (formValues.value.answersData || {}) as Record<string, any>;
  // Chỉ đếm các checkbox (không thuộc radio group nào)
  return Object.keys(data).filter(key => !key.startsWith('q_') && data[key] === true).length;
});

const isCheckboxDisabled = computed(() => {
  if (isSelectable.value && !isRadio.value) {
    if (fieldValue.value === true) return false;
    return currentSelectedCount.value >= props.maxSelect;
  }
  return false;
});

onMounted(() => {
  if (fieldValue.value === undefined || fieldValue.value === null) {
    if (props.answer.allowRating) fieldValue.value = props.answer.ratingValue || 5;
    else if (isSelectable.value && isRadio.value && props.answer.checkValue) fieldValue.value = props.answer.answerId;
    else if (isSelectable.value && !isRadio.value) fieldValue.value = props.answer.checkValue || false;
    else if (props.answer.allowText) setValue(String(props.answer.textValue || ''));
  }
});
</script>

<style lang="scss" scoped>
.dynamic-field-radio {
  box-sizing: border-box;
}

.dynamic-field {
  width: 100%;
  box-sizing: border-box;
}

/* -----------------------------
   TEXT & ERRORS
----------------------------- */
.error-msg {
  color: #e53e3e;
  font-size: 14px;
  margin-top: 6px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.text-label {
  display: block;
  color: #2d3748;
  font-weight: 600;
  font-size: 15px;
  margin: 10px 0 8px 4px;

  .request {
    color: red;
    font-size: 17px;
  }
}

textarea {
  width: 100%;
  min-height: 110px;
  padding: 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-family: inherit;
  font-size: 15px;
  color: #2d3748;
  background: #fcfcfc;
  line-height: 1.5;
  transition: all 0.2s ease-in-out;
  resize: vertical;

  &::placeholder {
    color: #a0aec0;
  }

  &:hover {
    border-color: #cbd5e0;
  }

  &:focus {
    border-color: #3182ce;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.15);
    outline: none;
  }

  &.is-invalid {
    border-color: #e53e3e !important;
    background-color: #fff5f5;

    &:focus {
      box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.15);
    }
  }
}

/* -----------------------------
   CHECKBOX CARD
----------------------------- */
.checkbox-card {
  display: flex;
  align-items: flex-start;
  padding: 16px 20px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  background: #ffffff;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  box-sizing: border-box;

  &:hover:not(.is-disabled) {
    border-color: #cbd5e0;
    background-color: #f7fafc;
  }

  /* CSS KHI BỊ DISABLE */
  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: #f7fafc;
    pointer-events: none;
  }

  input[type="checkbox"] {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    margin-right: 14px;
    margin-top: 2px;
    cursor: pointer;
    accent-color: #3182ce;
  }

  .card-body {
    flex: 1;

    .title-vn-cn {
      display: block;
      color: #2d3748;
      font-size: 15px;
      line-height: 1.5;
      font-weight: 500;
    }
  }

  &.is-checked {
    border-color: #3182ce;
    background-color: #ebf8ff;
    box-shadow: 0 2px 8px rgba(49, 130, 206, 0.1);

    .title-vn-cn {
      color: #2b6cb0;
      font-weight: 600;
    }
  }

  &.is-invalid {
    border-color: #e53e3e !important;
    background-color: #fff5f5;

    .title-vn-cn {
      color: #e53e3e;
      font-weight: 600;
    }
  }
}

/* -----------------------------
   RADIO PILL
----------------------------- */
.pill-radio {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  background: #ffffff;
  padding: 12px 24px;
  border-radius: 50px;
  border: 1.5px solid #e2e8f0;
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    border-color: #cbd5e0;
    background: #f7fafc;
  }

  input[type="radio"] {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    margin: 0;
    cursor: pointer;
    accent-color: #3182ce;
  }

  span {
    font-size: 15px;
    font-weight: 500;
    color: #4a5568;
    line-height: 1.4;
  }

  &.invalid-pill {
    border-color: #e53e3e;
    background-color: #fff5f5;

    span {
      color: #e53e3e;
    }
  }

  &.active,
  &:has(input:checked) {
    border-color: #3182ce;
    background: #ebf8ff;
    box-shadow: 0 2px 6px rgba(49, 130, 206, 0.12);

    span {
      color: #2b6cb0;
      font-weight: 700;
    }
  }
}

/* -----------------------------
   RATING CARD
----------------------------- */
.rating-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  width: 100%;
  box-sizing: border-box;
  transition: all 0.2s ease;

  &:hover {
    border-color: #cbd5e0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  }

  .rating-info {
    flex: 1;
    padding-right: 20px;

    .vn {
      color: #2d3748;
      font-size: 15px;
      margin: 0;
      font-weight: 600;
      line-height: 1.5;
    }
  }

  .rating-stars {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
}

.star-item {
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  input {
    display: none;
  }

  .num {
    display: flex;
    width: 44px;
    height: 44px;
    border: 2px solid #e2e8f0;
    border-radius: 50%;
    justify-content: center;
    align-items: center;
    font-weight: 700;
    font-size: 16px;
    color: #718096;
    background: #ffffff;
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    user-select: none;

    &:hover {
      border-color: #cbd5e0;
      background: #f7fafc;
    }

    &.num-error {
      border-color: #e53e3e !important;
      background-color: #fff5f5;
      color: #e53e3e;
    }

    /* Hiệu ứng sáng đèn nằm ở đây */
    &.is-active,
    &:has(input:checked) {
      background: #3182ce !important;
      border-color: #3182ce !important;
      color: white !important;
      transform: scale(1.15);
      box-shadow: 0 4px 10px rgba(49, 130, 206, 0.3);
    }
  }
}

/* -----------------------------
   RESPONSIVE
----------------------------- */
@media (max-width: 768px) {
  .rating-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;

    .rating-info {
      padding-right: 0;
    }

    .rating-stars {
      width: 100%;
      justify-content: space-between;
    }
  }

  .star-item .num {
    width: 40px;
    height: 40px;
    font-size: 15px;
  }
}
</style>