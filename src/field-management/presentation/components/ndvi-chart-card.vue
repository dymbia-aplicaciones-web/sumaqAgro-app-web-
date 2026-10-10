<script setup>
import "../../../shared/presentation/charts.js";
import {computed} from "vue";
import {Line} from "vue-chartjs";
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import {intlLocale} from "../../../shared/presentation/format.js";

/** NDVI evolution since the sowing date (Angular `NdviChartCard`). */
const props = defineProps({
  observations: { type: Array, default: () => [] },
  sowingDate: { type: Date, default: null },
  loading: { type: Boolean, default: false },
  error: { type: Boolean, default: false }
});

const { t, locale } = useI18n();
const router = useRouter();

const chartData = computed(() => {
  const format = new Intl.DateTimeFormat(intlLocale(locale.value), { day: '2-digit', month: 'short', timeZone: 'America/Lima' });
  const items = props.observations.filter(item => !props.sowingDate || Date.parse(item.date) >= props.sowingDate.getTime());
  return {
    labels: items.map(item => format.format(new Date(item.date))),
    datasets: [{
      label: 'NDVI',
      data: items.map(item => item.ndviMean),
      borderColor: '#008000',
      backgroundColor: 'rgba(0, 128, 0, 0.12)',
      fill: true,
      tension: 0.25,
      pointRadius: 4
    }]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: { y: { min: -1, max: 1 } },
  plugins: { legend: { display: false } }
};
</script>

<template>
  <pv-card class="sa-card h-full">
    <template #title>
      <span class="flex align-items-center gap-3 text-lg"><i class="pi pi-chart-line text-2xl" aria-hidden="true"/>{{ t('field-management.dashboard.ndvi-evolution') }}</span>
    </template>
    <template #subtitle>{{ t('field-management.dashboard.ndvi-subtitle') }}</template>
    <template #content>
      <pv-divider/>
      <div v-if="chartData.datasets[0].data.length > 0" class="ndvi-chart" role="img" :aria-label="t('field-management.dashboard.ndvi-evolution')">
        <Line :data="chartData" :options="chartOptions"/>
      </div>
      <div v-else class="chart-placeholder">
        <i class="pi pi-globe text-5xl" aria-hidden="true"/>
        <p v-if="loading">{{ t('common.loading') }}</p>
        <p v-else-if="error" role="alert">{{ t('crop-health.errors.load-observations') }}</p>
        <p v-else>{{ t('field-management.dashboard.ndvi-pending') }}</p>
        <pv-button outlined icon="pi pi-sun" :label="t('option.crop-health')" @click="router.push('/crop-health/monitoring')"/>
      </div>
    </template>
  </pv-card>
</template>

<style scoped>
.ndvi-chart {
  position: relative;
  height: 240px;
  padding-top: 16px;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 240px;
  color: var(--sa-on-surface-variant);
  text-align: center;
}
</style>
