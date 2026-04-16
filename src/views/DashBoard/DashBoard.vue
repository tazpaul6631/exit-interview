<template>
  <ion-page>
    <ion-grid class="ion-no-margin custom-grid">
      <ion-row>
        <ion-col size="12" size-sm="6" size-lg="3" v-for="card in summaryCards" :key="card.title">
          <div class="stat-card" :style="{ '--accent': card.color }">
            <div class="card-content">
              <p class="label">{{ card.title }}</p>
              <h3>{{ card.value }}</h3>
            </div>
            <div class="mini-chart"></div>
          </div>
        </ion-col>
      </ion-row>

      <ion-row class="ion-margin-top">
        <ion-col size="12" size-lg="8">
          <div class="chart-main-card">
            <h4>Acquisition Overview</h4>
            <div class="placeholder-big-chart">Biểu đồ chính ở đây</div>
          </div>
        </ion-col>
        <ion-col size="12" size-lg="4">
          <div class="chart-main-card">
            <h4>Latest Customers</h4>
            <ion-list lines="none">
              <ion-item v-for="i in 4" :key="i">
                <ion-avatar slot="start">
                  <img :src="`https://i.pravatar.cc/100?img=${i}`" alt="avatar" />
                </ion-avatar>
                <ion-label>
                  <h2>Customer {{ i }}</h2>
                  <p>Manager at Tech Co.</p>
                </ion-label>
              </ion-item>
            </ion-list>
          </div>
        </ion-col>
      </ion-row>

      <ion-row>
        <ion-col size="12" size-sm="6" size-lg="3" v-for="card in summaryCards" :key="card.title">
          <div class="stat-card" :style="{ '--accent': card.color }">
            <div class="card-content">
              <p class="label">{{ card.title }}</p>
              <h3>{{ card.value }}</h3>
            </div>
            <div class="mini-chart"></div>
          </div>
        </ion-col>
      </ion-row>

      <ion-row>
        <ion-col size="12" size-sm="6" size-lg="3" v-for="card in summaryCards" :key="card.title">
          <div class="stat-card" :style="{ '--accent': card.color }">
            <div class="card-content">
              <p class="label">{{ card.title }}</p>
              <h3>{{ card.value }}</h3>
            </div>
            <div class="mini-chart"></div>
          </div>
        </ion-col>
      </ion-row>

      <ion-row class="ion-margin-top">
        <ion-col size="12" size-lg="8">
          <div class="chart-main-card">
            <h4>Acquisition Overview</h4>
            <div class="placeholder-big-chart">Biểu đồ chính ở đây</div>
          </div>
        </ion-col>
        <ion-col size="12" size-lg="4">
          <div class="chart-main-card">
            <h4>Latest Customers</h4>
            <ion-list lines="none">
              <ion-item v-for="i in 4" :key="i + 4">
                <ion-avatar slot="start">
                  <img :src="`https://i.pravatar.cc/100?img=${i + 4}`" alt="avatar" />
                </ion-avatar>
                <ion-label>
                  <h2>Customer {{ i + 4 }}</h2>
                  <p>Manager at Tech Co.</p>
                </ion-label>
              </ion-item>
            </ion-list>
          </div>
        </ion-col>
      </ion-row>
    </ion-grid>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonGrid, IonRow, IonCol, IonList, IonItem, IonAvatar, IonLabel, IonPage
} from '@ionic/vue';

const summaryCards = [
  { title: 'USERS SIGNED UP', value: '3,882', color: '#3182ce' },
  { title: 'LIFETIME VALUE', value: '532', color: '#ed8936' },
  { title: 'CONVERSION RATE', value: '12.6%', color: '#38a169' },
  { title: 'ACTIVE TRIALS', value: '440', color: '#805ad5' },
];
</script>


<style scoped lang="scss">
.stat-card {
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  position: relative;
  overflow: hidden;
  border-bottom: 4px solid var(--accent);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
  }

  .label {
    font-size: 11px;
    font-weight: 700;
    color: #a0aec0;
    margin: 0;
  }

  h3 {
    font-size: 24px;
    font-weight: 800;
    margin: 5px 0;
    color: #2d3748;
  }
}

.chart-main-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  height: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);

  h4 {
    margin: 0 0 20px 0;
    font-size: 16px;
    font-weight: 600;
    color: #2d3748;
  }

  /* Sửa lại padding của ion-item để nhìn gọn hơn */
  ion-item {
    --padding-start: 0;
    --inner-padding-end: 0;
    margin-bottom: 10px;

    h2 {
      font-weight: 600;
      font-size: 14px;
      color: #1e293b;
    }

    p {
      font-size: 12px;
      color: #64748b;
    }
  }
}

.placeholder-big-chart {
  height: 300px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: 2px dashed #cbd5e1;
  color: #94a3b8;
  font-weight: 500;
}

.custom-grid {
  padding: 30px;
  --ion-grid-column-padding: 12px;
}
</style>