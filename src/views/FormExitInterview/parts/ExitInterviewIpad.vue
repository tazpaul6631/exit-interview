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
                <input v-model="employeeName" type="text" placeholder="Nhập họ tên..."
                  :class="{ 'is-invalid': errors['userInfo.employeeName'] }" />
                <span class="error-msg" v-if="submitCount > 0 && errors['userInfo.employeeName']">
                  {{ errors['userInfo.employeeName'] }}
                </span>
              </div>
            </ion-col>
            <ion-col size="12" size-md="6">
              <div class="custom-input">
                <label>Mã Số <span>工號</span></label>
                <input v-model="employeeCode" type="text" placeholder="Nhập mã nhân viên..."
                  :class="{ 'is-invalid': errors['userInfo.employeeCode'] }" />
                <span class="error-msg" v-if="submitCount > 0 && errors['userInfo.employeeCode']">
                  {{ errors['userInfo.employeeCode'] }}
                </span>
              </div>
            </ion-col>
            <ion-col size="12" size-md="6">
              <div class="custom-input">
                <label>Hiện là <span>任職</span></label>
                <input v-model="jobPositionName" type="text" placeholder="Bộ phận/Chức vụ..."
                  :class="{ 'is-invalid': errors['userInfo.jobPositionName'] }" />
                <span class="error-msg" v-if="submitCount > 0 && errors['userInfo.jobPositionName']">
                  {{ errors['userInfo.jobPositionName'] }}
                </span>
              </div>
            </ion-col>
            <ion-col size="12" size-md="6">
              <div class="custom-input">
                <label>Ngày thôi việc <span>離職日期</span></label>
                <ion-input v-model="exitedAt" type="date" label-placement="stacked" class="ion-date-input"
                  :class="{ 'is-invalid': errors['userInfo.exitedAt'] }"></ion-input>
                <span class="error-msg" v-if="submitCount > 0 && errors['userInfo.exitedAt']">
                  {{ errors['userInfo.exitedAt'] }}
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

        <section class="section-box" v-if="apiData && apiData.sections[0]">
          <div class="section-title">
            <h3>{{ apiData.sections[0].name }}</h3>
          </div>
          <p class="instruction">({{ apiData.sections[0].childs[0].name }})</p>

          <p class="error-msg" v-if="submitCount > 0 && errors.selectedReasons"
            style="margin-left: 20px; margin-bottom: 10px;">
            {{ errors.selectedReasons }}
          </p>

          <div class="reason-grid">
            <template v-for="ans in apiData.sections[0].childs[0].answers" :key="ans.anwerId">

              <label v-if="ans.allowCheck"
                :class="['checkbox-card', { 'is-checked': selectedReasons.includes(ans.anwerId) }, { 'is-invalid': submitCount > 0 && errors.selectedReasons }]">

                <input type="checkbox" :value="ans.anwerId" v-model="selectedReasons"
                  :disabled="selectedReasons.length >= apiData.maxReasonSelect && !selectedReasons.includes(ans.anwerId)">

                <div class="card-body">
                  <span class="title-vn-cn"
                    :class="selectedReasons.length >= apiData.maxReasonSelect && !selectedReasons.includes(ans.anwerId) ? 'details' : ''">
                    {{ ans.anwerName }}
                  </span>
                </div>
              </label>

            </template>
          </div>
        </section>

        <section class="section-box" v-if="apiData?.sections?.[1]">
          <div class="section-title">
            <h3>{{ apiData.sections[1].name }}</h3>
          </div>

          <p v-if="apiData.sections[1].childs?.length > 0" class="instruction">
            ({{ apiData.sections[1].childs[0].name }})
          </p>

          <p class="error-msg" v-if="submitCount > 0 && errors.scores" style="margin-left: 20px;">
            {{ errors.scores }}
          </p>

          <div class="rating-container" v-if="apiData.sections[1].childs?.[0]?.answers">
            <template v-for="ans in apiData.sections[1].childs[0].answers" :key="ans.anwerId">

              <div v-if="ans.allowRating" class="rating-row">

                <div class="rating-info">
                  <p class="vn">{{ ans.anwerName }}</p>
                </div>

                <div class="rating-stars">
                  <label v-for="n in (apiData.maxRatingPoint || 5)" :key="n" class="star-item">
                    <input type="radio" :name="'rating-' + ans.anwerId" :value="n"
                      :checked="values.scores[ans.anwerId] === n" @change="setFieldValue(`scores.${ans.anwerId}`, n)">

                    <span class="num" :class="{ 'num-error': submitCount > 0 && !values.scores[ans.anwerId] }">
                      {{ n }}
                    </span>
                  </label>
                </div>

                <p class="error-msg" v-if="submitCount > 0 && errors[`scores.${ans.anwerId}` as any]">
                  {{ errors[`scores.${ans.anwerId}` as any] }}
                </p>
              </div>

            </template>
          </div>
        </section>

        <section class="section-box" v-if="apiData?.sections?.[2]">
          <div class="section-title">
            <h3>{{ apiData.sections[2].name }}</h3>
          </div>

          <div v-for="child in apiData.sections[2].childs" :key="child.id" class="question-block">
            <label class="ques-label-1">
              {{ child.name }}
            </label>

            <template v-for="ques in child.questions" :key="ques.id">

              <label class="ques-label-2">
                {{ ques.name }}
              </label>

              <div v-if="ques.answers.length > 1 && ques.answers[0].allowCheck" class="return-logic">
                <div class="radio-group">
                  <label v-for="ans in ques.answers" :key="ans.anwerId" class="pill-radio" :class="{
                    'active': values.answers?.[`q${ques.id}`]?.status === ans.anwerId,
                    'invalid-pill': submitCount > 0 && errors[`answers.q${ques.id}.status` as any]
                  }">
                    <input type="radio" :value="ans.anwerId"
                      :checked="values.answers?.[`q${ques.id}`]?.status === ans.anwerId"
                      @change="setFieldValue(`answers.q${ques.id}.status`, ans.anwerId)">
                    <span>{{ ans.anwerName }}</span>
                  </label>
                </div>

                <p class="error-msg" v-if="submitCount > 0 && errors[`answers.q${ques.id}.status` as any]">
                  {{ errors[`answers.q${ques.id}.status` as any] }}
                </p>

                <template v-for="ans in ques.answers" :key="'reason-' + ans.anwerId">
                  <transition name="fade">
                    <div v-if="values.answers?.[`q${ques.id}`]?.status === ans.anwerId && ans.childs?.length > 0">
                      <template v-for="childAns in ans.childs" :key="childAns.anwerId">
                        <div v-if="childAns.allowText">
                          <textarea :value="values.answers?.[`q${ques.id}`]?.reason"
                            @input="setFieldValue(`answers.q${ques.id}.reason`, ($event.target as HTMLTextAreaElement).value)"
                            :class="{ 'is-invalid': submitCount > 0 && errors[`answers.q${ques.id}.reason` as any] }"
                            :placeholder="childAns.anwerName || 'Vui lòng cho biết lý do... / 請說明原因...'">
                  </textarea>
                          <p class="error-msg" v-if="submitCount > 0 && errors[`answers.q${ques.id}.reason` as any]">
                            {{ errors[`answers.q${ques.id}.reason` as any] }}
                          </p>
                        </div>
                      </template>
                    </div>
                  </transition>
                </template>
              </div>

              <div v-else-if="ques.answers.length > 0 && ques.answers[0].allowText">
                <textarea :value="values.answers?.[`q${ques.id}`]?.text"
                  @input="setFieldValue(`answers.q${ques.id}.text`, ($event.target as HTMLTextAreaElement).value)"
                  :class="{ 'is-invalid': submitCount > 0 && errors[`answers.q${ques.id}.text` as any] }"
                  :placeholder="ques.answers[0].anwerName || 'Trả lời / 答...'">
    </textarea>
                <p class="error-msg" v-if="submitCount > 0 && errors[`answers.q${ques.id}.text` as any]">
                  {{ errors[`answers.q${ques.id}.text` as any] }}
                </p>
              </div>

            </template>
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
import interviewApi from '@/api/interview';

