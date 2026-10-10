<script setup>
import {useI18n} from "vue-i18n";
import {formatNumber} from "../../../shared/presentation/format.js";

/** Confirmation after saving the polygon (Angular `PlotSavedDialog`). */
defineProps({
  plot: { type: Object, required: true },
  seedVariety: { type: String, default: '' },
  plotCount: { type: Number, required: true },
  plotQuota: { type: Number, required: true }
});
const visible = defineModel('visible', { type: Boolean, required: true });
const emit = defineEmits(['close']);
const { t, locale } = useI18n();

/**
 * Closes the dialog and tells where to go next.
 * @param {'crop-health'|'plots'} result - Chosen option.
 */
const close = (result) => {
  visible.value = false;
  emit('close', result);
};
</script>

<template>
  <pv-dialog v-model:visible="visible" modal :closable="false" :show-header="false" class="saved-dialog"
             :style="{ width: 'calc(100vw - 32px)', maxWidth: '560px' }">
    <div class="flex flex-column align-items-center text-center pt-4">
      <i class="pi pi-check-circle saved-icon" aria-hidden="true"/>
      <h2>{{ t('field-management.saved.title') }}</h2>
      <p class="sa-muted mt-1 mb-3">{{ t('field-management.saved.subtitle') }}</p>

      <section class="saved-summary">
        <h3>{{ t('field-management.saved.summary') }}</h3>
        <dl>
          <dt>{{ t('field-management.saved.name') }}</dt>
          <dd>{{ plot.name }}</dd>
          <dt>{{ t('field-management.saved.crop') }}</dt>
          <dd>{{ seedVariety }}</dd>
          <dt>{{ t('field-management.saved.area') }}</dt>
          <dd>{{ formatNumber(plot.areaHectares, locale) }} {{ t('field-management.plots.hectares') }}</dd>
          <dt>{{ t('field-management.saved.quota') }}</dt>
          <dd>{{ t('field-management.saved.quota-value', { used: plotCount, quota: plotQuota }) }}</dd>
          <dt>{{ t('field-management.saved.sync') }}</dt>
          <dd><span class="sync-pill">{{ t('field-management.saved.sync-value') }}</span></dd>
        </dl>
      </section>

      <pv-divider/>
      <p class="mt-3">{{ t('field-management.saved.next') }}</p>
    </div>
    <div class="saved-actions">
      <pv-button outlined class="sa-pill" :label="t('field-management.saved.view-crop-health')" @click="close('crop-health')"/>
      <pv-button class="sa-pill" :label="t('field-management.saved.manage-plots')" @click="close('plots')"/>
    </div>
  </pv-dialog>
</template>

<style scoped>
.saved-icon {
  color: var(--sa-primary);
  font-size: 4.5rem;
}

h2 {
  margin: 8px 0 0;
  font-size: 24px;
}

.saved-summary {
  width: 100%;
  margin-bottom: 16px;
  padding: 16px 20px;
  border-radius: 16px;
  background: var(--sa-secondary-container);
  color: var(--sa-on-secondary-container);
  text-align: left;
}

.saved-summary h3 {
  margin: 0 0 12px;
  font-size: 14px;
  text-transform: uppercase;
}

.saved-summary dl {
  display: grid;
  grid-template-columns: 1fr auto;
  margin: 0;
}

.saved-summary dt,
.saved-summary dd {
  margin: 0;
  padding: 8px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--sa-primary) 25%, transparent);
}

.saved-summary dd {
  font-weight: 600;
  text-align: right;
}

.sync-pill {
  padding: 4px 10px;
  border-radius: 9999px;
  background: var(--sa-surface);
}

.saved-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding-bottom: 8px;
}

@media (max-width: 479.98px) {
  .saved-actions {
    grid-template-columns: 1fr;
  }
}
</style>

<style>
/* Rounded corners of the "plot saved" dialog, as in the Figma design. */
.saved-dialog.p-dialog {
  border-radius: 40px;
}
</style>
