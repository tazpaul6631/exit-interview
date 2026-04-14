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
                <label>Tôi tên <span>姓名</span></label>
                <input v-model="name" type="text" placeholder="Nhập họ tên..."
                  :class="{ 'is-invalid': errors['userInfo.name'] }" />
                <span class="error-msg" v-if="submitCount > 0 && errors['userInfo.name']">
                  {{ errors['userInfo.name'] }}
                </span>
              </div>
            </ion-col>
            <ion-col size="12" size-md="6">
              <div class="custom-input">
                <label>Mã Số <span>工號</span></label>
                <input v-model="code" type="text" placeholder="Nhập mã nhân viên..."
                  :class="{ 'is-invalid': errors['userInfo.code'] }" />
                <span class="error-msg" v-if="submitCount > 0 && errors['userInfo.code']">
                  {{ errors['userInfo.code'] }}
                </span>
              </div>
            </ion-col>
            <ion-col size="12" size-md="6">
              <div class="custom-input">
                <label>Hiện là <span>任職</span></label>
                <input v-model="position" type="text" placeholder="Bộ phận/Chức vụ..."
                  :class="{ 'is-invalid': errors['userInfo.position'] }" />
                <span class="error-msg" v-if="submitCount > 0 && errors['userInfo.position']">
                  {{ errors['userInfo.position'] }}
                </span>
              </div>
            </ion-col>
            <ion-col size="12" size-md="6">
              <div class="custom-input">
                <label>Ngày thôi việc <span>離職日期</span></label>
                <ion-input v-model="resignDate" type="date" label-placement="stacked" class="ion-date-input"
                  :class="{ 'is-invalid': errors['userInfo.resignDate'] }"></ion-input>
                <span class="error-msg" v-if="submitCount > 0 && errors['userInfo.resignDate']">
                  {{ errors['userInfo.resignDate'] }}
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

      <div v-if="!loading && values" class="dynamic-content">

        <section class="section-box">
          <div class="section-title">
            <h3>PHẦN 1: LÝ DO CHÍNH NGHỈ VIỆC/ 第一部分：離職主因</h3>
          </div>
          <p class="instruction">(Vui lòng chọn 1-2 lý do chính / 請勾選最主要的 1-2項)</p>

          <p class="error-msg" v-if="submitCount > 0 && errors.selectedReasons"
            style="margin-left: 20px; margin-bottom: 10px;">
            {{ errors.selectedReasons }}
          </p>

          <div class="reason-grid">
            <label v-for="item in dynamicData.reasons" :key="item.id"
              :class="['checkbox-card', { 'is-checked': selectedReasons.includes(item.id) }, { 'is-invalid': submitCount > 0 && errors.selectedReasons }]">
              <input type="checkbox" :value="item.id" v-model="selectedReasons"
                :disabled="selectedReasons.length >= 2 && !selectedReasons.includes(item.id)">
              <div class="card-body">
                <span class=" title-vn-cn"
                  :class="selectedReasons.length >= 2 && !selectedReasons.includes(item.id) ? 'details' : ''"">{{ item.titleVN }}/ {{ item.titleCN }}</span>
                <small class=" details">{{ item.description }}</small>
              </div>
            </label>
          </div>
        </section>

        <section class="section-box">
          <div class="section-title">
            <h3>PHẦN 2: ĐÁNH GIÁ THỰC TẾ/ 第二部分：現場評價</h3>
          </div>
          <p class="instruction">(5 điểm là rất hài lòng / 5分為最滿意)</p>

          <p class="error-msg" v-if="submitCount > 0 && errors.scores" style="margin-left: 20px;">
            {{ errors.scores }}
          </p>

          <div class="rating-container">
            <div v-for="rate in dynamicData.ratings" :key="rate.id" class="rating-row">

              <div class="rating-info">
                <p class="vn">{{ rate.labelVN }}</p>
              </div>

              <div class="rating-stars">
                <label v-for="n in 5" :key="n" class="star-item">
                  <input type="radio" :name="'rating-' + rate.id" :value="n" :checked="values.scores[rate.id] === n"
                    @change="setFieldValue(`scores.${rate.id}`, n)">

                  <span class="num" :class="{ 'num-error': submitCount > 0 && !values.scores[rate.id] }">
                    {{ n }}
                  </span>
                </label>
              </div>

              <p class="error-msg" v-if="submitCount > 0 && errors[`scores.${rate.id}` as any]">
                {{ errors[`scores.${rate.id}` as any] }}
              </p>
            </div>
          </div>
        </section>

        <section class="section-box">
          <div class="section-title">
            <h3>PHẦN 3: CÁC CÂU HỎI TRỌNG TÂM/ 第三部分：核心問答</h3>
          </div>

          <div v-for="ques in dynamicData.questions" :key="ques.id" class="question-block">
            <label class="ques-label">
              {{ ques.textVN }} <br />
              <span class="cn-text">{{ ques.textCN }}</span>
            </label>

            <div v-if="ques.type === 'will_return'" class="return-logic">
              <div class="radio-group">
                <label class="pill-radio" :class="{
                  'active': values.answers[ques.id].status === 'yes',
                  'invalid-pill': submitCount > 0 && errors[`answers.${ques.id}.status` as any]
                }">
                  <input type="radio" value="yes" :checked="values.answers[ques.id].status === 'yes'"
                    @change="setFieldValue(`answers.${ques.id}.status`, 'yes')">
                  <span>Đồng ý / 願意</span>
                </label>

                <label class="pill-radio" :class="{
                  'active': values.answers[ques.id].status === 'no',
                  'invalid-pill': submitCount > 0 && errors[`answers.${ques.id}.status` as any]
                }">
                  <input type="radio" value="no" :checked="values.answers[ques.id].status === 'no'"
                    @change="setFieldValue(`answers.${ques.id}.status`, 'no')">
                  <span>Không đồng ý / 不願意</span>
                </label>
              </div>

              <p class="error-msg" v-if="submitCount > 0 && errors[`answers.${ques.id}.status` as any]">
                {{ errors[`answers.${ques.id}.status` as any] }}
              </p>

              <transition name="fade">
                <div v-if="values.answers[ques.id].status === 'no'">
                  <textarea :value="values.answers[ques.id].reason"
                    @input="setFieldValue(`answers.${ques.id}.reason`, ($event.target as HTMLTextAreaElement).value)"
                    :class="{ 'is-invalid': submitCount > 0 && errors[`answers.${ques.id}.reason` as any] }"
                    placeholder="Vui lòng cho biết lý do... / 請說明原因...">
                  </textarea>
                  <p class="error-msg" v-if="submitCount > 0 && errors[`answers.${ques.id}.reason` as any]">
                    {{ errors[`answers.${ques.id}.reason` as any] }}
                  </p>
                </div>
              </transition>
            </div>

            <div v-else>
              <textarea :value="values.answers[ques.id].text"
                @input="setFieldValue(`answers.${ques.id}.text`, ($event.target as HTMLTextAreaElement).value)"
                :class="{ 'is-invalid': submitCount > 0 && errors[`answers.${ques.id}.text` as any] }"
                placeholder="Trả lời / 答...">
              </textarea>
              <p class="error-msg" v-if="submitCount > 0 && errors[`answers.${ques.id}.text` as any]">
                {{ errors[`answers.${ques.id}.text` as any] }}
              </p>
            </div>
          </div>
        </section>
      </div>

      <footer class="hr-guidelines">
        <div class="guide-header">
          <ion-icon :icon="informationCircleOutline"></ion-icon>
          <h4>Lưu ý cho HR/ HR 使用小叮嚀:</h4>
        </div>
        <ul>
          <li><strong>Tạo không khí thoải mái:</strong> Thái độ thân thiện, tránh gây áp lực.</li>
          <li><strong>Ghi chép khách quan:</strong> Ghi lại sự thật, không phán xét.</li>
          <li><strong>Ngôn ngữ:</strong> Điều chỉnh linh hoạt theo vùng miền.</li>
        </ul>
      </footer>

      <div class="form-actions">
        <label class="checkbox-confirm">
          <input type="checkbox" v-model="isConfirmed">
          <span>Tôi xác nhận các nội dung trên là đúng sự thật/ 我確認以上信息準確無誤</span>
        </label>

        <ion-button expand="block" class="submit-btn" :disabled="!isConfirmed" @click="submitForm">
          GỬI BIÊN BẢN / 提交表單
        </ion-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as zod from 'zod';
