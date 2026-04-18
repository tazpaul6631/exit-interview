<template>
  <div class="form-wrapper">
    <div class="paper-form">
      <header class="form-header">
        <div class="logo-placeholder"></div>
        <h1>BIÊN BẢN PHỎNG VẤN NGHỈ VIỆC</h1>
        <p class="subtitle-cn">員工離職面談記錄表</p>
      </header>

      <section class="info-section">
        <ion-grid>
          <ion-row>
            <ion-col size="12" size-md="6">
              <div class="custom-input">
                <label>Tôi tên/ <span>姓名</span></label>
                <input v-model="employeeName" type="text" placeholder="Nhập họ tên..."
                  :class="{ 'is-invalid': submitCount > 0 && errors['userInfo.employeeName'] }" />
                <span class="error-msg" v-if="submitCount > 0 && errors['userInfo.employeeName']">
                  Bắt buộc nhập/ 必填
                </span>
              </div>
            </ion-col>

            <ion-col size="12" size-md="6">
              <div class="custom-input">
                <label>Mã Số/ <span>工號</span></label>
                <input v-model="employeeCode" type="text" placeholder="Nhập mã nhân viên..."
                  :class="{ 'is-invalid': submitCount > 0 && errors['userInfo.employeeCode'] }" />
                <span class="error-msg" v-if="submitCount > 0 && errors['userInfo.employeeCode']">
                  Bắt buộc nhập/ 必填
                </span>
              </div>
            </ion-col>

            <ion-col size="12" size-md="6">
              <div class="custom-input">
                <label>Chức vụ/ <span>任職</span></label>
                <input v-model="jobPositionName" type="text" placeholder="Bộ phận/Chức vụ..."
                  :class="{ 'is-invalid': submitCount > 0 && errors['userInfo.jobPositionName'] }" />
                <span class="error-msg" v-if="submitCount > 0 && errors['userInfo.jobPositionName']">
                  Bắt buộc nhập/ 必填
                </span>
              </div>
            </ion-col>

            <ion-col size="12" size-md="6">
              <div class="custom-input search-wrapper">
                <label>Bộ phận/ Mã bộ phận <span>部門/ 部門代碼</span></label>
                <input :value="orgSearchKeyword" type="text" placeholder="Gõ để tìm kiếm phòng ban..."
                  @input="handleSearchOrg" @focus="organizationList.length > 0 && (showOrgList = true)"
                  @blur="showOrgList = false"
                  :class="{ 'is-invalid': submitCount > 0 && errors['userInfo.organizationId'] }" />
                <span class="error-msg" v-if="submitCount > 0 && errors['userInfo.organizationId']">
                  Vui lòng chọn phòng ban từ danh sách
                </span>
                <ul v-if="showOrgList" class="org-dropdown">
                  <li v-if="isSearching" class="status-text">Đang tìm kiếm...</li>
                  <li v-else-if="organizationList.length === 0" class="status-text">Không tìm thấy phòng ban</li>
                  <li v-else v-for="org in organizationList" :key="org.id || org.Id"
                    @mousedown.prevent="selectOrg(org)">
                    {{ org.name || org.Name || org.organizationName || org.OrganizationName || org.orgName }}
                  </li>
                </ul>
              </div>
            </ion-col>

            <ion-col size="12" size-md="6">
              <div class="custom-input">
                <label>Ngày thôi việc/ <span>離職日期</span></label>
                <ion-input v-model="exitedAt" type="date" label-placement="stacked" class="ion-date-input"
                  :class="{ 'is-invalid': submitCount > 0 && errors['userInfo.exitedAt'] }"></ion-input>
                <span class="error-msg" v-if="submitCount > 0 && errors['userInfo.exitedAt']">
                  Bắt buộc chọn/ 必填
                </span>
              </div>
            </ion-col>
          </ion-row>
        </ion-grid>
      </section>

      <div class="divider"></div>

      <div v-if="loading" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Đang tải cấu trúc biểu mẫu...</p>
      </div>

      <div v-if="!loading && apiData" class="dynamic-content">
        <RecursiveNode v-for="section in apiData?.sections" :key="section.sectionId" :node="section"
          :maxRating="apiData?.maxRatingPoint" :maxSelect="apiData?.maxReasonSelect" />
      </div>

      <footer class="hr-guidelines">
        <div class="guide-header">
          <ion-icon :icon="informationCircleOutline"></ion-icon>
          <h4>Lưu ý cho HR/ HR 使用小叮嚀:</h4>
        </div>
        <ul>
          <li><strong>Tạo không khí thoải mái/ 氣氛放鬆:</strong> Thái độ thân thiện/ 面談時請保持親切, phỏng vấn nhẹ nhàng/
            讓員工覺得是在聊天而不是被審問。</li>
          <li><strong>Ghi chép khách quan/ 客觀記錄:</strong> 即使員工投訴主管, HR ghi lại sự thật/ 也只需記錄事實, không vội kết luận/
            不要當場評判。</li>
          <li><strong>Lưu ý về ngôn ngữ/ 語言落差:</strong> Vùng miền/ 如果是針對北越或南越員工, diễn đạt/ 用詞若有微調, HR điều chỉnh theo
            phong tục địa phương/ 可依當地習慣口頭調整。</li>
        </ul>
      </footer>

      <div class="form-actions">
        <label class="checkbox-confirm">
          <input type="checkbox" v-model="isConfirmed">
          <span>Tôi xác nhận các nội dung trên là đúng sự thật/ 我確認以上信息準確無誤</span>
        </label>

        <ion-button expand="block" class="submit-btn" :disabled="!isConfirmed" @click="submitForm">
          <ion-spinner v-if="isSubmitting" name="crescent"></ion-spinner>
          <span v-if="!isSubmitting">GỬI BIÊN BẢN / 提交表單</span>
        </ion-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, shallowRef } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';
