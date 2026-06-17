<template>
  <ion-page class="not-found-ion-page">
    <div class="not-found-page">
      <div class="not-found-shell">
        <div class="not-found-visual">
          <div class="lottie-frame">
            <DotLottieVue class="lottie-player" src="/assets/animations/not-found.lottie" autoplay loop :speed="0.9"
              :layout="{ fit: 'contain', align: [0.5, 0.5] }" />
          </div>
        </div>

        <div class="not-found-body">
          <h2>Không tìm thấy trang</h2>
          <p>
            Trang bạn đang truy cập không tồn tại hoặc đã bị di chuyển.
            Vui lòng quay lại trang chủ để tiếp tục.
          </p>

          <div class="action-row">
            <Button label="Quay lại Dashboard" icon="pi pi-home" class="back-btn" @click="handleGoBack" />
          </div>
        </div>
      </div>
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, nextTick } from 'vue';
import { IonPage, onIonViewDidEnter } from '@ionic/vue';
import { DotLottieVue } from '@lottiefiles/dotlottie-vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const revealNotFoundPage = async () => {
  await nextTick();
  const page = document.querySelector<HTMLElement>('.not-found-ion-page');
  if (!page) return;

  page.classList.remove('ion-page-hidden');
  const outlet = page.closest('ion-router-outlet');
  outlet?.querySelectorAll('.ion-page').forEach((node) => {
    if (node !== page) node.classList.add('ion-page-hidden');
  });
};

onIonViewDidEnter(() => {
  void revealNotFoundPage();
});

onMounted(() => {
  void revealNotFoundPage();
});

const handleGoBack = () => {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  router.push('/dashboard');
};
</script>

<style scoped lang="scss">
.not-found-ion-page {
  display: flex;
  flex: 1;
  min-height: 100%;
}

.not-found-page {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 24px 16px;
  background:
    radial-gradient(circle at top right, rgba(99, 102, 241, 0.08), transparent 45%),
    radial-gradient(circle at bottom left, rgba(56, 189, 248, 0.08), transparent 40%),
    #f8fafc;
  border-radius: 40px;
}

.not-found-shell {
  width: 100%;
  max-width: 920px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: center;
  padding: 28px;
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06);
}

.not-found-visual {
  display: flex;
  align-items: center;
  justify-content: center;
}

.lottie-frame {
  width: 100%;
  max-width: 380px;
  aspect-ratio: 1 / 1;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(160deg, #f8fafc 0%, #eef2ff 100%);
  border: 1px solid #e2e8f0;
}

.lottie-player {
  display: block;
  width: 100%;
  height: 100%;
}

.lottie-player :deep(canvas) {
  width: 100% !important;
  height: 100% !important;
}

.not-found-body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  padding: 8px 4px;
}

.not-found-body h2 {
  margin: 0 0 12px;
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  font-weight: 700;
  color: #0f172a;
  line-height: 1.25;
}

.not-found-body p {
  margin: 0;
  max-width: 36ch;
  color: #64748b;
  font-size: 1.5rem;
  line-height: 1.6;
}

.action-row {
  margin-top: 28px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.back-btn {
  min-width: 220px;
  height: 48px;
  font-weight: 600;
  border-radius: 12px;
}

@media (max-width: 768px) {
  .not-found-shell {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 20px;
    text-align: center;
  }

  .not-found-body {
    align-items: center;
    text-align: center;
  }

  .not-found-body p {
    max-width: none;
  }

  .action-row {
    width: 100%;
    justify-content: center;
  }

  .lottie-frame {
    max-width: 280px;
    margin: 0 auto;
  }
}
</style>