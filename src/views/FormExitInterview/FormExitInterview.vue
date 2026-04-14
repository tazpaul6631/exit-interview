<template>
  <ion-page>
    <ion-content class="ion-padding custom-content">
      <ExitInterviewIpad />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
import ExitInterviewIpad from '@/views/FormExitInterview/parts/ExitInterviewIpad.vue';

</script>

<style lang="scss" scoped>
.custom-content {
  --background: #f4f7f9;
}
</style>