import {
  IonGrid, IonRow, IonCol, IonButton, IonSpinner, IonIcon, IonInput, onIonViewWillEnter
} from '@ionic/vue';
import { informationCircleOutline } from 'ionicons/icons';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import present from '@/mixins/present';
import interviewApi from '@/api/interview';
import organization from '@/api/organization';
import RecursiveNode from '@/views/FormExitInterview/components/RecursiveNode.vue';

const loading = ref(true);
const isConfirmed = ref(false);
const apiData = shallowRef<any>(null);
const { t } = useI18n();
const router = useRouter();
const isSubmitting = ref(false);

// ==========================================
// DYNAMIC RULES (Biến chứa luật Zod)
// ==========================================
let requiredRadios: string[] = [];
let requiredTexts: string[] = [];
let requiredRatings: string[] = [];
let conditionalTexts: { qId: string | null, parentAnsId: string, textId: string }[] = [];
let checkboxIds: string[] = [];

const validationSchema = ref(toTypedSchema(zod.any()));

const { handleSubmit, errors, defineField, values, submitCount, setFieldValue, setValues, resetForm } = useForm({
  validationSchema,
  initialValues: {
    userInfo: { employeeName: '', employeeCode: '', jobPositionName: '', exitedAt: '', organizationId: 0 },
    answersData: {} as Record<string, any>
  }
});

const [employeeName] = defineField('userInfo.employeeName');
const [employeeCode] = defineField('userInfo.employeeCode');
const [jobPositionName] = defineField('userInfo.jobPositionName');
const [exitedAt] = defineField('userInfo.exitedAt');