import {
  IonGrid, IonRow, IonCol, IonButton,
  IonSpinner, IonIcon, IonInput
} from '@ionic/vue';
import { informationCircleOutline } from 'ionicons/icons';

const loading = ref(true);
const isConfirmed = ref(false);
const { t } = useI18n();

interface ExitInterviewForm {
  userInfo: {
    name: string;
    code: string;
    position: string;
    resignDate: string;
  };
  selectedReasons: number[];
  scores: Record<string, number>;
  answers: {
    [key: string]: any;
    q1: { text: string };
    q2: { text: string };
    q3: { status: string; reason: string };
  };
}

const dynamicData = ref({
  reasons: [
    { id: 1, titleVN: 'Lương thưởng & Phúc lợi', titleCN: '薪資福利', description: 'Lương thấp, ít tăng ca, thưởng không minh bạch.' },
    { id: 2, titleVN: 'Vấn đề quản lý', titleCN: '管理問題', description: 'Tổ trưởng gắt gỏng, không công bằng.' },
    { id: 3, titleVN: 'Môi trường làm việc', titleCN: '工作環境', description: 'Xưởng nóng/ồn, nặng nhọc, quấy rối.' },
    { id: 4, titleVN: 'Chế độ đãi ngộ', titleCN: '福利伙食', description: 'Cơm không ngon, ký túc xá kém.' },
    { id: 5, titleVN: 'Lý do cá nhân', titleCN: '個人因素', description: 'Gia đình, sức khỏe, nhà xa, về quê.' },
  ],
  ratings: [
    { id: 'r1', labelVN: 'Cách quản lý của cấp trên trực tiếp', labelCN: '現場主管的管理方式' },
    { id: 'r2', labelVN: 'Sự công bằng trong phân công công việc', labelCN: '工作分配的公平性' },
    { id: 'r3', labelVN: 'Tình trạng an toàn và thiết bị tại xưởng', labelCN: '現場安全與設備狀況' },
    { id: 'r4', labelVN: 'Mức độ hài lòng chung đối với công ty', labelCN: '對公司的整體滿意度' },
  ],
  questions: [
    { id: 'q1', type: 'text', textVN: 'Điểm nào của công việc mới tốt hơn công ty mình?', textCN: '新工作的哪一點比我們公司好？' },
    { id: 'q2', type: 'text', textVN: 'Nếu bạn là sếp, bạn muốn thay đổi quy định nào nhất tại xưởng?', textCN: '如果你是老闆，你最想改變現場哪一個規定？' },
    { id: 'q3', type: 'will_return', textVN: 'Sau này nếu điều kiện cải thiện, bạn có muốn quay lại không?', textCN: '未來如果條件改善，你願意回來工作嗎？' },
  ]
});

