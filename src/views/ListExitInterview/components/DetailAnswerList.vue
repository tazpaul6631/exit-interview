<template>
  <div v-if="visibleAnswers.length" class="answers-group">
    <div v-for="answer in visibleAnswers" :key="answer.id" class="answer-item">
      <span class="answer-name">{{ answer.answerName }}</span>
      <span class="answer-value">{{ formatAnswerDisplayValue(answer) }}</span>
    </div>
    <template v-for="answer in visibleAnswers" :key="'nested-' + answer.id">
      <DetailAnswerList v-if="answer.childs?.length" :answers="answer.childs" class="nested-answers" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  formatAnswerDisplayValue,
  hasAnswerData,
  type InterviewAnswer,
} from '@/utils/interviewDetailExtract';

const props = defineProps<{
  answers?: InterviewAnswer[];
}>();

const visibleAnswers = computed(() =>
  (props.answers ?? []).filter(hasAnswerData)
);
</script>

<style scoped lang="scss">
.answers-group {
  margin-bottom: 8px;
}

.nested-answers {
  margin-left: 16px;
  padding-left: 12px;
  border-left: 2px solid #e2e8f0;
}

.answer-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  font-size: 0.875rem;
  border-bottom: 1px solid #f1f5f9;
}

.answer-name {
  color: #334155;
}

.answer-value {
  color: #2563eb;
  font-weight: 500;
  text-align: right;
}
</style>
