<script setup>
import {computed, nextTick, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {useRoute, useRouter} from "vue-router";
import useFieldManagementStore from "../../application/field-management.store.js";
import {FieldPlot} from "../../domain/model/field-plot.entity.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import MessageCard from "../../../shared/presentation/components/message-card.vue";
import RegistrationSteps from "../components/registration-steps.vue";
import PlotBoundaryMap from "../components/plot-boundary-map.vue";
import BoundarySummaryPanel from "../components/boundary-summary-panel.vue";
import PlotSavedDialog from "../components/plot-saved-dialog.vue";

/** Step 2 of the registration: delineate the plot on the map (Angular `PlotBoundaryMapView`). */
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const store = useFieldManagementStore();
const boundaryMap = ref();

const plotId = computed(() => Number(route.params.id));
const plot = computed(() => store.getPlotById(plotId.value));
const campaign = computed(() => store.getCurrentCampaignOf(plotId.value));
const markedCoordinates = ref([]);
const areaHectares = computed(() => FieldPlot.calculateAreaHectares(markedCoordinates.value));
const polygonStatus = computed(() => {
  if (markedCoordinates.value.length < FieldPlot.MINIMUM_VERTICES) return 'OPEN';
  return FieldPlot.isSimplePolygon(markedCoordinates.value) ? 'CLOSED' : 'CROSSED';
});
const savedPlot = ref(null);
const dialogVisible = ref(false);
let loadedPlotId = null;

const plotTitle = computed(() => {
  const variety = campaign.value?.seedVariety;
  return `${plot.value?.name ?? ''}${variety ? ` (${variety})` : ''}`;
});

const breadcrumbs = [
  { label: 'option.my-plot', link: '/field-management/dashboard' },
  { label: 'field-management.plots.manage', link: '/field-management/plots' },
  { label: 'field-management.steps.crop-data' },
  { label: 'field-management.steps.map-title' }
];

// Show the saved polygon once the plot arrives from the store.
watch(plot, async value => {
  if (!value || loadedPlotId === value.id) return;
  loadedPlotId = value.id;
  markedCoordinates.value = [...value.boundary];
  await nextTick();
  boundaryMap.value?.fitTo(value.boundary);
}, { immediate: true });

/** @param {import('../../domain/model/geo-coordinate.js').GeoCoordinate} coordinate - New vertex. */
const onAddVertex = (coordinate) => markedCoordinates.value = [...markedCoordinates.value, coordinate];
const onUndo = () => markedCoordinates.value = markedCoordinates.value.slice(0, -1);
const onClear = () => markedCoordinates.value = [];

/** Saves the polygon and shows the confirmation. */
const onSavePlot = () => {
  if (polygonStatus.value !== 'CLOSED') return;
  store.delineateBoundary(plotId.value, markedCoordinates.value).then(saved => {
    if (!saved) return;
    savedPlot.value = saved;
    dialogVisible.value = true;
  });
};

/** @param {'crop-health'|'plots'} result - Option chosen in the dialog. */
const onDialogClose = (result) => router.push(result === 'crop-health' ? '/crop-health/monitoring' : '/field-management/plots');
</script>

<template>
  <div class="page">
    <pv-progress-bar v-if="store.loading" mode="indeterminate" style="height: 4px" :aria-label="t('common.loading')"/>
    <page-header :breadcrumbs="breadcrumbs" :title="`${t('field-management.boundary.title')}: ${plotTitle}`"
                 :subtitle="t('field-management.boundary.subtitle')" compact/>
    <registration-steps :current="2"/>

    <message-card v-if="store.error" icon="pi pi-times-circle" :message="t(store.error)" alert/>

    <div class="map-layout">
      <!-- Satellite map (US-30) -->
      <plot-boundary-map ref="boundaryMap" :coordinates="markedCoordinates" :status="polygonStatus" @vertex-added="onAddVertex"/>
      <!-- Delineation summary (US-29) -->
      <boundary-summary-panel
          :plot="plot" :campaign="campaign" :coordinates="markedCoordinates" :area-hectares="areaHectares"
          :status="polygonStatus" :saving="store.loading" @undo="onUndo" @clear="onClear" @save="onSavePlot"/>
    </div>

    <plot-saved-dialog
        v-if="savedPlot" v-model:visible="dialogVisible" :plot="savedPlot" :seed-variety="campaign?.seedVariety"
        :plot-count="store.plotCount" :plot-quota="store.plotQuota" @close="onDialogClose"/>
  </div>
</template>

<style scoped>
.map-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  align-items: start;
  gap: 24px;
}

@media (max-width: 959.98px) {
  .map-layout {
    grid-template-columns: 1fr;
  }
}
</style>
