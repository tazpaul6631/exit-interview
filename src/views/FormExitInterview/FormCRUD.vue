<template>
  <ion-page>
    <div class="page-content">

      <div class="left-panel">
        <ion-header class="ion-no-border">
          <ion-toolbar class="transparent-toolbar">
            <ion-title>Quản lý Sections</ion-title>
          </ion-toolbar>
        </ion-header>

        <ion-button expand="block" class="btn-create" @click="createSection">
          + Tạo thêm Section
        </ion-button>

        <div class="horizontal-divider"></div>

        <ion-list class="section-list" lines="none">
          <ion-item v-for="section in sections" :key="section.id" button
            :class="{ 'active-item': activeSectionId === section.id }" @click="selectSection(section.id)">
            <ion-label>
              <h3>{{ section.name }}</h3>
              <p v-if="section.id === activeSectionId && isDirty" class="text-danger">
                * Chưa lưu thay đổi
              </p>
            </ion-label>
            <ion-button
              v-if="section.id !== 'info' && section.id !== 'part1' && section.id !== 'part2' && section.id !== 'part3'"
              slot="end" fill="clear" color="danger" @click.stop="deleteSection(section.id)">
              Xóa
            </ion-button>
          </ion-item>
        </ion-list>
      </div>

      <div class="right-panel">

        <div v-if="!activeSectionId" class="empty-state">
          <p>Vui lòng chọn một mục bên trái để bắt đầu.</p>
        </div>

        <div v-else class="preview-card">

          <div class="card-header preview-header">
            <div>
              <h2>{{ currentSectionName }}</h2>
              <p class="subtitle-cn">Bản xem trước / Preview Mode</p>
            </div>
          </div>

          <div class="card-content preview-area">

            <div v-if="currentSection?.id === 'info'">
              <ion-grid>
                <ion-row>
                  <ion-col size="12" size-md="6" v-for="field in currentSection.fields" :key="'prev-' + field.id">
                    <div class="custom-input">
                      <label>{{ field.label }} <span v-if="field.subLabel">{{ field.subLabel }}</span></label>
                      <input v-if="field.inputType === 'text' || field.inputType === 'number'" :type="field.inputType"
                        placeholder="Dữ liệu mẫu..." disabled />
                      <ion-input v-if="field.inputType === 'date'" type="date" disabled
                        class="ion-date-input"></ion-input>
                    </div>
                  </ion-col>
                </ion-row>
              </ion-grid>
            </div>

            <div v-if="currentSection && currentSection.isCustom">
              <div v-for="ques in currentSection.questions" :key="'prev-' + ques.id" class="preview-question-block">
                <label class="ques-label-1">{{ ques.title }}</label>

                <div v-if="ques.type === 'text'">
                  <div v-for="opt in ques.options" :key="'opt-' + opt.id" class="mock-sub-text"
                    style="margin-top: 15px;">
                    <label style="display:block; margin-bottom: 8px; font-size: 14px; color: #4a5568;">
                      <ion-icon :icon="documentTextOutline"></ion-icon> <span>{{ opt.text }}</span>
                    </label>
                    <textarea disabled placeholder="Nhập câu trả lời..."></textarea>
                  </div>
                </div>

                <div v-if="ques.type === 'radio'" class="mock-options">
                  <div v-for="opt in ques.options" :key="'opt-' + opt.id" class="mock-option-item">
                    <ion-icon :icon="radioButtonOff"></ion-icon> <span>{{ opt.text }}</span>
                  </div>
                </div>

                <div v-if="ques.type === 'checkbox'" class="mock-options">
                  <div v-for="opt in ques.options" :key="'opt-' + opt.id" class="mock-option-item">
                    <ion-icon :icon="squareOutline"></ion-icon> <span>{{ opt.text }}</span>
                  </div>
                </div>

                <div v-if="ques.type === 'rating'" class="mock-rating-container">
                  <div v-for="opt in ques.options" :key="'opt-prev-' + opt.id" class="rating-row">
                    <div class="rating-info">
                      <p class="vn">{{ opt.text || 'Tiêu chí đánh giá...' }}</p>
                    </div>
                    <div class="rating-stars">
                      <div class="mock-star" v-for="n in (ques.maxRating || 5)" :key="'star-' + n">
                        {{ n }}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
              <div v-if="currentSection.questions.length === 0" class="empty-state" style="margin-top: 40px;">
                <p>Section này chưa có câu hỏi nào. Hãy bấm "CẤU HÌNH FORM" để thêm.</p>
              </div>
            </div>

          </div>

          <div class="card-footer">
            <div>
              <ion-button fill="outline" class="btn-open-builder" @click="openBuilder">
                <ion-icon slot="start" :icon="settingsOutline"></ion-icon>
                CẤU HÌNH FORM
              </ion-button>
            </div>
            <div>
              <ion-button color="light" @click="cancelEdit" :disabled="!isDirty">Khôi phục</ion-button>
              <ion-button color="primary" @click="saveSection" :disabled="!isDirty">LƯU CẤU TRÚC</ion-button>
            </div>
          </div>

        </div>
      </div>

      <div class="drawer-overlay" :class="{ 'is-active': isBuilderOpen }" @click="closeBuilder"></div>

      <div class="builder-drawer" :class="{ 'is-open': isBuilderOpen }">

        <div class="drawer-header">
          <h3>Công cụ thiết kế</h3>
          <button class="btn-close-drawer" @click="closeBuilder">
            <ion-icon :icon="closeOutline"></ion-icon>
          </button>
        </div>

        <div class="drawer-content">

          <div v-if="currentSection?.id === 'info'" class="form-builder-area">
            <div class="field-builder-card" v-for="field in currentSection.fields" :key="'build-' + field.id">
              <div class="field-header">
                <div class="field-labels">
                  <input v-model="field.label" type="text" class="edit-label main-label"
                    placeholder="Nhãn chính (VD: Tôi tên)" @input="markDirty" />
                  <input v-model="field.subLabel" type="text" class="edit-label sub-label"
                    placeholder="Nhãn phụ (VD: 姓名)" @input="markDirty" />
                </div>
                <button class="btn-icon text-danger" @click="removeField(field.id)">
                  <ion-icon :icon="trashOutline"></ion-icon>
                </button>
              </div>
              <div class="field-settings">
                <select v-model="field.inputType" class="type-selector" @change="markDirty">
                  <option value="text">Nhập chữ (Text)</option>
                  <option value="number">Nhập số (Number)</option>
                  <option value="date">Chọn ngày (Date)</option>
                </select>
              </div>
            </div>

            <ion-button fill="outline" expand="block" @click="addField">
              <ion-icon slot="start" :icon="addCircleOutline"></ion-icon>
              Thêm trường dữ liệu (Input)
            </ion-button>
          </div>

          <div v-if="currentSection && currentSection.isCustom" class="form-builder-area">

            <div class="custom-input builder-header">
              <input v-model="currentSection.name" type="text" class="section-title-input" placeholder="Tên section..."
                @input="markDirty" />
            </div>

            <div class="builder-question-card" v-for="ques in currentSection.questions" :key="'build-' + ques.id">
              <div class="question-header">
                <input v-model="ques.title" type="text" class="question-title-input" placeholder="Nhập câu hỏi..."
                  @input="markDirty" />
                <button class="btn-icon text-danger" @click="removeBuilderQuestion(ques.id)">
                  <ion-icon :icon="trashOutline"></ion-icon>
                </button>
              </div>

              <div class="question-type-selector">
                <select v-model="ques.type" @change="markDirty">
                  <option value="text">Trả lời ngắn (Text)</option>
                  <option value="radio">Trắc nghiệm (Radio)</option>
                  <option value="checkbox">Hộp kiểm (Checkbox)</option>
                  <option value="rating">Đánh giá (Rating)</option>
                </select>
              </div>

              <div class="options-builder" v-if="ques.type === 'text'">
                <div class="option-row" v-for="opt in ques.options" :key="'opt-build-' + opt.id">
                  <ion-icon :icon="documentTextOutline" class="opt-icon"></ion-icon>
                  <input v-model="opt.text" type="text" class="option-text-input"
                    placeholder="Nhập tiêu đề ô text phụ..." @input="markDirty" />
                  <button class="btn-icon text-muted" @click="removeBuilderOption(ques, opt.id)">
                    <ion-icon :icon="trashOutline"></ion-icon>
                  </button>
                </div>
                <button class="btn-add-option" @click="addBuilderOption(ques)">
                  + Thêm ô nhập liệu (Text)
                </button>
              </div>

              <div class="options-builder" v-if="ques.type === 'radio' || ques.type === 'checkbox'">
                <div class="option-row" v-for="opt in ques.options" :key="'opt-build-' + opt.id">
                  <ion-icon :icon="ques.type === 'radio' ? radioButtonOff : squareOutline" class="opt-icon"></ion-icon>
                  <input v-model="opt.text" type="text" class="option-text-input" placeholder="Nhập đáp án..."
                    @input="markDirty" />
                  <button class="btn-icon text-muted" @click="removeBuilderOption(ques, opt.id)">
                    <ion-icon :icon="trashOutline"></ion-icon>
                  </button>
                </div>
                <button class="btn-add-option" @click="addBuilderOption(ques)">
                  + Thêm tùy chọn
                </button>
              </div>

              <div class="options-builder" v-if="ques.type === 'rating'">

                <div class="rating-setting" style="margin-bottom: 15px;">
                  <label>Thang điểm tối đa:</label>
                  <select v-model="ques.maxRating" @change="markDirty" class="type-selector"
                    style="width: auto; margin-left: 10px; display: inline-block;">
                    <option :value="3">3 Điểm</option>
                    <option :value="5">5 Điểm</option>
                    <option :value="10">10 Điểm</option>
                  </select>
                </div>

                <div class="option-row" v-for="opt in ques.options" :key="'opt-build-' + opt.id">
                  <ion-icon :icon="starOutline" class="opt-icon"></ion-icon>
                  <input v-model="opt.text" type="text" class="option-text-input"
                    placeholder="Nhập tiêu chí đánh giá..." @input="markDirty" />
                  <button class="btn-icon text-muted" @click="removeBuilderOption(ques, opt.id)">
                    <ion-icon :icon="trashOutline"></ion-icon>
                  </button>
                </div>

                <button class="btn-add-option" @click="addBuilderOption(ques)">
                  + Thêm tiêu chí đánh giá
                </button>
              </div>
            </div>

            <ion-button fill="outline" expand="block" @click="addBuilderQuestion">
              <ion-icon slot="start" :icon="addCircleOutline"></ion-icon>
              Thêm câu hỏi mới
            </ion-button>
          </div>
        </div>

      </div>

    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonRow, IonCol, IonIcon,
  IonButton, IonList, IonItem, IonLabel, IonInput, IonGrid
} from '@ionic/vue';
import {
  trashOutline, addCircleOutline, radioButtonOff, squareOutline,
  settingsOutline, closeOutline, starOutline, documentTextOutline
} from 'ionicons/icons';

