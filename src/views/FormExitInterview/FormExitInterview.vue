<template>
  <ion-page>
    <ion-content class="ion-padding custom-content">
      <ExitInterviewIpad :key="viewKey" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonPage, IonContent, onIonViewWillEnter } from '@ionic/vue';
import ExitInterviewIpad from '@/views/FormExitInterview/parts/ExitInterviewIpad.vue';

const viewKey = ref(0);

// Đây là nơi Page cha nhận tín hiệu từ Ionic
onIonViewWillEnter(() => {
  console.log('--- Quay lại trang: Làm mới toàn bộ Form ---');
  // Tăng key để ép component con mount lại (chạy lại onMounted)
  viewKey.value++;
});
</script>

<style lang="scss" scoped>
.custom-content {
  --background: #f4f7f9;
}
</style>