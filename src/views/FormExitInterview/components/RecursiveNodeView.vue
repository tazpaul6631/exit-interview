<template>
  <div class="node-block">
    <template v-if="node.sectionName">
      <div v-if="level === 1" class="section-title-parent">
        <h3>{{ node.sectionName }}</h3>
      </div>
      <div v-else class="section-title-child">
        <h4>{{ node.sectionName }}</h4>
      </div>
    </template>

    <label v-if="node.questionName" class="ques-label">{{ node.questionName }}</label>

    <div
      v-if="node.answers?.length"
      class="answers-wrapper"
      :class="{ 'radio-group': parentQuestionId }"
    >
      <DynamicInputView
        v-for="ans in node.answers"
        :key="ans.answerId"
        :answer="ans"
        :question-id="parentQuestionId"
        :max-rating="maxRating"
      />

      <template v-for="ans in node.answers" :key="'child-' + ans.answerId">
        <div v-if="ans.childs?.length && isSelected(ans)" class="nested-childs">
          <DynamicInputView
            v-for="cAns in ans.childs"
            :key="cAns.answerId"
            :answer="cAns"
          />
        </div>
      </template>
    </div>

    <RecursiveNodeView
      v-for="ques in node.questions || []"
      :key="ques.questionId"
      :node="ques"
      :parent-question-id="ques.questionId"
      :max-rating="maxRating"
      :level="level + 1"
    />

    <RecursiveNodeView
      v-for="child in node.childs || []"
      :key="child.sectionId"
      :node="child"
      :parent-question-id="parentQuestionId"
      :max-rating="maxRating"
      :level="level + 1"
    />
  </div>
</template>

<script setup lang="ts">
import DynamicInputView from './DynamicInputView.vue';
import type { InterviewAnswer } from '@/utils/interviewDetailExtract';

const props = withDefaults(
  defineProps<{
    node: Record<string, any>;
    parentQuestionId?: number | string | null;
    maxRating?: number;
    level?: number;
  }>(),
  { parentQuestionId: null, maxRating: 5, level: 1 }
);

const isSelected = (ans: InterviewAnswer) => {
  if (!ans.allowCheck && !ans.allowSelect) return false;
  return !!(ans.checkValue || ans.selectValue);
};
</script>

<style lang="scss" scoped>
.node-block {
  margin-bottom: 24px;
  width: 100%;
}

.section-title-parent {
  background: #f8fafc;
  padding: 14px 20px;
  border-left: 5px solid #3182ce;
  border-radius: 4px 8px 8px 4px;
  margin: 30px 0 16px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);

  h3 {
    margin: 0;
    font-size: 17px;
    color: #1a202c;
    font-weight: 700;
    line-height: 1.4;
  }
}

.section-title-child {
  margin: 10px 0 16px 4px;

  h4 {
    margin: 0;
    font-size: 15px;
    color: #4a5568;
    font-weight: 600;
    font-style: italic;
    line-height: 1.4;
  }
}

.ques-label {
  display: block;
  color: #2d3748;
  font-size: 16px;
  font-weight: 600;
  margin: 16px 0 12px 0;
  padding: 0 4px;
  line-height: 1.5;
}

.answers-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;

  &.radio-group {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 12px 16px;
    margin-bottom: 8px;
  }
}

.nested-childs {
  margin-top: 8px;
  margin-bottom: 16px;
  padding-left: 20px;
  margin-left: 14px;
  border-left: 2px dashed #cbd5e0;
  width: 100%;
  box-sizing: border-box;
}
</style>