// --- ĐỊNH NGHĨA KIỂU DỮ LIỆU BUILDER ---
interface FormField { id: number; label: string; subLabel: string; inputType: 'text' | 'date' | 'number'; }
interface BuilderOption { id: number; text: string; }
interface BuilderQuestion { id: number; title: string; type: 'text' | 'radio' | 'checkbox' | 'rating'; options: BuilderOption[]; maxRating?: number; }
interface SectionDef { id: string; name: string; isCustom: boolean; questions: BuilderQuestion[]; fields?: FormField[]; }

// --- QUẢN LÝ LAYOUT & STATE ---
const activeSectionId = ref<string>('info');
const isDirty = ref(false);
const isBuilderOpen = ref(false);

const sections = ref<SectionDef[]>([
  // {
  //   id: 'info',
  //   name: 'Thông tin nhân viên',
  //   isCustom: false,
  //   questions: [],
  //   fields: [
  //     { id: 1, label: 'Tôi tên', subLabel: '姓名', inputType: 'text' },
  //     { id: 2, label: 'Mã Số', subLabel: '工號', inputType: 'text' },
  //     { id: 3, label: 'Hiện là', subLabel: '任職', inputType: 'text' },
  //     { id: 4, label: 'Ngày thôi việc', subLabel: '離職日期', inputType: 'date' }
  //   ]
  // },
]);

