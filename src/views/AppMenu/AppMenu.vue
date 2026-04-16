<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar color="primary">
        <ion-title>Menu Ứng Dụng</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="menu-container">
        <h2>Xin chào, đây là giao diện App!</h2>
        <p>Chọn chức năng bạn muốn thực hiện:</p>

        <ion-list lines="none">
          <ion-item button @click="goToFormExit" class="menu-item shadow-sm">
            <ion-icon :icon="documentTextOutline" slot="start" color="primary"></ion-icon>
            <ion-label>
              <h3>Phỏng vấn thôi việc</h3>
              <p>Thực hiện đánh giá exit interview</p>
            </ion-label>
          </ion-item>
        </ion-list>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
  IonIcon, IonLabel
} from '@ionic/vue';
import { documentTextOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';


const router = useRouter();

// Thêm từ khóa async vào hàm
const goToFormExit = async () => {
  router.push('/formExit');
};
</script>

<style scoped>
.menu-container {
  max-width: 600px;
  margin: 0 auto;
}

.menu-item {
  --background: #f8fafc;
  --border-radius: 12px;
  margin-bottom: 15px;
  --padding-start: 15px;
}
</style>