// ==========================================
// HÀM KHỞI TẠO CHÍNH (GOM LOGIC)
// ==========================================
const initializeForm = async () => {
  try {
    loading.value = true;

    requiredRadios = [];
    requiredTexts = [];
    requiredRatings = [];
    conditionalTexts = [];
    checkboxIds = [];
    isConfirmed.value = false;
    orgSearchKeyword.value = '';

    const response = await interviewApi.getInterview();
    apiData.value = response.data.data;
    const initData: Record<string, any> = {};

    const processAnswer = (ans: any, qId: string | null, parentAnsId: string | null) => {
      if (ans.allowRating) {
        initData[ans.answerId] = ans.ratingValue || 5;
        requiredRatings.push(String(ans.answerId));
      }
      if (ans.allowCheck && !qId) {
        initData[ans.answerId] = ans.checkValue || false;
        checkboxIds.push(String(ans.answerId));
      }
      if (ans.allowCheck && qId && ans.checkValue) {
        initData[`q_${qId}`] = ans.answerId;
      }
      if (ans.allowText) {
        initData[ans.answerId] = ans.textValue || '';
        if (parentAnsId) {
          conditionalTexts.push({ qId, parentAnsId: String(parentAnsId), textId: String(ans.answerId) });
        } else {
          requiredTexts.push(String(ans.answerId));
        }
      }
      if (ans.childs && ans.childs.length > 0) {
        ans.childs.forEach((cAns: any) => processAnswer(cAns, qId, String(ans.answerId)));
      }
    };

    const scanTree = (node: any, currentQId: string | null = null) => {
      if (!node) return;
      if (node.sections) node.sections.forEach((s: any) => scanTree(s, currentQId));
      if (node.questions) node.questions.forEach((q: any) => scanTree(q, String(q.questionId)));
      if (node.childs && node.childs.length > 0 && node.childs[0].sectionId) {
        node.childs.forEach((c: any) => scanTree(c, currentQId));
      }
      if (node.answers) {
        if (node.questionId && node.answers.some((a: any) => a.allowCheck)) {
          requiredRadios.push(String(node.questionId));
        }
        node.answers.forEach((ans: any) => processAnswer(ans, currentQId, null));
      }
    };

    scanTree(apiData.value);

    const dynamicZod = zod.object({
      userInfo: zod.object({
        employeeName: zod.string().min(1, t('valid.required')),
        employeeCode: zod.string().min(1, t('valid.required')),
        jobPositionName: zod.string().min(1, t('valid.required')),
        exitedAt: zod.string().min(1, t('valid.required')),
        organizationId: zod.number().min(1, t('valid.required')),
      }).default({ employeeName: '', employeeCode: '', jobPositionName: '', exitedAt: '', organizationId: 0 }),
      answersData: zod.any().default({})
    })
      .default({
        userInfo: { employeeName: '', employeeCode: '', jobPositionName: '', exitedAt: '', organizationId: 0 },
        answersData: {}
      })
      .superRefine((data, ctx) => {
        if (!data) return;
        const safeData: Record<string, any> = (data.answersData || {}) as Record<string, any>;
        requiredRatings.forEach(id => {
          if (!safeData[id] || safeData[id] === 0) {
            ctx.addIssue({ code: zod.ZodIssueCode.custom, message: 'Vui lòng đánh giá', path: [`answersData.${id}`] });
          }
        });
        requiredRadios.forEach(qId => {
          if (!safeData[`q_${qId}`]) {
            ctx.addIssue({ code: zod.ZodIssueCode.custom, message: 'Vui lòng chọn 1 đáp án', path: [`answersData.q_${qId}`] });
          }
        });
        requiredTexts.forEach(id => {
          if (!safeData[id] || String(safeData[id]).trim() === '') {
            ctx.addIssue({ code: zod.ZodIssueCode.custom, message: 'Vui lòng nhập lý do', path: [`answersData.${id}`] });
          }
        });
        conditionalTexts.forEach(cond => {
          let isParentSelected = cond.qId ? (String(safeData[`q_${cond.qId}`]) === cond.parentAnsId) : (safeData[cond.parentAnsId] === true);
          if (isParentSelected) {
            if (!safeData[cond.textId] || String(safeData[cond.textId]).trim() === '') {
              ctx.addIssue({ code: zod.ZodIssueCode.custom, message: 'Vui lòng nhập lý do chi tiết', path: [`answersData.${cond.textId}`] });
            }
          }
        });
        if (checkboxIds.length > 0) {
          const selectedCount = checkboxIds.filter(id => safeData[id] === true).length;
          if (selectedCount === 0) {
            checkboxIds.forEach(id => {
              ctx.addIssue({ code: zod.ZodIssueCode.custom, message: `Vui lòng chọn ít nhất 1 lý do`, path: [`answersData.${id}`] });
            });
          }
        }
      });

    validationSchema.value = toTypedSchema(dynamicZod);

    setValues({
      userInfo: {
        employeeName: apiData.value.employeeName || '',
        employeeCode: apiData.value.employeeCode || '',
        jobPositionName: apiData.value.jobPositionName || '',
        exitedAt: apiData.value.exitedAt || '',
        organizationId: apiData.value.organizationId || 0
      },
      answersData: initData
    });

    orgSearchKeyword.value = apiData.value.organizationName || '';

  } catch (error) {
    console.error('Lỗi load form:', error);
  } finally {
    setTimeout(() => { loading.value = false; }, 800);
  }
};

