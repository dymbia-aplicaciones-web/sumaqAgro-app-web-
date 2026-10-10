<script setup>
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import {useConfirm} from "primevue";
import useFieldManagementStore from "../../application/field-management.store.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import MessageCard from "../../../shared/presentation/components/message-card.vue";
import PlotCard from "../components/plot-card.vue";
import PlotSlotCard from "../components/plot-slot-card.vue";

/** "My registered plots" (Angular `RegisteredPlotsView`, US-22 / US-28). */
const { t } = useI18n();
const router = useRouter();
const confirm = useConfirm();
const store = useFieldManagementStore();

const breadcrumbs = [
  { label: 'option.my-plot', link: '/field-management/dashboard' },
  { label: 'field-management.plots.manage' }
];

/**
 * Shows a plot on the dashboard.
 * @param {Object} plot - Plot to show.
 */
const onSelectPlot = (plot) => {
  store.selectPlot(plot.id);
  router.push({name: 'field-management-dashboard'});
};

/**
 * Opens the map to delineate a plot.
 * @param {Object} plot - Plot to delineate.
 */
const onDelineate = (plot) => {
  router.push({name: 'field-management-plot-boundary', params: {id: plot.id}});
};

/**
 * Confirm deletion of a plot and execute deletion if confirmed.
 * @param {Object} plot - Plot to delete.
 */
const onDeletePlot = (plot) => {
  confirm.require({
    message: t('field-management.plots.delete-confirm', {name: plot.name}),
    header: t('common.delete'),
    icon: 'pi pi-exclamation-triangle',
    acceptProps: { label: t('common.delete'), severity: 'danger' },
    rejectProps: { label: t('common.cancel'), severity: 'secondary', outlined: true },
    accept: () => store.deletePlot(plot.id)
  });
};
</script>

<template>
  <div class="page">
    <pv-progress-bar v-if="store.loading" mode="indeterminate" style="height: 4px" :aria-label="t('common.loading')"/>

    <page-header
        :breadcrumbs="breadcrumbs"
        :title="t('field-management.plots.title')"
        :subtitle="t('field-management.plots.subtitle', { used: store.plotCount, quota: store.plotQuota })"/>

    <message-card v-if="store.error" icon="pi pi-times-circle" :message="t(store.error)" alert/>

    <section class="plot-grid" :aria-label="t('field-management.plots.title')">
      <!-- Registered plots (US-28) -->
      <plot-card
          v-for="(plot, index) in store.plots"
          :key="plot.id"
          :plot="plot"
          :campaign="store.getCurrentCampaignOf(plot.id)"
          :position="index + 1"
          @view-on-dashboard="onSelectPlot"
          @delineate="onDelineate"
          @remove="onDeletePlot"/>
      <!-- Free slots of the plan (US-22) -->
      <plot-slot-card
          v-for="number in store.freeSlots"
          :key="number"
          :position="number"
          @register="router.push({name: 'field-management-plot-new'})"/>
    </section>

    <pv-divider/>

    <pv-card class="plan-card sa-card">
      <template #title>
        <span class="flex align-items-center gap-3 text-base">
          <i class="pi pi-verified text-3xl plan-card__icon" aria-hidden="true"/>
          {{ t('field-management.plots.plan-title') }}
        </span>
      </template>
      <template #content>
        {{ t(store.canRegisterPlot ? 'field-management.plots.plan-text' : 'field-management.plots.plan-full', { quota: store.plotQuota }) }}
      </template>
    </pv-card>
  </div>
</template>

<style scoped>
.plot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

.plan-card {
  max-width: 560px;
  background: var(--sa-secondary-container);
  color: var(--sa-on-secondary-container);
}

.plan-card__icon {
  color: var(--sa-primary);
}
</style>
