<script setup>
import {useI18n} from "vue-i18n";
import {formatNumber} from "../../../shared/presentation/format.js";

/** Delineation summary: vertices, area and polygon status (Angular `BoundarySummaryPanel`, US-29). */
defineProps({
  plot: { type: Object, default: null },
  campaign: { type: Object, default: null },
  coordinates: { type: Array, required: true },
  areaHectares: { type: Number, required: true },
  /** `OPEN`, `CLOSED` or `CROSSED`. */
  status: { type: String, required: true },
  saving: { type: Boolean, default: false }
});
const emit = defineEmits(['undo', 'clear', 'save']);
const { t, locale } = useI18n();

const statusIcons = { OPEN: 'pi pi-circle', CLOSED: 'pi pi-check-circle', CROSSED: 'pi pi-exclamation-triangle' };
</script>

<template>
  <pv-card class="sa-card">
    <template #title><span class="text-base font-bold">{{ t('field-management.boundary.summary') }}</span></template>
    <template #content>
      <dl class="summary-data">
        <dt>{{ t('field-management.boundary.plot') }}:</dt>
        <dd>{{ plot?.name }}</dd>
        <dt>{{ t('field-management.plots.crop') }}:</dt>
        <dd>{{ campaign?.seedVariety }}</dd>
      </dl>

      <pv-divider/>
      <h3>{{ t('field-management.boundary.coordinates') }}</h3>
      <p v-if="coordinates.length === 0" class="sa-muted text-sm m-0">{{ t('field-management.boundary.no-vertices') }}</p>
      <ol v-else class="coordinates">
        <li v-for="(vertex, index) in coordinates" :key="index">
          <strong>V{{ index + 1 }}:</strong>
          {{ formatNumber(vertex.latitude, locale, 4, 4) }}, {{ formatNumber(vertex.longitude, locale, 4, 4) }}
        </li>
      </ol>

      <pv-divider/>
      <h3>{{ t('field-management.boundary.area') }}</h3>
      <p class="area" :class="{ 'area-invalid': status === 'CROSSED' }">
        {{ formatNumber(areaHectares, locale) }} {{ t('field-management.plots.hectares') }}
      </p>
      <p v-if="plot && !plot.hasPolygon() && plot.areaHectares > 0" class="sa-muted text-sm m-0">
        {{ t('field-management.boundary.declared', { area: formatNumber(plot.areaHectares, locale) }) }}
      </p>

      <h3>{{ t('field-management.boundary.status') }}</h3>
      <span class="polygon-chip" :class="`polygon-${status}`">
        <i :class="statusIcons[status]" aria-hidden="true"/>
        {{ t(`field-management.boundary.polygon-${status}`) }}
      </span>

      <div class="flex flex-column gap-3 mt-4">
        <pv-button outlined class="sa-pill" icon="pi pi-undo" :label="t('field-management.boundary.undo')" :disabled="coordinates.length === 0" @click="emit('undo')"/>
        <pv-button outlined class="sa-pill" icon="pi pi-eraser" :label="t('field-management.boundary.clear')" :disabled="coordinates.length === 0" @click="emit('clear')"/>
        <pv-button class="sa-pill save" icon="pi pi-globe" :label="t('field-management.boundary.save')" :disabled="status !== 'CLOSED' || saving" @click="emit('save')"/>
      </div>
    </template>
  </pv-card>
</template>

<style scoped>
h3 {
  margin: 16px 0 8px;
  font-size: 14px;
}

.summary-data {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 8px;
  margin: 8px 0 16px;
}

.summary-data dt {
  color: var(--sa-primary);
  font-weight: 600;
}

.summary-data dd {
  margin: 0;
}

.coordinates {
  max-height: 160px;
  margin: 0 0 16px;
  padding: 0;
  overflow-y: auto;
  list-style: none;
}

.area {
  margin: 0 0 4px;
  padding: 8px 16px;
  border: 1px solid var(--sa-primary);
  border-radius: 12px;
  background: var(--sa-secondary-container);
  color: var(--sa-on-secondary-container);
  font-size: 22px;
  font-weight: 700;
  text-align: center;
}

.area-invalid {
  border-color: var(--sa-error);
  background: var(--sa-error-container);
  color: var(--sa-on-error-container);
}

.polygon-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 8px;
  background: var(--sa-surface-container-high);
  font-size: 13px;
  font-weight: 500;
}

.polygon-CLOSED {
  background: var(--sa-secondary-container);
  color: var(--sa-on-secondary-container);
}

.polygon-CROSSED {
  background: var(--sa-error-container);
  color: var(--sa-on-error-container);
}

.save.p-button {
  height: 48px;
}
</style>