onMounted(() => {
  setTimeout(() => {
    loading.value = false;
  }, 800);
});

// Schema này sẽ tự động chạy lại mỗi khi ngôn ngữ (locale) thay đổi
const validationSchema = computed(() => {
  return toTypedSchema(
    zod.object({
      userInfo: zod.object({
        name: zod.string().min(1, t('valid.required')),
        code: zod.string().min(1, t('valid.required')),
        position: zod.string().min(1, t('valid.required')),
        resignDate: zod.string().min(1, t('valid.required')),
      }),
      selectedReasons: zod.array(zod.number())
        .min(1, t('valid.min_reason', { n: 1 }))
        .max(2, t('valid.max_reason', { n: 2 })),
      scores: zod.record(zod.string(), zod.number({
        invalid_type_error: t('valid.rating_required')
      })).refine(
        (val) => Object.keys(val).length === dynamicData.value.ratings.length,
        t('valid.rating_required')
      ),
      answers: zod.object({
        q1: zod.object({ text: zod.string().min(1, t('valid.required')) }),
        q2: zod.object({ text: zod.string().min(1, t('valid.required')) }),
        q3: zod.object({
          status: zod.string().min(1, t('valid.required')),
          reason: zod.string().optional()
        }).refine(data => data.status === 'no' ? !!data.reason : true, {
          message: t('valid.required'),
          path: ['reason']
        })
      })
    })
  );
});