// ==========================================
// LIFECYCLE HOOKS
// ==========================================

// onMounted dùng cho web thuần hoặc lần đầu mở app
onMounted(initializeForm);

// ==========================================
// SEARCH ORGANIZATION 
// ==========================================
const orgSearchKeyword = ref('');
const organizationList = ref<any[]>([]);
const showOrgList = ref(false);
const isSearching = ref(false);
let searchTimeout: any = null;

const handleSearchOrg = (event: Event) => {
  const keyword = (event.target as HTMLInputElement).value;
  orgSearchKeyword.value = keyword;
  setFieldValue('userInfo.organizationId', 0);
  if (searchTimeout) clearTimeout(searchTimeout);

  if (!keyword.trim()) {
    organizationList.value = [];
    showOrgList.value = false;
    return;
  }

  searchTimeout = setTimeout(async () => {
    isSearching.value = true;
    showOrgList.value = true;
    try {
      const res = await organization.postOrganization({ keyword: keyword.trim(), active: true });
      organizationList.value = res.data?.data || [];
    } catch (error) {
      console.error("Lỗi khi tìm phòng ban:", error);
      organizationList.value = [];
    } finally {
      isSearching.value = false;
    }
  }, 500);
};

const selectOrg = (org: any) => {
  if (searchTimeout) clearTimeout(searchTimeout);
  setFieldValue('userInfo.organizationId', org.id);
  orgSearchKeyword.value = org.name;
  showOrgList.value = false;
};

// ==========================================
// SUBMIT FORM
// ==========================================
const submitForm = handleSubmit(
  async (formValues) => {
    if (isSubmitting.value) return;

    try {
      isSubmitting.value = true;

      const finalAnswers: any[] = [];
      const rawData: Record<string, any> = (formValues.answersData || {}) as Record<string, any>;

      const extractPayload = (node: any, qId: string | null = null) => {
        if (!node) return;
        let currentQId = node.questionId ? String(node.questionId) : qId;

        if (node.answerId !== undefined) {
          let isChecked = false;
          if (node.allowCheck) {
            isChecked = currentQId
              ? (String(rawData[`q_${currentQId}`]) === String(node.answerId))
              : !!rawData[node.answerId];
          }

          const { childs, ...restOfNode } = node;

          finalAnswers.push({
            ...restOfNode,
            checkValue: isChecked,
            ratingValue: node.allowRating ? Number(rawData[node.answerId] || 0) : (node.ratingValue || 0),
            textValue: node.allowText ? String(rawData[node.answerId] || '') : (node.textValue || '')
          });

          if (node.childs) {
            node.childs.forEach((c: any) => extractPayload(c, currentQId));
          }
        }

        if (node.answers) node.answers.forEach((ans: any) => extractPayload(ans, currentQId));
        if (node.questions) node.questions.forEach((q: any) => extractPayload(q, String(q.questionId)));
        if (node.childs && node.childs.length > 0 && node.childs[0].sectionId) {
          node.childs.forEach((c: any) => extractPayload(c, currentQId));
        }
        if (node.sections) node.sections.forEach((s: any) => extractPayload(s, currentQId));
      };

      extractPayload(apiData.value);

      const finalPayloadForBE = {
        ...formValues.userInfo,
        exitedAt: formValues.userInfo.exitedAt ? new Date(formValues.userInfo.exitedAt).toISOString() : null,
        answers: finalAnswers
      };

      await interviewApi.postCreateInterview(finalPayloadForBE);

      await present.Toast(t('messages.submitted'), 'success');

      resetForm();
      orgSearchKeyword.value = '';
      isConfirmed.value = false;

      router.push('/app-menu');

    } catch (error) {
      console.error(error);
      alert('Lỗi gửi dữ liệu/發送數據錯誤');
    } finally {
      isSubmitting.value = false;
    }
  },
  (validationErrors) => {
    console.warn("Zod đã chặn form vì các lỗi sau:", validationErrors.errors);

    // Tự động cuộn mượt mà lên đầu trang để người dùng thấy ô viền đỏ
    const contentBox = document.querySelector('ion-content');
    if (contentBox) {
      contentBox.scrollToTop(500);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
);
</script>

<style lang="scss" scoped>
.custom-content {
  --background: #f4f7f9;
}

.form-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px 10px;
}

.paper-form {
  background: #ffffff;
  width: 100%;
  max-width: 960px;
  min-height: 100vh;
  padding: 40px;
  border-radius: 4px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  position: relative;
}

.paper-form::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: #3182ce;
  border-radius: 4px 4px 0 0;
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
}

