<template>
  <ion-page>
    <ion-content class="custom-page-content">
      <div class="error-container">
        <h1>404</h1>
        <p>Ối! Trang bạn tìm kiếm không tồn tại.</p>
        <ion-button fill="clear" @click="router.push('/dashboard')">
          Quay lại Dashboard
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonButton } from '@ionic/vue';
import { useRouter } from 'vue-router';
const router = useRouter();
</script>

<style scoped>
.error-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

h1 {
  font-size: 80px;
  font-weight: 900;
  color: #3182ce;
  margin: 0;
}

p {
  color: #718096;
  font-size: 18px;
}
</style>