<template>
  <div :class="isSelectable ? 'dynamic-field-radio' : 'dynamic-field'">
    <div v-if="answer.allowRating" class="rating-card view-mode">
      <div class="rating-info">
        <p class="vn">{{ answer.answerName }}</p>
      </div>
      <div class="rating-stars">
        <span v-for="n in maxRating" :key="n" class="num" :class="{ 'is-active': Number(answer.ratingValue) === n }">
          {{ n }}
        </span>
      </div>
    </div>

    <template v-else-if="isSelectable">
      <div v-if="isRadio" class="pill-radio view-mode" :class="{ active: isAnswerSelected }">
        <span class="radio-dot" :class="{ checked: isAnswerSelected }"></span>
        <span>{{ answer.answerName }}</span>
      </div>

      <div v-else class="checkbox-card view-mode" :class="{ 'is-checked': isAnswerSelected }">
        <span class="checkbox-dot" :class="{ checked: isAnswerSelected }"></span>
        <div class="card-body">
          <span class="title-vn-cn">{{ answer.answerName }}</span>
        </div>
      </div>
    </template>

    <div v-else-if="answer.allowText" class="text-input-box view-mode">
      <p v-if="answer.answerName && answer.answerName !== 'Trả lời/答:'" class="text-label">
        {{ answer.answerName }}
      </p>
      <div class="text-readonly">{{ answer.textValue || ' ' }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { InterviewAnswer } from '@/utils/interviewDetailExtract';

const props = withDefaults(
  defineProps<{
    answer: InterviewAnswer;
    questionId?: number | string | null;
    maxRating?: number;
  }>(),
  { questionId: null, maxRating: 5 }
);

const isRadio = computed(
  () => props.questionId != null && (props.answer.allowCheck || props.answer.allowSelect)
);
const isSelectable = computed(
  () => props.answer.allowCheck || props.answer.allowSelect
);

const isAnswerSelected = computed(
  () => !!(props.answer.checkValue || props.answer.selectValue)
);
</script>

<style lang="scss" scoped>
.dynamic-field,
.dynamic-field-radio {
  width: 100%;
  box-sizing: border-box;
}

.view-mode {
  pointer-events: none;
  user-select: text;
}

.text-label {
  display: block;
  color: #2d3748;
  font-weight: 600;
  font-size: 15px;
  margin: 10px 0 8px 4px;
}

.text-readonly {
  width: 100%;
  min-height: 110px;
  padding: 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  color: #2d3748;
  background: #fcfcfc;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.pill-radio.view-mode {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  border-radius: 50px;
  border: 1.5px solid #e2e8f0;
  background: #fff;

  .radio-dot {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid #cbd5e0;
    flex-shrink: 0;

    &.checked {
      border-color: #3182ce;
      background: #3182ce;
      box-shadow: inset 0 0 0 3px #fff;
    }
  }

  span {
    font-size: 15px;
    font-weight: 500;
    color: #4a5568;
  }

  &.active {
    border-color: #3182ce;
    background: #ebf8ff;

    span {
      color: #2b6cb0;
      font-weight: 700;
    }
  }
}

.checkbox-card.view-mode {
  display: flex;
  align-items: flex-start;
  padding: 16px 20px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;

  .checkbox-dot {
    width: 20px;
    height: 20px;
    margin-right: 14px;
    margin-top: 2px;
    border-radius: 4px;
    border: 2px solid #cbd5e0;
    flex-shrink: 0;

    &.checked {
      background: #3182ce;
      border-color: #3182ce;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        left: 5px;
        top: 1px;
        width: 6px;
        height: 11px;
        border: solid #fff;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }
  }

  .title-vn-cn {
    color: #2d3748;
    font-size: 15px;
    line-height: 1.5;
    font-weight: 500;
  }

  &.is-checked {
    border-color: #3182ce;
    background: #ebf8ff;

    .title-vn-cn {
      color: #2b6cb0;
      font-weight: 600;
    }
  }
}

.rating-card.view-mode {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  width: 100%;
  box-sizing: border-box;

  .rating-info .vn {
    color: #2d3748;
    font-size: 15px;
    margin: 0;
    font-weight: 600;
    line-height: 1.5;
  }

  .rating-stars {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
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
    background: #fff;

    &.is-active {
      background: #3182ce !important;
      border-color: #3182ce !important;
      color: white !important;
    }
  }
}

@media (max-width: 768px) {
  .rating-card.view-mode {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>