.form-header h1 {
  font-size: 26px;
  font-weight: 800;
  color: #2d3748;
  margin-bottom: 5px;
}

.form-header .subtitle-cn {
  font-size: 18px;
  color: #718096;
  letter-spacing: 2px;
}

.custom-input {
  margin-bottom: 15px;
}

.custom-input label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 8px;
}

.custom-input label span {
  font-weight: normal;
  color: #4a5568;
  margin-left: 5px;
}

.custom-input input {
  width: 100%;
  padding: 12px 15px;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: all 0.2s;
}

.custom-input input:focus {
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

.divider {
  height: 1px;
  background: #edf2f7;
  margin: 30px 0;
}

.hr-guidelines {
  background: #fffaf0;
  border: 1px solid #feebc8;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 40px;
  margin-top: 20px;
}

.hr-guidelines .guide-header {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #c05621;
  margin-bottom: 15px;
}

.hr-guidelines .guide-header ion-icon {
  font-size: 24px;
}

.hr-guidelines .guide-header h4 {
  margin: 0;
  font-size: 17px;
}

.hr-guidelines ul {
  margin: 0;
  padding-left: 20px;
}

.hr-guidelines ul li {
  color: #7b341e;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
}

.form-actions .checkbox-confirm {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  width: 100%;
}

.form-actions .checkbox-confirm input {
  width: 20px;
  height: 20px;
}

.form-actions .checkbox-confirm span {
  font-size: 15px;
  color: #2d3748;
  line-height: 1.4;
}

.form-actions .submit-btn {
  --border-radius: 12px;
  --background: #3182ce;
  width: 100%;
  max-width: 400px;
  height: 60px;
  font-weight: 700;
  font-size: 18px;
}

@media (max-width: 768px) {
  .paper-form {
    padding: 20px;
  }
}

.ion-date-input {
  --background: #ffffff;
  --border-color: #e2e8f0;
  --border-radius: 8px;
  --border-width: 1.5px;
  --border-style: solid;
  --padding-start: 15px;
  --padding-end: 15px;
  --color: #2d3748;
  margin-top: 5px;
  min-height: 48px;
  width: 100%;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: all 0.2s;
  --highlight-height: 0;
  --inner-border-width: 0;
  --show-full-highlight: 0;
}

.is-invalid {
  border: 1.5px solid var(--ion-color-danger) !important;
  background-color: #fff5f5;
}

.error-msg {
  color: var(--ion-color-danger);
  font-size: 15px;
  margin-top: 4px;
  font-weight: 500;
  display: block;
}

.search-wrapper {
  position: relative;
}

.org-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  max-height: 200px;
  overflow-y: auto;
  margin: 4px 0 0 0;
  padding: 0;
  list-style: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.org-dropdown li {
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: background-color 0.2s;
}

.org-dropdown li:last-child {
  border-bottom: none;
}

.org-dropdown li:hover {
  background-color: #f0f7ff;
  color: #0056b3;
}

.org-dropdown li.status-text {
  color: #888;
  text-align: center;
  font-style: italic;
  cursor: default;
}
</style>