// Khởi tạo form với VeeValidate
const { handleSubmit, errors, defineField, values, submitCount, setFieldValue } = useForm<ExitInterviewForm>({
  validationSchema,
  initialValues: {
    userInfo: { name: '', code: '', position: '', resignDate: '' },
    selectedReasons: [],
    scores: {} as Record<string, number>,
    answers: {
      q1: { text: '' },
      q2: { text: '' },
      q3: { status: '', reason: '' }
    }
  }
});

// Mapping các trường để dùng v-model
const [name] = defineField('userInfo.name');
const [code] = defineField('userInfo.code');
const [position] = defineField('userInfo.position');
const [resignDate] = defineField('userInfo.resignDate');
const [selectedReasons] = defineField('selectedReasons');

// Hàm Submit
const submitForm = handleSubmit(async (values) => {
  console.log(values);
  try {
    console.log(1);

    // await api.post('/exit-interview', values);
    alert('Gửi thành công!');
  } catch (error) {
    alert('Lỗi gửi dữ liệu');
  }
});
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
  /* Tối ưu cho Tab A9+ */
  min-height: 100vh;
  padding: 40px;
  border-radius: 4px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: #3182ce;
    border-radius: 4px 4px 0 0;
  }
}

/* Header */
.form-header {
  text-align: center;
  margin-bottom: 40px;

  h1 {
    font-size: 26px;
    font-weight: 800;
    color: #2d3748;
    margin-bottom: 5px;
  }

  .subtitle-cn {
    font-size: 18px;
    color: #718096;
    letter-spacing: 2px;
  }
}

/* Inputs */
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
      color: #a0aec0;
      margin-left: 5px;
    }
  }

  input {
    width: 100%;
    padding: 12px 15px;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    font-size: 16px;
    outline: none;
    transition: all 0.2s;

    &:focus {
      border-color: #3182ce;
      box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
    }
  }
}

.divider {
  height: 1px;
  background: #edf2f7;
  margin: 30px 0;
}

/* Section Title */
.section-title {
  background: #f7fafc;
  padding: 12px 20px;
  border-left: 4px solid #3182ce;
  margin-bottom: 10px;

  h3 {
    margin: 0;
    font-size: 18px;
    color: #2d3748;

    small {
      font-weight: normal;
      color: #718096;
      margin-left: 10px;
    }
  }
}

.instruction {
  font-style: italic;
  font-size: 13px;
  color: #a0aec0;
  margin-left: 20px;
  margin-bottom: 20px;
}

/* Part 1: Grid Checkbox */
.reason-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 15px;
  padding: 0 10px;
}

.checkbox-card {
  display: flex;
  align-items: flex-start;
  padding: 15px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;

  input {
    width: 22px;
    height: 22px;
    margin-right: 15px;
    margin-top: 2px;
  }

  .card-body {
    .title-vn-cn {
      display: block;
      font-weight: 600;
      color: #2d3748;
      font-size: 15px;
    }

    .details {
      font-size: 14px;
      color: #98a7bb;
      margin-top: 5px;
      line-height: 1.4;
      transition: all 0.2s;
    }
  }

  &.is-checked {
    border-color: #3182ce;
    background-color: #ebf8ff;
  }
}

/* Part 2: Ratings */
.rating-container {
  padding: 0 10px;
}

.rating-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px dashed #edf2f7;

  .rating-info {
    max-width: 60%;

    .vn {
      font-weight: 500;
      color: #4a5568;
      margin: 0;
    }

    .cn {
      font-size: 13px;
      color: #a0aec0;
      margin: 0;
    }
  }

  .rating-stars {
    display: flex;
    gap: 12px;
  }
}

