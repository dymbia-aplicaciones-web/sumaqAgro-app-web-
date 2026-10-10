<script setup>
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import useIamStore from "../../../iam/application/iam.store.js";
import useFieldManagementStore from "../../application/field-management.store.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import MessageCard from "../../../shared/presentation/components/message-card.vue";
import CampaignKpiCards from "../components/campaign-kpi-cards.vue";
import NdviChartCard from "../components/ndvi-chart-card.vue";
import CostDistributionCard from "../components/cost-distribution-card.vue";
import {formatNumber} from "../../../shared/presentation/format.js";

/** "My plot" dashboard of the farmer (Angular `MyPlotDashboardView`). */
const { t } = useI18n();
const router = useRouter();
const iamStore = useIamStore();
const store = useFieldManagementStore();

const breadcrumbs = [{ label: 'option.my-plot' }];

const greetingKey = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'field-management.dashboard.good-morning';
  if (hour < 19) return 'field-management.dashboard.good-afternoon';
  return 'field-management.dashboard.good-evening';
});

const plotSummary = computed(() => {
  const plot = store.selectedPlot;
  if (!plot) return '';
  const variety = store.activeCampaign?.seedVariety;
  return `${plot.name}${variety ? ` – ${variety}` : ''} (${formatNumber(plot.areaHectares, 'en')} Ha)`;
});

const subtitle = computed(() => store.activeCampaign
    ? `${plotSummary.value} | ${t('field-management.dashboard.campaign')} ${store.activeCampaign.season}`
    : plotSummary.value);
</script>

<template>
  <div class="page">
    <pv-progress-bar v-if="store.loading" mode="indeterminate" style="height: 4px" :aria-label="t('common.loading')"/>

    <page-header :breadcrumbs="breadcrumbs" :title="t(greetingKey, { name: iamStore.currentUser?.displayName ?? '' })" :subtitle="subtitle">
      <pv-button class="sa-pill view-plots" icon="pi pi-th-large" :label="t('field-management.dashboard.view-all-plots')" @click="router.push('/field-management/plots')"/>
    </page-header>

    <message-card v-if="store.error" icon="pi pi-cloud" :message="t('field-management.dashboard.load-error')" alert>
      <template #actions>
        <pv-button text icon="pi pi-refresh" :label="t('common.retry')" @click="store.retry()"/>
      </template>
    </message-card>

    <message-card v-else-if="!store.loading && store.plots.length === 0" icon="pi pi-sun" :message="t('field-management.dashboard.no-plots')">
      <template #actions>
        <pv-button icon="pi pi-plus" :label="t('field-management.dashboard.register-plot')" @click="router.push('/field-management/plots/new')"/>
      </template>
    </message-card>

    <template v-else>
      <campaign-kpi-cards
          :campaign="store.activeCampaign"
          :ledger="store.ledger"
          :observation="store.latestObservation"
          :satellite-loading="store.observationsLoading"
          :satellite-error="store.observationsError"/>
      <section class="charts-grid">
        <ndvi-chart-card
            :observations="store.observations"
            :sowing-date="store.activeCampaign?.sowingDate"
            :loading="store.observationsLoading"
            :error="store.observationsError"/>
        <cost-distribution-card :ledger="store.ledger"/>
      </section>
    </template>
  </div>
</template>

<style scoped>
.view-plots.p-button {
  height: 48px;
}

.charts-grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 24px;
}

.charts-grid > * {
  min-width: 0;
}

@media (max-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