const loading = ref(true);
const isConfirmed = ref(false);
const { t } = useI18n();

interface ExitInterviewForm {
  userInfo: {
    employeeName: string;
    employeeCode: string;
    jobPositionName: string;
    exitedAt: string;
  };
  selectedReasons: number[];
  scores: Record<string, number>;
  answers: {
    [key: string]: any;
    q1: { text: string };
    q2: { text: string };
    q3: { status: string | number; reason: string };
  };
}

const apiData = ref<any>(null);

onMounted(async () => {
  try {
    const response = await interviewApi.getInterview();
    apiData.value = response.data.data;

    console.log('Dữ liệu chuẩn sau khi parse:', apiData.value);

    setFieldValue('userInfo.employeeName', apiData.value.employeeName || '');
    setFieldValue('userInfo.employeeCode', apiData.value.employeeCode || '');
    setFieldValue('userInfo.employeeCode', apiData.value.jobPositionName || '');

    // --- LOGIC CHO EDIT FORM ---
    if (apiData.value?.sections?.[0]?.childs?.[0]?.answers) {
      const answers = apiData.value.sections[0].childs[0].answers;
      const initialChecked = answers
        .filter((ans: any) => ans.checkValue === true)
        .map((ans: any) => ans.anwerId);

      setFieldValue('selectedReasons', initialChecked);
    }

    if (apiData.value?.sections?.[1]?.childs?.[0]?.answers) {
      const answersPart2 = apiData.value.sections[1].childs[0].answers;
      const initialScores: Record<string, number> = {};

      answersPart2.forEach((ans: any) => {
        if (ans.allowRating && ans.ratingValue > 0) {
          initialScores[ans.anwerId.toString()] = ans.ratingValue;
        }
      });

      setFieldValue('scores', initialScores);
    }

    if (apiData.value?.sections?.[2]?.childs) {
      const part3Childs = apiData.value.sections[2].childs;

      const initialAnswers: any = {
        q1: { text: '' },
        q2: { text: '' },
        q3: { status: '', reason: '' }
      };

      part3Childs.forEach((child: any) => {
        child.questions?.forEach((ques: any) => {
          // Nếu là câu hỏi text thường (Q1, Q2)
          if (ques.id === 1 || ques.id === 2) {
            const textAnswer = ques.answers?.find((a: any) => a.allowText);
            if (textAnswer) {
              initialAnswers[`q${ques.id}`].text = textAnswer.textValue || '';
            }
          }
          // Nếu là câu hỏi Yes/No (Q3)
          else if (ques.id === 3) {
            const yesAns = ques.answers?.find((a: any) => a.anwerId === 12);
            const noAns = ques.answers?.find((a: any) => a.anwerId === 13);

            if (yesAns?.checkValue) {
              initialAnswers.q3.status = 'yes';
            } else if (noAns?.checkValue) {
              initialAnswers.q3.status = 'no';

              const reasonAns = noAns.childs?.find((c: any) => c.anwerId === 14);
              if (reasonAns) {
                initialAnswers.q3.reason = reasonAns.textValue || '';
              }
            }
          }
        });
      });

      // Nạp dữ liệu vào Vee-Validate
      setFieldValue('answers', initialAnswers);
    }

  } catch (error) {
    console.error('Lỗi khi lấy thông tin phỏng vấn:', error);
  } finally {
    setTimeout(() => {
      loading.value = false;
    }, 800);
  }
});

