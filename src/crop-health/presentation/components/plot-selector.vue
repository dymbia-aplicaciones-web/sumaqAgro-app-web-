<script setup>
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import useCropHealthStore from "../../application/crop-health.store.js";

/** "Change plot" select shared by the monitoring and alerts pages (Angular `CropPlotSelector`). */
const store = useCropHealthStore();
const { t } = useI18n();

const selected = computed({
  get: () => store.selectedPlot?.id ?? null,
  set: plotId => { if (plotId !== null) store.selectPlot(plotId); }
});
</script>

<template>
  <div class="flex flex-column gap-1">
    <label for="crop-plot-selector" class="text-sm sa-muted">{{ t('crop-health.change-plot') }}</label>
    <pv-select v-model="selected" input-id="crop-plot-selector" :options="store.plots" option-label="name" option-value="id"
               :disabled="store.scopeLoading" style="min-width: 240px"/>
  </div>
</template>
