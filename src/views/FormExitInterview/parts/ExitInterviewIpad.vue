<template>
  <div class="form-wrapper">
    <div class="paper-form">
      <header class="form-header">
        <img :src="APP_LOGO_URL" :alt="APP_LOGO_ALT" class="form-logo" />
        <h1>BIÊN BẢN PHỎNG VẤN NGHỈ VIỆC</h1>
        <p class="subtitle-cn">員工離職面談記錄表</p>
      </header>

      <section class="info-section" id="form-section-info">
        <ion-grid>
          <ion-row>
            <ion-col size="12" size-md="6">
              <div class="custom-input">
                <label><span class="request">*</span>Tôi tên/ <span>姓名</span></label>
                <input :value="employeeName" type="text" placeholder="Nhập họ tên..."
                  :class="{ 'is-invalid': !!fieldFormatErrors.employeeName || (submitCount > 0 && errors['userInfo.employeeName']) }"
                  @input="onEmployeeNameInput" />
                <span class="error-msg" v-if="fieldFormatErrors.employeeName">{{ fieldFormatErrors.employeeName
                  }}</span>
                <span class="error-msg" v-else-if="submitCount > 0 && errors['userInfo.employeeName']">
                  Bắt buộc nhập/ 必填
                </span>
              </div>
            </ion-col>

            <ion-col size="12" size-md="6">
              <div class="custom-input">
                <label><span class="request">*</span>Mã Số/ <span>工號</span></label>
                <input :value="employeeCode" type="text" placeholder="Nhập mã nhân viên..."
                  :class="{ 'is-invalid': !!fieldFormatErrors.employeeCode || (submitCount > 0 && errors['userInfo.employeeCode']) }"
                  @input="onEmployeeCodeInput" />
                <span class="error-msg" v-if="fieldFormatErrors.employeeCode">{{ fieldFormatErrors.employeeCode
                  }}</span>
                <span class="error-msg" v-else-if="submitCount > 0 && errors['userInfo.employeeCode']">
                  Bắt buộc nhập/ 必填
                </span>
              </div>
            </ion-col>

            <ion-col size="12" size-md="6">
              <div class="custom-input">
                <label><span class="request">*</span>Chức vụ/ <span>任職</span></label>
                <input :value="jobPositionName" type="text" placeholder="Bộ phận/Chức vụ..."
                  :class="{ 'is-invalid': !!fieldFormatErrors.jobPositionName || (submitCount > 0 && errors['userInfo.jobPositionName']) }"
                  @input="onJobPositionNameInput" />
                <span class="error-msg" v-if="fieldFormatErrors.jobPositionName">{{ fieldFormatErrors.jobPositionName
                  }}</span>
                <span class="error-msg" v-else-if="submitCount > 0 && errors['userInfo.jobPositionName']">
                  Bắt buộc nhập/ 必填
                </span>
              </div>
            </ion-col>

            <ion-col size="12" size-md="6">
              <div class="custom-input search-wrapper">
                <label><span class="request">*</span>Bộ phận/ Mã bộ phận <span>部門/ 部門代碼</span></label>
                <div class="search-input-box">
                  <input :value="orgSearchKeyword" type="text" placeholder="Gõ để tìm kiếm phòng ban..."
                    @input="handleSearchOrg" @focus="organizationList.length > 0 && (showOrgList = true)"
                    @blur="showOrgList = false"
                    :class="{ 'is-invalid': !!fieldFormatErrors.organizationKeyword || (submitCount > 0 && errors['userInfo.organizationId']) }" />
                  <button v-if="orgSearchKeyword" type="button" class="search-clear-btn" aria-label="Xóa"
                    @mousedown.prevent @click="clearOrgSearch">
                    <ion-icon :icon="closeCircleOutline"></ion-icon>
                  </button>
                </div>
                <span class="error-msg" v-if="fieldFormatErrors.organizationKeyword">
                  {{ fieldFormatErrors.organizationKeyword }}
                </span>
                <span class="error-msg" v-else-if="submitCount > 0 && errors['userInfo.organizationId']">
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
                <label><span class="request">*</span>Ngày thôi việc/ <span>離職日期</span></label>
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

      <div v-if="loadError" class="loading-container loading-container--error">
        <p>{{ loadError }}</p>
      </div>

      <div v-else-if="loading" class="loading-container">
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

        <ion-button expand="block" class="submit-btn"
          :disabled="!isConfirmed || loading || !isFormReady || isSubmitting" @click="submitForm">
          <ion-spinner v-if="isSubmitting" name="crescent"></ion-spinner>
          <span v-if="!isSubmitting">GỬI BIÊN BẢN / 提交表單</span>
        </ion-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, shallowRef, nextTick, inject, type Ref } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';