// Schema này sẽ tự động chạy lại mỗi khi ngôn ngữ (locale) thay đổi
const validationSchema = computed(() => {
  const maxSelect = apiData.value?.maxReasonSelect || 2;
  const ratingQuestionsCount = apiData.value?.sections?.[1]?.childs?.[0]?.answers?.filter((a: any) => a.allowRating).length || 0;

  return toTypedSchema(
    zod.object({
      userInfo: zod.object({
        employeeName: zod.string().min(1, t('valid.required')),
        employeeCode: zod.string().min(1, t('valid.required')),
        jobPositionName: zod.string().min(1, t('valid.required')),
        exitedAt: zod.string().min(1, t('valid.required')),
      }),
      selectedReasons: zod.array(zod.number())
        .min(1, t('valid.min_reason', { n: 1 }))
        .max(maxSelect, t('valid.max_reason', { n: maxSelect })),
      scores: zod.record(zod.string(), zod.number({
        invalid_type_error: t('valid.rating_required')
      })).refine(
        (val) => Object.keys(val).length === ratingQuestionsCount && ratingQuestionsCount > 0,
        t('valid.rating_required')
      ),
      answers: zod.object({
        q1: zod.object({ text: zod.string().min(1, t('valid.required')) }),
        q2: zod.object({ text: zod.string().min(1, t('valid.required')) }),
        q3: zod.object({
          status: zod.union([zod.string(), zod.number()]).refine(val => val !== 0 && val !== '', t('valid.required')),
          reason: zod.string().optional()
        }).refine(data => {
          return data.status === 13 ? !!data.reason : true;
        }, {
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
    userInfo: { employeeName: '', employeeCode: '', jobPositionName: '', exitedAt: '' },
    selectedReasons: [],
    scores: {} as Record<string, number>,
    answers: {
      q1: { text: '' },
      q2: { text: '' },
      q3: { status: 0 as number | string, reason: '' }
    }
  }
});

// Mapping các trường để dùng v-model
const [employeeName] = defineField('userInfo.employeeName');
const [employeeCode] = defineField('userInfo.employeeCode');
const [jobPositionName] = defineField('userInfo.jobPositionName');
const [exitedAt] = defineField('userInfo.exitedAt');
const [selectedReasons] = defineField('selectedReasons');

// Hàm Submit
const submitForm = handleSubmit(async (formValues) => {
  try {
    const payload = JSON.parse(JSON.stringify(apiData.value));

    payload.employeeName = formValues.userInfo.employeeName;
    payload.employeeCode = formValues.userInfo.employeeCode;
    payload.jobPositionName = formValues.userInfo.jobPositionName;
    if (formValues.userInfo.exitedAt) {
      payload.exitedAt = new Date(formValues.userInfo.exitedAt).toISOString();
    }

    const part1Answers = payload.sections[0].childs[0].answers;
    part1Answers.forEach((ans: any) => {
      if (ans.allowCheck) {
        ans.checkValue = formValues.selectedReasons.includes(ans.anwerId);
      }
    });

    const part2Answers = payload.sections[1].childs[0].answers;
    part2Answers.forEach((ans: any) => {
      if (ans.allowRating) {
        ans.ratingValue = formValues.scores[ans.anwerId] || 0;
      }
    });

    const part3Childs = payload.sections[2].childs;
    part3Childs.forEach((child: any) => {
      child.questions?.forEach((ques: any) => {

        if (ques.id === 1 || ques.id === 2) {
          const textAnswer = ques.answers?.find((a: any) => a.allowText);
          if (textAnswer) {
            textAnswer.textValue = formValues.answers[`q${ques.id}`].text;
          }
        }
        else if (ques.id === 3) {
          const yesAns = ques.answers?.find((a: any) => a.anwerId === 12);
          const noAns = ques.answers?.find((a: any) => a.anwerId === 13);

          if (yesAns) {
            yesAns.checkValue = (formValues.answers.q3.status === 12);
          }
          if (noAns) {
            noAns.checkValue = (formValues.answers.q3.status === 13);

            const reasonAns = noAns.childs?.find((c: any) => c.anwerId === 14);
            if (reasonAns) {
              reasonAns.textValue = (formValues.answers.q3.status === 13) ? formValues.answers.q3.reason : '';
            }
          }
        }
      });
    });

    // console.log('Payload chuẩn bị gửi lên server:', payload);
    console.log('Payload chuẩn bị gửi lên server:\n', JSON.stringify(payload, null, 2));
    alert('Gửi thành công!');
  } catch (error) {
    console.error(error);
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
.section-box {
  padding-bottom: 30px;
}

.section-title {
  background: #f7fafc;
  padding: 12px 20px;
  border-left: 4px solid #3182ce;
  margin-bottom: 10px;

  h3 {
    margin: 0;
    font-size: 17px;
    color: #2d3748;
    font-weight: bold;
  }
}

.instruction {
  font-style: italic;
  font-size: 13px;
  color: #2d3748;
  margin-left: 20px;
  margin-bottom: 20px;
  font-weight: bold;
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
      color: #1b1d1f;
      font-size: 15px;
      transition: all 0.2s;
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
      color: #1b1d1f;
      font-size: 15px;
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

  .ques-label-1 {
    font-style: italic;
    display: block;
    font-weight: bold;
    color: #2d3748;
    margin-bottom: 12px;
    font-size: 13px;
    margin-left: 20px;

  }

  .ques-label-2 {
    display: block;
    color: #2d3748;
    margin-bottom: 12px;
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
  margin-bottom: 40px;

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