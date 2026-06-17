<template>
  <ion-page class="dashboard-page">
    <ion-grid class="custom-grid">
      <ion-row>
        <ion-col size="12" size-sm="6" size-lg="3" v-for="card in summaryCards" :key="card.stt">
          <div class="stat-card" :style="{ '--accent': card.color }" type="button" @click="navigateToPath(card.name)">
            <div class="stat-card__icon">
              <ion-icon :icon="getCardIcon(card.stt)" />
            </div>
            <div class="card-content">
              <p class="label">{{ getCardLabel(card.name) }}</p>
              <h3>{{ card.totalItem }}</h3>
            </div>
          </div>
        </ion-col>
      </ion-row>

      <ion-row class="ion-margin-top">
        <ion-col size="12" size-lg="12">
          <div class="chart-main-card">
            <h4>{{ t('dashboard.leave_reason_chart') }}</h4>
            <div class="chart-panel">
              <Chart v-if="leaveReasonChartData" type="bar" :data="leaveReasonChartData"
                :options="leaveReasonChartOptions" class="dashboard-chart" />
              <p v-else class="chart-empty">{{ t('dashboard.chart_empty') }}</p>
            </div>
          </div>
        </ion-col>
        <ion-col size="12" size-lg="12">
          <div class="chart-main-card">
            <h4>{{ t('dashboard.rating_chart') }}</h4>
            <div class="chart-panel">
              <Chart v-if="ratingChartData" type="bar" :data="ratingChartData" :options="ratingChartOptions"
                class="dashboard-chart" />
              <p v-else class="chart-empty">{{ t('dashboard.chart_empty') }}</p>
            </div>
          </div>
        </ion-col>
      </ion-row>
    </ion-grid>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { IonGrid, IonRow, IonCol, IonPage, IonIcon } from '@ionic/vue';
import { usePageDataRefresh } from '@/composables/usePageDataRefresh';
import {
  peopleOutline,
  documentTextOutline,
  homeOutline,
  statsChartOutline,
} from 'ionicons/icons';
import report from '@/api/report';
import router from '@/router';

const { t, te } = useI18n();

const CARD_ICONS = [
  documentTextOutline,
  homeOutline,
  peopleOutline
];

interface SummaryCard {
  stt: number;
  name: string;
  color: string;
  totalItem: number;
}

interface LeaveReasonRow {
  organizationId: number;
  organizationName: string;
  reasonOne: number;
  reasonTwo: number;
  reasonThree: number;
  reasonFour: number;
  reasonFive: number;
}

interface RatingRow {
  ratingTitle: string;
  ratingOne: number;
  ratingTwo: number;
  ratingThree: number;
  ratingFour: number;
  ratingFive: number;
}

type BarChartData = {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string;
    borderRadius: number;
    maxBarThickness: number;
  }>;
};

const summaryCards = ref<SummaryCard[]>([]);
const leaveReasonRows = ref<LeaveReasonRow[]>([]);
const ratingRows = ref<RatingRow[]>([]);

const reasonLabelKeys = ['one', 'two', 'three', 'four', 'five'] as const;
const ratingScoreKeys = ['one', 'two', 'three', 'four', 'five'] as const;

const getCardLabel = (name: string) => {
  const key = `dashboard.cards.${name}`;
  return te(key) ? t(key) : name;
};

function getReasonLabels() {
  return reasonLabelKeys.map((key) => t(`dashboard.reasons.${key}`));
}

function getRatingScoreLabels() {
  return ratingScoreKeys.map((key) => t(`dashboard.rating_scores.${key}`));
}

function getCardIcon(stt: number) {
  return CARD_ICONS[(stt - 1) % CARD_ICONS.length] ?? statsChartOutline;
}

const leaveReasonChartData = computed(() =>
  leaveReasonRows.value.length ? buildLeaveReasonChart(leaveReasonRows.value) : null,
);
const ratingChartData = computed(() =>
  ratingRows.value.length ? buildRatingChart(ratingRows.value) : null,
);

