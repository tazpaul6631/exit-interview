<template>
  <ion-page>
    <ion-header class="ion-no-border form-header">
      <ion-toolbar class="transparent-toolbar">
        <ion-buttons slot="start">
          <ion-button @click="goBack" color="primary">
            <ion-icon class="icon-back" :icon="arrowBackOutline"></ion-icon>
            <ion-title class="title-cn">Phỏng vấn thôi việc</ion-title>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content ref="formContentRef" class="ion-padding custom-content">
      <ExitInterviewIpad :key="viewKey" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue';
import { IonPage, IonContent, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle, onIonViewWillEnter } from '@ionic/vue';
import { arrowBackOutline } from 'ionicons/icons';
import ExitInterviewIpad from '@/views/FormExitInterview/parts/ExitInterviewIpad.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isFirstLoad = ref(true);
const viewKey = ref(0);
const formContentRef = ref<InstanceType<typeof IonContent> | null>(null);

provide('formExitIonContent', formContentRef);

onIonViewWillEnter(() => {
  if (isFirstLoad.value) {
    isFirstLoad.value = false;
  } else {
    viewKey.value++;
  }
});

const goBack = () => {
  router.back();
};
</script>

<style lang="scss" scoped>
.form-header {
  ion-toolbar {
    --background: #f4f7f9;
  }
}

.custom-content {
  --background: #f4f7f9;
}

.title-cn {
  color: #3182ce;
  font-size: 16px;
  line-height: 50px;
}

.icon-back {
  color: #3182ce;
  font-size: 24px;
}
</style>