const currentSection = computed(() => sections.value.find(s => s.id === activeSectionId.value));
const currentSectionName = computed(() => currentSection.value ? currentSection.value.name : '');

const markDirty = () => { isDirty.value = true; };

const openBuilder = () => { isBuilderOpen.value = true; };
const closeBuilder = () => { isBuilderOpen.value = false; };

const selectSection = (id: string) => {
  if (isDirty.value && activeSectionId.value !== id) {
    alert('Vui lòng lưu thay đổi của Section hiện tại trước khi chuyển sang mục khác!');
    return;
  }
  activeSectionId.value = id;
  isBuilderOpen.value = false;
};

const deleteSection = (id: string) => {
  sections.value = sections.value.filter(s => s.id !== id);
  if (activeSectionId.value === id) activeSectionId.value = '';
};

const createSection = () => {
  if (isDirty.value) {
    alert('Vui lòng lưu thay đổi hiện tại trước khi tạo Section mới!');
    return;
  }
  const newId = new Date().getTime().toString();
  sections.value.push({ id: newId, name: `Section Mới`, isCustom: true, questions: [] });
  activeSectionId.value = newId;
  openBuilder();
};

const addField = () => {
  if (currentSection.value && currentSection.value.fields) {
    currentSection.value.fields.push({ id: new Date().getTime(), label: 'Nhãn mới', subLabel: '', inputType: 'text' });
    markDirty();
  }
};
const removeField = (fieldId: number) => {
  if (currentSection.value && currentSection.value.fields) {
    currentSection.value.fields = currentSection.value.fields.filter(f => f.id !== fieldId);
    markDirty();
  }
};

