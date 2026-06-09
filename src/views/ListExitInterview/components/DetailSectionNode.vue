<template>
  <div class="node-block">
    <template v-if="section">
      <div v-if="section.sectionName" :class="level === 1 ? 'section-title-parent' : 'section-title-child'">
        <h3 v-if="level === 1">{{ section.sectionName }}</h3>
        <h4 v-else>{{ section.sectionName }}</h4>
      </div>

      <DetailAnswerList :answers="section.answers" />

      <DetailSectionNode
        v-for="question in section.questions ?? []"
        :key="question.id"
        :question="question"
        :level="level + 1"
      />

      <DetailSectionNode
        v-for="child in section.childs ?? []"
        :key="child.sectionId"
        :section="child"
        :level="level + 1"
      />
    </template>

    <template v-else-if="question">
      <p class="question-name">{{ question.questionName }}</p>
      <DetailAnswerList :answers="question.answers" />
    </template>
  </div>
</template>

<script setup lang="ts">
import DetailAnswerList from './DetailAnswerList.vue';
import type { InterviewQuestion, InterviewSection } from '@/utils/interviewDetailExtract';

withDefaults(
  defineProps<{
    section?: InterviewSection;
    question?: InterviewQuestion;
    level?: number;
  }>(),
  { level: 1 }
);
</script>

<style scoped lang="scss">
.node-block {
  margin-bottom: 8px;
}

.section-title-parent {
  background: #f8fafc;
  padding: 12px 16px;
  border-left: 4px solid #3182ce;
  border-radius: 4px;
  margin: 20px 0 12px;

  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: #1a202c;
  }
}

.section-title-child h4 {
  margin: 8px 0 12px;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #4a5568;
}

.question-name {
  margin: 0 0 8px;
  font-weight: 600;
  color: #475569;
}
</style>
