<template>
  <div class="mobile-login-wrapper animate__animated animate__fadeIn">
    <div class="top-background"></div>

    <div class="content-wrapper">
      <div class="form-container shadow-lg">
        <div class="form-inner">
          <div class="side-info">
            <img src="/assets/icon/icon.png" alt="Logo" class="form-logo" />
            <div class="login-header ion-padding">
              <h3>Xin chào!</h3>
              <p>Hệ thống phỏng vấn thôi việc</p>
            </div>
          </div>

          <div class="side-form">
            <div class="input-group">
              <ion-item lines="none" class="custom-input shadow-sm">
                <ion-icon :icon="personOutline" slot="start"></ion-icon>
                <ion-input label="Mã nhân viên" label-placement="floating" placeholder="Nhập tài khoản"></ion-input>
              </ion-item>

              <ion-item lines="none" class="custom-input shadow-sm ion-margin-top">
                <ion-icon :icon="lockClosedOutline" slot="start"></ion-icon>
                <ion-input type="password" label="Mật khẩu" label-placement="floating"
                  placeholder="********"></ion-input>
              </ion-item>
            </div>

            <ion-button expand="block" class="login-btn" @click="$emit('doLogin')">
              ĐĂNG NHẬP
              <ion-icon slot="end" :icon="arrowForwardOutline"></ion-icon>
            </ion-button>
          </div>
        </div>

        <div class="footer-note">
          <p>© 2026 Jia Hsin Members</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon, IonItem, IonInput, IonButton } from '@ionic/vue';
import { personOutline, lockClosedOutline, arrowForwardOutline } from 'ionicons/icons';
defineEmits(['doLogin']);
</script>

<style scoped>
.mobile-login-wrapper {
  background: #f4f7f9;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.top-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 250px;
  background-image: url('/assets/cty.png');
  background-size: cover;
  background-position: center;
  border-bottom-left-radius: 50px;
  border-bottom-right-radius: 50px;
  z-index: 0;
  height: 30vh;
  /* min-height: 30vh; */
}

.content-wrapper {
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
}

.mobile-logo {
  background: white;
  width: 90px;
  height: 90px;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.mobile-logo ion-icon {
  font-size: 50px;
  color: var(--ion-color-primary);
}

.login-header h3 {
  font-size: 2rem;
  font-weight: 800;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.login-header p {
  opacity: 0.9;
  font-size: 1rem;
}

.form-container {
  background: white;
  margin: 25vh auto;
  border-radius: 30px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.05);
  padding: 30px 20px;
  max-width: 500px;
  width: 90%;
}

.custom-input {
  --background: #f8fafc;
  --border-radius: 16px;
  --padding-start: 15px;
  transition: all 0.3s ease;
}

.custom-input:focus-within {
  border-color: var(--ion-color-primary);
  box-shadow: 0 0 0 2px rgba(56, 128, 255, 0.1);
}

.login-btn {
  --border-radius: 16px;
  --box-shadow: 0 8px 20px rgba(56, 128, 255, 0.3);
  margin-top: 35px;
  height: 60px;
  font-weight: 700;
  letter-spacing: 1px;
}

.footer-note {
  text-align: center;
  margin-top: 30px;
  color: #94a3b8;
  font-size: 0.85rem;
}

.form-inner {
  display: flex;
  flex-direction: column;
}

.side-info {
  text-align: center;
}

@media (orientation: landscape) and (min-width: 900px) {
  .top-background {
    height: 60vh;
    width: 100%;
  }

  .form-container {
    margin: 30vh auto;
    max-width: 850px;
    width: 85%;
    padding: 40px;
  }

  .form-inner {
    flex-direction: row;
    align-items: center;
    gap: 40px;
  }

  .side-info {
    flex: 1;
    border-right: 1px solid #eee;
    padding-right: 20px;
  }

  .side-form {
    flex: 1.2;
  }

  .login-header h3 {
    font-size: 2.5rem;
  }
}

@media (max-height: 500px) {
  .form-container {
    margin: 5vh auto;
  }

  .top-background {
    display: none;
  }
}
</style>