const addBuilderQuestion = () => {
  if (currentSection.value && currentSection.value.isCustom) {
    currentSection.value.questions.push({
      id: new Date().getTime(),
      title: 'Câu hỏi mới',
      type: 'text',
      options: [],
      maxRating: 5
    });
    markDirty();
  }
};
const removeBuilderQuestion = (questionId: number) => {
  if (currentSection.value && currentSection.value.isCustom) {
    currentSection.value.questions = currentSection.value.questions.filter(q => q.id !== questionId);
    markDirty();
  }
};
const addBuilderOption = (question: BuilderQuestion) => {
  question.options.push({ id: new Date().getTime(), text: `Tiêu chí ${question.options.length + 1}` });
  markDirty();
};
const removeBuilderOption = (question: BuilderQuestion, optionId: number) => {
  question.options = question.options.filter(opt => opt.id !== optionId);
  markDirty();
};

const saveSection = () => {
  console.log('Dữ liệu Schema chuẩn bị lưu:', currentSection.value);
  isDirty.value = false;
  alert('Đã lưu cấu trúc thành công!');
};

const cancelEdit = () => {
  isDirty.value = false;
};
</script>

<style scoped lang="scss">
/* --- LAYOUT CHUNG --- */
.page-content {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
  padding: 30px;
}

/* --- CỘT TRÁI --- */
.left-panel {
  width: 35%;
  min-width: 280px;
  max-width: 350px;
  background: white;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

.transparent-toolbar {
  --background: transparent;
  --border-width: 0;
}

.btn-create {
  margin: 16px;
  --border-radius: 8px;
  --background: #3182ce;
  font-weight: 600;
}

.horizontal-divider {
  height: 1px;
  background-color: #edf2f7;
  margin: 0 16px 8px 16px;
}

.section-list {
  flex: 1;
  overflow-y: auto;
  background: transparent;

  ion-item {
    --padding-start: 16px;
    --inner-padding-end: 16px;
    --background: transparent;
    cursor: pointer;
    margin: 4px 16px;
    border-radius: 8px;
    transition: 0.2s ease;

    h3 {
      font-size: 15px;
      font-weight: 500;
      color: #4a5568;
    }

    &.active-item {
      --background: #ebf8ff;
      border-left: 4px solid #3182ce;

      h3 {
        color: #3182ce;
        font-weight: 700;
      }
    }
  }
}

.text-danger {
  color: #e53e3e;
  font-size: 12px;
  margin-top: 4px;
}

/* --- CỘT PHẢI (PREVIEW AREA) --- */
.right-panel {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: #f4f7f9;
}

.empty-state {
  margin-top: 100px;
  color: #a0aec0;
  font-size: 16px;
  font-style: italic;
  text-align: center;
}

.preview-card {
  width: 100%;
  max-width: 800px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f7fafc;
  padding: 24px 30px;
  border-bottom: 1px solid #e2e8f0;

  h2 {
    margin: 0 0 5px 0;
    font-size: 22px;
    font-weight: 700;
    color: #2d3748;
  }

  .subtitle-cn {
    margin: 0;
    font-size: 14px;
    color: #718096;
    letter-spacing: 1px;
  }

  .btn-open-builder {
    --border-radius: 8px;
    font-weight: 600;
  }
}

.card-content {
  padding: 30px;
  flex: 1;
}

.card-footer {
  padding: 20px 30px;
  background: #fcfcfc;
  border-top: 1px solid #edf2f7;
  display: flex;
  justify-content: space-between;
  gap: 12px;

  ion-button {
    --border-radius: 8px;
    margin: 5px;
    font-weight: 600;
    height: 44px;
  }
}

/* CSS cho Preview Mẫu */
.custom-input {
  margin-bottom: 20px;

  label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #4a5568;
    margin-bottom: 8px;

    span {
      color: #a0aec0;
      font-weight: normal;
      margin-left: 5px;
    }
  }

  input,
  .ion-date-input {
    width: 100%;
    padding: 12px 15px;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    font-size: 15px;
    background: #fcfcfc;
    color: #718096;
    cursor: not-allowed;
  }
}