const REASON_COLORS = ['#3182ce', '#ed8936', '#38a169', '#805ad5', '#e53e3e'];
const RATING_COLORS = ['#0ea5e9', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#64748b'];

function getChartDataMax(data: BarChartData): number {
  return data.datasets.reduce((top, dataset) => {
    const datasetMax = dataset.data.length ? Math.max(...dataset.data) : 0;
    return Math.max(top, datasetMax);
  }, 0);
}

function buildGroupedBarOptions(data: BarChartData) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 15,
          padding: 20,
          font: { size: 16 },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 0,
          font: { size: 16 },
        },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        suggestedMax: getChartDataMax(data) + 1,
        ticks: {
          stepSize: 1,
          precision: 0,
          font: { size: 16 },
        },
      },
    },
  };
}

const navigateToPath = (path: string) => {
  switch (path) {
    case 'Interviews':
      router.push('/list-exit-interview');
      break;
    case 'Organizations':
      router.push('/list-organization');
      break;
    case 'Users':
      router.push('/list-user');
      break;
  };
}

const leaveReasonChartOptions = computed(() =>
  leaveReasonChartData.value ? buildGroupedBarOptions(leaveReasonChartData.value) : undefined,
);

const ratingChartOptions = computed(() =>
  ratingChartData.value ? buildGroupedBarOptions(ratingChartData.value) : undefined,
);

function parseArrayResponse<T>(response: unknown): T[] {
  const payload = (response as { data?: { data?: T[] } })?.data;
  const items = payload?.data;
  return Array.isArray(items) ? items : [];
}

function buildLeaveReasonChart(rows: LeaveReasonRow[]): BarChartData {
  const reasonKeys = ['reasonOne', 'reasonTwo', 'reasonThree', 'reasonFour', 'reasonFive'] as const;
  const reasonLabels = getReasonLabels();

  return {
    labels: rows.map((row) => row.organizationName),
    datasets: reasonKeys.map((key, index) => ({
      label: reasonLabels[index] ?? '',
      data: rows.map((row) => row[key]),
      backgroundColor: REASON_COLORS[index],
      borderRadius: 0,
      maxBarThickness: 40,
    })),
  };
}

function buildRatingChart(rows: RatingRow[]): BarChartData {
  const ratingKeys = ['ratingOne', 'ratingTwo', 'ratingThree', 'ratingFour', 'ratingFive'] as const;

  return {
    labels: getRatingScoreLabels(),
    datasets: rows.map((row, index) => ({
      label: row.ratingTitle,
      data: ratingKeys.map((key) => row[key]),
      backgroundColor: RATING_COLORS[index % RATING_COLORS.length],
      borderRadius: 0,
      maxBarThickness: 40,
    })),
  };
}

async function loadSummaryCards() {
  try {
    const response = await report.getTotalAppData();
    const items = parseArrayResponse<SummaryCard>(response);
    if (items.length) {
      summaryCards.value = [...items].sort((a, b) => a.stt - b.stt);
    }
  } catch (error) {
    console.error('Không tải được dữ liệu tổng quan:', error);
  }
}

async function loadLeaveReasonChart() {
  try {
    const response = await report.getLrChartData();
    leaveReasonRows.value = parseArrayResponse<LeaveReasonRow>(response);
  } catch (error) {
    console.error('Không tải được biểu đồ lý do nghỉ việc:', error);
    leaveReasonRows.value = [];
  }
}

async function loadRatingChart() {
  try {
    const response = await report.getRatingChartData();
    ratingRows.value = parseArrayResponse<RatingRow>(response);
  } catch (error) {
    console.error('Không tải được biểu đồ đánh giá:', error);
    ratingRows.value = [];
  }
}

async function loadDashboardData() {
  await Promise.all([
    loadSummaryCards(),
    loadLeaveReasonChart(),
    loadRatingChart(),
  ]);
}

usePageDataRefresh('Dashboard', () => {
  void loadDashboardData();
});
</script>

<style scoped lang="scss">
.dashboard-page:not(.ion-page-hidden) {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  width: 100%;
}

.dashboard-page.ion-page-hidden {
  display: none !important;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
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
    cursor: pointer;
  }

  &__icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 12%, white);

    ion-icon {
      font-size: 1.5rem;
    }
  }

  .card-content {
    min-width: 0;
  }

  .label {
    font-size: 20px;
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
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    color: #2d3748;
  }
}

.chart-panel {
  height: min(520px, 55vh);
  min-height: 500px;
}

.dashboard-chart {
  width: 100%;
  height: 100%;
}

.chart-empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  color: #94a3b8;
  font-style: italic;
}

.custom-grid {
  margin: 0;
  --ion-grid-column-padding: 12px;
}
</style>
