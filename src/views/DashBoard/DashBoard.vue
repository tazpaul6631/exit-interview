<template>
  <ion-page>
    <ion-content class="custom-page-content">
      <DashBoardDesktop />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
import DashBoardDesktop from './parts/DashBoardDesktop.vue';
</script>

<style scoped></style>