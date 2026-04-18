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

    <div v-if="node.answers?.length > 0" class="answers-wrapper" :class="{ 'radio-group': parentQuestionId }">
      <DynamicInput v-for="ans in node.answers" :key="ans.answerId" :answer="ans" :questionId="parentQuestionId"
        :maxRating="maxRating" :maxSelect="maxSelect" />

      <template v-for="ans in node.answers" :key="'child-' + ans.answerId">
        <transition name="fade-slide">
          <div v-if="ans.childs?.length > 0 && isSelected(ans)" class="nested-childs">
            <DynamicInput v-for="cAns in ans.childs" :key="cAns.answerId" :answer="cAns" />
          </div>
        </transition>
      </template>
    </div>

    <RecursiveNode v-for="ques in node.questions || []" :key="ques.questionId" :node="ques"
      :parentQuestionId="ques.questionId" :maxSelect="maxSelect" :level="level + 1" />

    <RecursiveNode v-for="child in node.childs || []" :key="child.id" :node="child" :parentQuestionId="parentQuestionId"
      :maxSelect="maxSelect" :level="level + 1" />
  </div>
</template>

<script setup lang="ts">
import { useFormValues } from 'vee-validate';
import DynamicInput from './DynamicInput.vue';

const props = defineProps({
  node: { type: Object, required: true },
  parentQuestionId: { type: [Number, String], default: null },
  maxRating: { type: Number, default: 5 },
  maxSelect: { type: Number, default: 2 },
  level: { type: Number, default: 1 }
});

const values = useFormValues();

const isSelected = (ans: any) => {
  if (!ans.allowCheck) return false;

  const answersData = (values.value.answersData || {}) as Record<string, any>;

  if (props.parentQuestionId) {
    return answersData[`q_${props.parentQuestionId}`] === ans.answerId;
  }
  return !!answersData[ans.answerId];
};
</script>

<style lang="scss" scoped>
/* KHỐI NODE GỐC */
.node-block {
  margin-bottom: 24px;
  width: 100%;
}

/* -----------------------------
   UI SECTION CHA (Level 1)
----------------------------- */
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
    letter-spacing: 0.2px;
    line-height: 1.4;
  }
}

/* -----------------------------
   UI SECTION CON (Level > 1)
----------------------------- */
.section-title-child {
  margin: 10px 0 16px 4px; // Căn lề lùi nhẹ vào khớp với input

  h4 {
    margin: 0;
    font-size: 15px;
    color: #4a5568;
    font-weight: 600;
    font-style: italic; // In nghiêng giống thiết kế cũ của bạn
    line-height: 1.4;
  }
}

/* -----------------------------
   CÁC PHẦN CÒN LẠI GIỮ NGUYÊN
----------------------------- */
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

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.25s ease-out, transform 0.25s ease-out;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>