<template>
  <ion-page>
    <div class="page-container">
      <div class="detail-center">

        <div v-if="isLoading" class="loading-state">Đang tải dữ liệu...</div>

        <div v-else-if="detail" class="detail-content">
          <section class="info-section view-mode">
            <ion-grid>
              <ion-row>
                <ion-col size="12" size-md="6">
                  <div class="custom-input">
                    <label class="label value">Tôi tên/ <span>姓名</span></label>
                    <div class="field-readonly value fw-bold">{{ detail.employeeName }}</div>
                  </div>
                </ion-col>
                <ion-col size="12" size-md="6">
                  <div class="custom-input">
                    <label class="label value">Mã Số/ <span>工號</span></label>
                    <div class="field-readonly value fw-bold">{{ detail.employeeCode }}</div>
                  </div>
                </ion-col>
                <ion-col size="12" size-md="6">
                  <div class="custom-input">
                    <label class="label value">Chức vụ/ <span>任職</span></label>
                    <div class="field-readonly value fw-bold">{{ detail.jobPositionName }}</div>
                  </div>
                </ion-col>
                <ion-col size="12" size-md="6">
                  <div class="custom-input">
                    <label class="label value">Bộ phận/ Mã bộ phận <span>部門/ 部門代碼</span></label>
                    <div class="field-readonly value fw-bold">{{ detail.organizationName }}</div>
                  </div>
                </ion-col>
                <ion-col size="12" size-md="6">
                  <div class="custom-input">
                    <label class="label value">Ngày thôi việc/ <span>離職日期</span></label>
                    <div class="field-readonly value fw-bold">{{ format.formatDate(detail.exitedAt) }}</div>
                  </div>
                </ion-col>
                <ion-col size="12" size-md="6">
                  <div class="custom-input">
                    <label class="label value">Ngày tạo/ <span>建立日期</span></label>
                    <div class="field-readonly value fw-bold">{{ format.formatDate(detail.createdAt) }}</div>
                  </div>
                </ion-col>
              </ion-row>
            </ion-grid>
          </section>

          <div v-if="detail.sections?.length" class="sections-block">
            <div class="section-card dynamic-content view-mode">
              <RecursiveNodeView v-for="section in detail.sections" :key="section.sectionId" :node="section"
                :max-rating="maxRating" :level="1" />
            </div>
          </div>
          <div v-else class="empty-state">Không có dữ liệu phỏng vấn.</div>
        </div>
        <div v-else class="empty-state">Không tìm thấy dữ liệu.</div>
      </div>
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { IonPage, IonGrid, IonRow, IonCol, onIonViewWillEnter } from '@ionic/vue';
import interviewView from '@/api/interviewView';
import format from '@/mixins/format';
import RecursiveNodeView from '@/views/FormExitInterview/components/RecursiveNodeView.vue';
import {
  logInterviewDetailAnswers,
} from '@/utils/interviewDetailExtract';
import type { InterviewDetail } from '@/utils/interviewDetailExtract';

const route = useRoute();
const detail = ref<InterviewDetail | null>(null);
const isLoading = ref(false);
const maxRating = ref(5);

const loadDetail = async () => {
  const id = String(route.params.id);
  if (!id) {
    detail.value = null;
    return;
  }

  isLoading.value = true;
  detail.value = null;

  try {
    const response = await interviewView.getInterviewView(id);
    const data = response?.data?.data as InterviewDetail | undefined;

    if (data) {
      detail.value = data;
      logInterviewDetailAnswers(data);
    }
  } catch (error) {
    console.error('Lỗi tải chi tiết phỏng vấn:', error);
  } finally {
    isLoading.value = false;
  }
};

onIonViewWillEnter(() => {
  loadDetail();
});
</script>

<style scoped lang="scss">
.page-container {
  padding: 30px;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: stretch;
}

.detail-center {
  width: 100%;
  max-width: 960px;
  height: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  gap: 20px;
}

.detail-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.loading-state,
.empty-state {
  padding: 40px;
  text-align: center;
  color: #64748b;
  font-style: italic;
}

.info-section.view-mode {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.custom-input {
  margin-bottom: 15px;

  label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #4a5568;
    margin-bottom: 8px;

    span {
      font-weight: normal;
      margin-left: 5px;
    }
  }
}

.field-readonly {
  width: 100%;
  padding: 12px 15px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  color: #2d3748;
  background: #f8fafc;
  min-height: 46px;
  box-sizing: border-box;
  line-height: 1.4;
  word-break: break-word;
}

.section-card.dynamic-content {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.sections-block {
  margin-top: 8px;
}

.label {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.value {
  color: #334155;
  font-size: 0.9375rem;
  word-break: break-word;
}

.fw-bold {
  font-weight: 600;
  color: #608bf0;
}
</style>