import {
  IonGrid, IonRow, IonCol, IonButton, IonSpinner, IonIcon, IonInput
} from '@ionic/vue';
import { informationCircleOutline, closeCircleOutline } from 'ionicons/icons';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import interviewApi from '@/api/interview';
import organization from '@/api/organization';
import RecursiveNode from '@/views/FormExitInterview/components/RecursiveNode.vue';
import { APP_LOGO_ALT, APP_LOGO_URL } from '@/constants/branding';
import { useModalFieldValidation } from '@/composables/useModalFieldValidation';

const loading = ref(true);
const isFormReady = ref(false);
const loadError = ref('');
const isConfirmed = ref(false);
const apiData = shallowRef<any>(null);
const { t } = useI18n();
const toast = useToast();
const router = useRouter();
const isSubmitting = ref(false);
const { getCodeFormatError, getNameFormatError, getModalNameFormatError, getOrganizationNameFormatError } = useModalFieldValidation();

const fieldFormatErrors = ref({
  employeeName: '',
  employeeCode: '',
  jobPositionName: '',
  organizationKeyword: '',
});

const topLevelSectionIds = ref<string[]>([]);
const fieldToTopSectionMap = ref<Record<string, string>>({});
const formExitIonContentRef = inject<Ref<{ $el?: HTMLIonContentElement } | HTMLIonContentElement | null>>(
  'formExitIonContent',
  ref(null),
);

const resolveIonContentElement = (targetEl?: Element | null): HTMLIonContentElement | null => {
  const injected = formExitIonContentRef.value;
  const injectedHost = injected && '$el' in injected ? injected.$el : injected;
  if (injectedHost instanceof HTMLElement && injectedHost.tagName === 'ION-CONTENT') {
    return injectedHost as HTMLIonContentElement;
  }

  const pageContent = targetEl?.closest('ion-page')?.querySelector('ion-content');
  if (pageContent) return pageContent as HTMLIonContentElement;

  const outletPages = Array.from(document.querySelectorAll('ion-router-outlet > .ion-page'));
  const activePage = [...outletPages].reverse().find((page) => !page.classList.contains('ion-page-hidden'))
    ?? outletPages[outletPages.length - 1];
  const activeContent = activePage?.querySelector('ion-content');
  if (activeContent) return activeContent as HTMLIonContentElement;

  return null;
};

const showToast = (
  severity: 'success' | 'info' | 'warn' | 'error',
  summary: string,
  detail?: string,
) => {
  toast.add({
    severity,
    summary,
    detail: detail ?? summary,
    life: 3000,
  });
};

// ==========================================
// DYNAMIC RULES (Biến chứa luật Zod)
// ==========================================
let requiredRadios: string[] = [];
let requiredTexts: string[] = [];
let requiredRatings: string[] = [];
let conditionalTexts: { qId: string | null, parentAnsId: string, textId: string }[] = [];
let checkboxIds: string[] = [];
let mandatoryQuestions: string[] = [];
const questionAnswerIds = new Map<string, string[]>();