.star-item {
  cursor: pointer;

  input {
    display: none;
  }

  .num {
    display: flex;
    width: 48px;
    height: 48px;
    border: 2px solid #e2e8f0; // Màu mặc định
    border-radius: 50%;
    justify-content: center;
    align-items: center;
    font-weight: 700;
    color: #718096;
    transition: 0.2s;

    // Khi có lỗi (chưa chọn)
    &.num-error {
      border-color: var(--ion-color-danger) !important;
      background-color: #fff5f5;
    }
  }

  input:checked+.num {
    background: #3182ce !important;
    border-color: #3182ce !important;
    color: white !important;
    transform: scale(1.1);
  }
}

/* Part 3: Questions */
.question-block {
  margin-bottom: 30px;
  padding: 0 10px;

  .ques-label {
    display: block;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 12px;

    .cn-text {
      font-weight: normal;
      color: #a0aec0;
      font-size: 14px;
    }
  }

  textarea {
    width: 100%;
    min-height: 100px;
    padding: 15px;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    font-family: inherit;
    font-size: 15px;
    background: #fcfcfc;

    &:focus {
      border-color: #3182ce;
      outline: none;
      background: #fff;
    }
  }
}

.radio-group {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.pill-radio {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  background: #f7fafc;
  padding: 10px 20px;
  border-radius: 30px;
  border: 1.5px solid #e2e8f0;
  transition: all 0.2s ease;

  input {
    width: 18px;
    height: 18px;
  }

  span {
    font-weight: 500;
    color: #4a5568;
  }

  &.invalid-pill {
    border-color: var(--ion-color-danger);
    background-color: #fff5f5; // Nền đỏ nhạt để cảnh báo

    span {
      color: var(--ion-color-danger);
    }
  }

  &:has(input:checked) {
    border-color: #3182ce;
    background: #ebf8ff;

    span {
      color: #3182ce;
      font-weight: 700;
    }
  }
}

/* HR Note */
.hr-guidelines {
  background: #fffaf0;
  border: 1px solid #feebc8;
  border-radius: 12px;
  padding: 25px;
  margin: 40px 0;

  .guide-header {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #c05621;
    margin-bottom: 15px;

    ion-icon {
      font-size: 24px;
    }

    h4 {
      margin: 0;
      font-size: 17px;
    }
  }

  ul {
    margin: 0;
    padding-left: 20px;

    li {
      color: #7b341e;
      margin-bottom: 8px;
      font-size: 14px;
    }
  }
}

/* Action Area */
.form-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;

  .checkbox-confirm {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    cursor: pointer;
    width: 100%;

    input {
      width: 20px;
      height: 20px;
    }

    span {
      font-size: 15px;
      color: #2d3748;
      line-height: 1.4;
    }

    small {
      color: #a0aec0;
    }
  }

  .submit-btn {
    --border-radius: 12px;
    --background: #3182ce;
    width: 100%;
    max-width: 400px;
    height: 60px;
    font-weight: 700;
    font-size: 18px;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .paper-form {
    padding: 20px;
  }

  .reason-grid {
    grid-template-columns: 1fr;
  }

  .rating-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Style để ion-input trông giống các input text hiện tại của bạn */
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
}

.ion-date-input {
  /* Tắt gạch chân mặc định của Ionic */
  --highlight-height: 0;
  --inner-border-width: 0;
  --border-width: 0;
  --show-full-highlight: 0;
}

.is-invalid {
  border: 1px solid var(--ion-color-danger) !important;
  background-color: #fff8f8;
}

.error-msg {
  color: var(--ion-color-danger);
  font-size: 15px;
  margin-top: 4px;
  font-weight: 500;
}

.pill-radio {
  &.active {
    border-color: #3182ce;
    background: #ebf8ff;

    span {
      color: #3182ce;
      font-weight: 700;
    }
  }
}

.question-block {
  textarea {
    width: 100%;
    margin-top: 10px;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;

    &.is-invalid {
      border-color: var(--ion-color-danger);
    }
  }
}

textarea {
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &.is-invalid {
    border-color: var(--ion-color-danger) !important;
    background-color: #fff8f8;
  }
}
</style>