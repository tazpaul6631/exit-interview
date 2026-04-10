<template>
    <ion-page>
        <ion-header>
            <ion-toolbar color="primary">
                <ion-title>Login</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <h1>Xin Chào!</h1>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    onIonViewWillEnter, onIonViewWillLeave
} from '@ionic/vue';
import { onMounted, ref } from 'vue';
import { useAuthStore } from '@/store/auth';
import request from '@/services/apiService';

const authStore = useAuthStore();
const patrolData = ref([]);

// 1. Chạy 1 lần duy nhất khi nạp app
onMounted(() => {
    console.log('Trang đã được tạo');
});

// 2. Chạy MỖI KHI người dùng quay lại tab này
onIonViewWillEnter(async () => {
    console.log('User vào trang, kiểm tra mạng...');
    if (authStore.isOnline) {
        // Gọi API lấy dữ liệu mới nhất
        try {
            // const res = await request.get('/patrol/status');
            // patrolData.value = res.data;
        } catch (err) {
            console.error('Lỗi lấy dữ liệu online');
        }
    } else {
        // Lấy dữ liệu từ SQLite nếu đang offline
        console.log('Đang offline, dùng dữ liệu cũ');
    }
});

// 3. Chạy khi người dùng chuyển sang tab khác
onIonViewWillLeave(() => {
    console.log('User đã rời trang, tắt camera/sensor nếu có');
});
</script>