const pendingFormSchema = zod.object({
  userInfo: zod.object({
    employeeName: zod.string().optional(),
    employeeCode: zod.string().optional(),
    jobPositionName: zod.string().optional(),
    exitedAt: zod.string().optional(),
    organizationId: zod.number().optional(),
  }).optional(),
  answersData: zod.any().optional(),
}).superRefine((_data, ctx) => {
  ctx.addIssue({
    code: zod.ZodIssueCode.custom,
    message: t('messages.form_incomplete'),
    path: ['userInfo', 'employeeName'],
  });
});

const validationSchema = ref(toTypedSchema(pendingFormSchema));

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

const onEmployeeNameInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  setFieldValue('userInfo.employeeName', value);
  fieldFormatErrors.value.employeeName = getModalNameFormatError(value);
};

const onEmployeeCodeInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  setFieldValue('userInfo.employeeCode', value);
  fieldFormatErrors.value.employeeCode = getCodeFormatError(value);
};

const onJobPositionNameInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  setFieldValue('userInfo.jobPositionName', value);
  fieldFormatErrors.value.jobPositionName = getModalNameFormatError(value);
};

const resetFieldFormatErrors = () => {
  fieldFormatErrors.value = {
    employeeName: '',
    employeeCode: '',
    jobPositionName: '',
    organizationKeyword: '',
  };
};