.preview-question-block {
  margin-bottom: 25px;

  .ques-label-1 {
    display: block;
    font-weight: bold;
    color: #2d3748;
    margin-bottom: 12px;
    font-size: 16px;
  }

  textarea {
    width: 100%;
    min-height: 80px;
    padding: 15px;
    border: 1.5px solid #e2e8f0;
    border-radius: 8px;
    background: #fcfcfc;
    cursor: not-allowed;
  }

  .mock-options {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .mock-option-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #4a5568;

      ion-icon {
        font-size: 22px;
        color: #a0aec0;
      }
    }
  }
}

/* CSS cho Preview Rating */
.rating-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px dashed #edf2f7;

  .vn {
    color: #2d3748;
    font-size: 15px;
    font-weight: 500;
    margin: 0;
  }

  .rating-stars {
    display: flex;
    gap: 10px;
  }
}

.mock-star {
  display: flex;
  width: 40px;
  height: 40px;
  border: 2px solid #e2e8f0;
  border-radius: 50%;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  color: #718096;
}

/* ================= SLIDING DRAWER ================= */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: stretch;
  background: rgba(0, 0, 0, 0.3);
  z-index: 99;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  margin-top: 70px;
  border-top-left-radius: 30px;

  &.is-active {
    opacity: 1;
    pointer-events: auto;
  }
}

.builder-drawer {
  position: fixed;
  top: 0;
  right: -450px;
  width: 450px;
  max-width: 90vw;
  height: stretch;
  background: #fff;
  box-shadow: -5px 0 25px rgba(0, 0, 0, 0.1);
  z-index: 100;
  transition: right 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #e2e8f0;
  margin-top: 70px;

  &.is-open {
    right: 0;
  }
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #2d3748;
  }

  .btn-close-drawer {
    background: none;
    border: none;
    font-size: 26px;
    color: #718096;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;

    &:hover {
      color: #e53e3e;
    }
  }
}

.drawer-content {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

/* CSS cho Builder */
.form-builder-area {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.builder-header .section-title-input {
  font-size: 20px;
  font-weight: 700;
  width: 100%;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 8px 0;
  outline: none;

  &:focus {
    border-bottom: 2px solid #3182ce;
  }
}

.builder-question-card,
.field-builder-card {
  background: #fff;
  border: 1px dashed #cbd5e0;
  border-radius: 8px;
  padding: 15px;
  transition: 0.2s;

  &:hover,
  &:focus-within {
    border-color: #3182ce;
    box-shadow: 0 4px 12px rgba(49, 130, 206, 0.1);
  }
}

.question-header,
.field-header {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 15px;
}

.question-title-input {
  flex: 1;
  font-weight: 600;
  padding: 8px 10px;
  background: #f7fafc;
  border: 1px solid transparent;
  border-bottom: 1px solid #cbd5e0;
  border-radius: 4px 4px 0 0;
  outline: none;

  &:focus {
    border-bottom: 2px solid #3182ce;
  }
}

.field-labels {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;

  .edit-label {
    border: none;
    border-bottom: 1px solid #e2e8f0;
    padding: 4px 0;
    outline: none;

    &:focus {
      border-bottom-color: #3182ce;
    }
  }

  .main-label {
    font-weight: 600;
  }

  .sub-label {
    font-size: 13px;
    color: #a0aec0;
  }
}

.question-type-selector select,
.field-settings select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  outline: none;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  margin-top: 15px;

  .opt-icon {
    color: #a0aec0;
    font-size: 20px;
  }

  .option-text-input {
    flex: 1;
    border: none;
    border-bottom: 1px solid #e2e8f0;
    padding: 6px 0;
    outline: none;

    &:focus {
      border-bottom: 1px solid #3182ce;
    }
  }
}

.btn-icon {
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  display: flex;
  align-items: center;

  &:hover {
    background: #edf2f7;
  }

  &.text-danger {
    color: #e53e3e;
  }

  &.text-muted {
    color: #a0aec0;
  }
}

.btn-add-option {
  background: transparent;
  border: none;
  color: #3182ce;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 30px;

  &:hover {
    text-decoration: underline;
  }
}

.rating-setting {
  background: #f7fafc;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;

  label {
    font-size: 13px;
    font-weight: 600;
    color: #4a5568;
  }
}
</style>