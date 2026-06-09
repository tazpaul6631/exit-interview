<template>
  <ion-page>
    <ion-content class="ion-padding custom-content">
      <ion-header class="ion-no-border">
        <ion-toolbar class="transparent-toolbar">
          <ion-buttons slot="start">
            <ion-button @click="goBack" color="primary">
              <ion-icon :icon="arrowBackOutline"></ion-icon>
            </ion-button>
          </ion-buttons>
          <ion-title>Phỏng vấn thôi việc</ion-title>
        </ion-toolbar>
      </ion-header>
      <ExitInterviewIpad :key="viewKey" />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonPage, IonContent, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle, onIonViewWillEnter } from '@ionic/vue';
import { arrowBackOutline } from 'ionicons/icons';
import ExitInterviewIpad from '@/views/FormExitInterview/parts/ExitInterviewIpad.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isFirstLoad = ref(true);
const viewKey = ref(0);

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
.custom-content {
  --background: #f4f7f9;
}
</style>