// ==========================================
// HÀM KHỞI TẠO CHÍNH (GOM LOGIC)
// ==========================================
const initializeForm = async () => {
  try {
    loading.value = true;
    isFormReady.value = false;
    loadError.value = '';

    requiredRadios = [];
    requiredTexts = [];
    requiredRatings = [];
    conditionalTexts = [];
    checkboxIds = [];
    mandatoryQuestions = [];
    questionAnswerIds.clear();
    isConfirmed.value = false;
    orgSearchKeyword.value = '';

    const response = await interviewApi.getInterview();
    apiData.value = response.data.data;
    const initData: Record<string, any> = {};
    const sectionIdsList: string[] = [];
    const fieldMap: Record<string, string> = {};

    const registerAnswerField = (fieldKey: string, topSectionId: string | null) => {
      if (topSectionId) fieldMap[fieldKey] = topSectionId;
    };

    const processAnswer = (ans: any, qId: string | null, parentAnsId: string | null, topSectionId: string | null) => {
      if (ans.allowRating) {
        initData[ans.answerId] = ans.ratingValue || 5;
        requiredRatings.push(String(ans.answerId));
        registerAnswerField(String(ans.answerId), topSectionId);
      }
      if (ans.allowCheck && !qId) {
        initData[ans.answerId] = ans.checkValue || false;
        checkboxIds.push(String(ans.answerId));
        registerAnswerField(String(ans.answerId), topSectionId);
      }
      if (ans.allowCheck && qId && ans.checkValue) {
        initData[`q_${qId}`] = ans.answerId;
      }
      if ((ans.allowCheck || ans.allowSelect) && qId && ans.checkValue) {
        initData[`q_${qId}`] = ans.answerId;
      }
      if (ans.allowText) {
        initData[ans.answerId] = ans.textValue || '';
        registerAnswerField(String(ans.answerId), topSectionId);
        if (parentAnsId) {
          conditionalTexts.push({ qId, parentAnsId: String(parentAnsId), textId: String(ans.answerId) });
        } else {
          requiredTexts.push(String(ans.answerId));
        }
      }
      if (ans.childs && ans.childs.length > 0) {
        ans.childs.forEach((cAns: any) => processAnswer(cAns, qId, String(ans.answerId), topSectionId));
      }
    };

    const scanTree = (node: any, currentQId: string | null = null, topSectionId: string | null = null) => {
      if (!node) return;
      if (node.sections) {
        node.sections.forEach((s: any) => {
          const sectionId = String(s.sectionId);
          if (!sectionIdsList.includes(sectionId)) {
            sectionIdsList.push(sectionId);
          }
          scanTree(s, currentQId, sectionId);
        });
      }
      if (node.questions) node.questions.forEach((q: any) => scanTree(q, String(q.questionId), topSectionId));
      if (node.childs?.length) {
        node.childs.forEach((c: any) => scanTree(c, currentQId, topSectionId));
      }
      if (node.questionId && node.allowSelect) {
        mandatoryQuestions.push(String(node.questionId));
        registerAnswerField(`q_${node.questionId}`, topSectionId);
      }
      if (node.answers) {
        if (node.questionId) {
          const answerIds = node.answers
            .filter((a: any) => a.allowCheck || a.allowSelect)
            .map((a: any) => String(a.answerId));
          if (answerIds.length > 0) {
            questionAnswerIds.set(String(node.questionId), answerIds);
          }
        }

        if (node.questionId && node.answers.some((a: any) => a.allowCheck || a.allowSelect)) {
          requiredRadios.push(String(node.questionId));
          registerAnswerField(`q_${node.questionId}`, topSectionId);
        }

        node.answers.forEach((ans: any) => {
          if (ans.allowCheck || ans.allowSelect || ans.allowRating || ans.allowText) {
            processAnswer(ans, currentQId, null, topSectionId);
          }
        });
      }
    };

    scanTree(apiData.value);
    topLevelSectionIds.value = sectionIdsList;
    fieldToTopSectionMap.value = fieldMap;

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
        mandatoryQuestions.forEach(qId => {
          const relatedAnswerIds = questionAnswerIds.get(qId) ?? [];
          const hasValue = !!safeData[`q_${qId}`]
            || relatedAnswerIds.some((ansId) => safeData[ansId] === true);

          if (!hasValue) {
            ctx.addIssue({
              code: zod.ZodIssueCode.custom,
              message: 'Bắt buộc chọn mục này',
              path: ['answersData', `q_${qId}`],
            });
          }
        });
        requiredRatings.forEach(id => {
          if (!safeData[id] || safeData[id] === 0) {
            ctx.addIssue({ code: zod.ZodIssueCode.custom, message: 'Vui lòng đánh giá', path: ['answersData', id] });
          }
        });
        requiredRadios.forEach(qId => {
          if (!safeData[`q_${qId}`]) {
            ctx.addIssue({ code: zod.ZodIssueCode.custom, message: 'Vui lòng chọn 1 đáp án', path: ['answersData', `q_${qId}`] });
          }
        });
        requiredTexts.forEach(id => {
          const text = String(safeData[id] ?? '');
          if (!text.trim()) {
            ctx.addIssue({ code: zod.ZodIssueCode.custom, message: 'Vui lòng nhập lý do', path: ['answersData', id] });
            return;
          }
          const formatErr = getNameFormatError(text);
          if (formatErr) {
            ctx.addIssue({ code: zod.ZodIssueCode.custom, message: formatErr, path: ['answersData', id] });
          }
        });
        conditionalTexts.forEach(cond => {
          let isParentSelected = cond.qId ? (String(safeData[`q_${cond.qId}`]) === cond.parentAnsId) : (safeData[cond.parentAnsId] === true);
          if (isParentSelected) {
            const text = String(safeData[cond.textId] ?? '');
            if (!text.trim()) {
              ctx.addIssue({ code: zod.ZodIssueCode.custom, message: 'Vui lòng nhập lý do chi tiết', path: ['answersData', cond.textId] });
              return;
            }
            const formatErr = getNameFormatError(text);
            if (formatErr) {
              ctx.addIssue({ code: zod.ZodIssueCode.custom, message: formatErr, path: ['answersData', cond.textId] });
            }
          }
        });
        if (checkboxIds.length > 0) {
          const selectedCount = checkboxIds.filter(id => safeData[id] === true).length;
          if (selectedCount === 0) {
            checkboxIds.forEach(id => {
              ctx.addIssue({ code: zod.ZodIssueCode.custom, message: `Vui lòng chọn ít nhất 1 lý do`, path: ['answersData', id] });
            });
          }
        }

        const userInfo = data?.userInfo;
        if (userInfo) {
          const nameFormatError = getModalNameFormatError(userInfo.employeeName || '');
          if (nameFormatError) {
            ctx.addIssue({ code: zod.ZodIssueCode.custom, message: nameFormatError, path: ['userInfo', 'employeeName'] });
          }

          const codeFormatError = getCodeFormatError(userInfo.employeeCode || '');
          if (codeFormatError) {
            ctx.addIssue({ code: zod.ZodIssueCode.custom, message: codeFormatError, path: ['userInfo', 'employeeCode'] });
          }

          const jobFormatError = getNameFormatError(userInfo.jobPositionName || '');
          if (jobFormatError) {
            ctx.addIssue({ code: zod.ZodIssueCode.custom, message: jobFormatError, path: ['userInfo', 'jobPositionName'] });
          }

          const orgKeywordFormatError = getOrganizationNameFormatError(orgSearchKeyword.value);
          if (orgKeywordFormatError) {
            ctx.addIssue({ code: zod.ZodIssueCode.custom, message: orgKeywordFormatError, path: ['userInfo', 'organizationId'] });
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

    resetFieldFormatErrors();

    orgSearchKeyword.value = apiData.value.organizationName || '';
    isFormReady.value = true;

  } catch (error) {
    console.error('Lỗi load form:', error);
    isFormReady.value = false;
    loadError.value = t('messages.submit_failed');
    validationSchema.value = toTypedSchema(pendingFormSchema);
    showToast('error', t('messages.notifi'), loadError.value);
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
  const el = event.target as HTMLInputElement;
  const keyword = el.value;
  orgSearchKeyword.value = keyword;
  fieldFormatErrors.value.organizationKeyword = getOrganizationNameFormatError(keyword);
  setFieldValue('userInfo.organizationId', 0);
  if (searchTimeout) clearTimeout(searchTimeout);

  if (fieldFormatErrors.value.organizationKeyword) {
    organizationList.value = [];
    showOrgList.value = false;
    return;
  }

  if (!keyword.trim()) {
    organizationList.value = [];
    showOrgList.value = false;
    return;
  }

  searchTimeout = setTimeout(async () => {
    isSearching.value = true;
    showOrgList.value = true;
    try {
      const res = await organization.postOrganization({ keyword: keyword.trim(), isActive: true });
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
  fieldFormatErrors.value.organizationKeyword = getOrganizationNameFormatError(org.name || '');
  showOrgList.value = false;
};

const clearOrgSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  orgSearchKeyword.value = '';
  fieldFormatErrors.value.organizationKeyword = '';
  setFieldValue('userInfo.organizationId', 0);
  organizationList.value = [];
  showOrgList.value = false;
};

// ==========================================
// SUBMIT FORM
// ==========================================
const scrollToElement = async (el: Element) => {
  await nextTick();

  const contentEl = resolveIonContentElement(el);
  const headerOffset = 72;

  if (contentEl?.getScrollElement) {
    try {
      const scrollEl = await contentEl.getScrollElement();
      const elRect = el.getBoundingClientRect();
      const scrollRect = scrollEl.getBoundingClientRect();
      const targetTop = elRect.top - scrollRect.top + scrollEl.scrollTop - headerOffset;

      if (contentEl.scrollToPoint) {
        await contentEl.scrollToPoint(0, Math.max(0, targetTop), 400);
        return;
      }
    } catch {
      // fallback below
    }
  }

  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const hasInfoSectionErrors = () => {
  const formatErrors = fieldFormatErrors.value;
  if (formatErrors.employeeName || formatErrors.employeeCode || formatErrors.jobPositionName || formatErrors.organizationKeyword) {
    return true;
  }

  return Object.keys(errors.value).some((key) => key.startsWith('userInfo.'));
};

const getAnswerErrorSectionIds = () => {
  const sectionIds = new Set<string>();

  Object.keys(errors.value).forEach((key) => {
    if (!key.startsWith('answersData.')) return;

    const fieldKey = key.slice('answersData.'.length);
    const sectionId = fieldToTopSectionMap.value[fieldKey];
    if (sectionId) sectionIds.add(sectionId);
  });

  return sectionIds;
};

const sectionHasVisibleAnswerError = (sectionEl: Element) =>
  !!sectionEl.querySelector(
    '.nested-childs textarea.is-invalid, .text-input-box textarea.is-invalid, .text-input-box .error-msg, .invalid-pill, .checkbox-card.is-invalid, .num-error',
  );

const getFirstAnswerErrorSectionElement = () => {
  const answerErrorSections = getAnswerErrorSectionIds();

  for (const sectionId of topLevelSectionIds.value) {
    if (answerErrorSections.has(sectionId)) {
      return document.getElementById(`form-section-${sectionId}`);
    }
  }

  for (const sectionId of topLevelSectionIds.value) {
    const sectionEl = document.getElementById(`form-section-${sectionId}`);
    if (sectionEl && sectionHasVisibleAnswerError(sectionEl)) {
      return sectionEl;
    }
  }

  return null;
};

const scrollToFirstValidationError = async () => {
  await nextTick();
  await nextTick();
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

  if (hasInfoSectionErrors()) {
    const infoSection = document.getElementById('form-section-info');
    if (infoSection) {
      await scrollToElement(infoSection);
      return;
    }
  }

  const answerSectionEl = getFirstAnswerErrorSectionElement();
  if (answerSectionEl) {
    await scrollToElement(answerSectionEl);
    return;
  }

  const formTop = document.querySelector('.info-section') ?? document.querySelector('.form-header');
  if (formTop) await scrollToElement(formTop);
};

const submitForm = handleSubmit(
  async (formValues) => {
    if (isSubmitting.value || loading.value || !isFormReady.value || !formValues.userInfo) return;

    try {
      isSubmitting.value = true;

      const finalAnswers: any[] = [];
      const rawData: Record<string, any> = (formValues.answersData || {}) as Record<string, any>;

      const extractPayload = (node: any, qId: string | null = null) => {
        if (!node) return;
        let currentQId = node.questionId ? String(node.questionId) : qId;

        if (node.answerId !== undefined) {
          let isChecked = false;
          if (node.allowCheck || node.allowSelect) {
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

      showToast('success', t('messages.notifi'), t('messages.submitted'));

      resetForm();
      orgSearchKeyword.value = '';
      isConfirmed.value = false;

      router.push('/app-menu');

    } catch (error: any) {
      console.error(error);
      const message = error?.response?.data?.message;
      showToast('error', t('messages.notifi'), message || t('messages.submit_failed'));
    } finally {
      isSubmitting.value = false;
    }
  },
  async () => {
    showToast('warn', t('messages.notifi'), t('messages.form_incomplete'));
    await scrollToFirstValidationError();
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
  padding: 10px;
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

.form-header .form-logo {
  display: block;
  width: min(260px, 80%);
  height: 88px;
  margin: 0 auto 16px;
  object-fit: contain;
}

.form-header h1 {
  font-size: 26px;
  font-weight: 800;
  color: #3182ce;
  margin-bottom: 5px;
}

.form-header .subtitle-cn {
  font-size: 18px;
  color: #3182ce;
  letter-spacing: 2px;
}

.custom-input {
  margin-bottom: 15px;
}

.custom-input label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #3182ce;
  margin-bottom: 8px;
}

.custom-input label span {
  font-weight: normal;
  color: #3182ce;
  margin-left: 5px;

  &.request {
    color: red;
    font-size: 17px;
  }
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

.search-input-box {
  position: relative;
}

.search-input-box input {
  padding-right: 40px;
}

.search-clear-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #a0aec0;
}

.search-clear-btn ion-icon {
  font-size: 20px;
}

.search-clear-btn:hover {
  color: #718096;
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