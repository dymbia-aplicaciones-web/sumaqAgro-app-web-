<script setup>
import {ref} from "vue";
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import {formatNumber} from "../../../shared/presentation/format.js";

/** Card of a registered plot (Angular `PlotCard`, US-28). */
const props = defineProps({
  /** @type {import('../../domain/model/field-plot.entity.js').FieldPlot} */
  plot: { type: Object, required: true },
  /** @type {import('../../domain/model/crop-campaign.entity.js').CropCampaign} */
  campaign: { type: Object, default: null },
  /** Position of the plot in the list. */
  position: { type: Number, required: true }
});
const emit = defineEmits(['view-on-dashboard', 'delineate', 'remove']);

const { t, locale } = useI18n();
const router = useRouter();
const menu = ref();
const menuItems = [
  { label: 'field-management.plots.view-on-dashboard', icon: 'pi pi-home', command: () => emit('view-on-dashboard', props.plot) },
  { label: 'field-management.plots.delineate', icon: 'pi pi-pencil', command: () => emit('delineate', props.plot) },
  { label: 'common.delete', icon: 'pi pi-trash', command: () => emit('remove', props.plot) }
];

/** Opens the satellite monitoring, or the map when the plot has no polygon yet. */
const openMainAction = () => {
  if (props.plot.isMonitored()) router.push('/crop-health/monitoring');
  else emit('delineate', props.plot);
};
</script>

<template>
  <pv-card class="plot-card sa-dark-card">
    <template #title>
      <div class="flex align-items-center">
        <span class="plot-number">{{ t('field-management.plots.plot-number', { number: position }) }}</span>
        <pv-button icon="pi pi-ellipsis-v" text rounded class="plot-menu" :aria-label="t('common.actions')" aria-haspopup="true" @click="menu.toggle($event)"/>
        <pv-menu ref="menu" :model="menuItems" popup>
          <template #item="{ item, props: itemProps }">
            <a v-bind="itemProps.action"><i :class="item.icon"/><span>{{ t(item.label) }}</span></a>
          </template>
        </pv-menu>
      </div>
    </template>
    <template #content>
      <span class="sa-chip">
        <i :class="plot.isMonitored() ? 'pi pi-sun' : 'pi pi-clock'" aria-hidden="true"/>
        {{ t(`field-management.plot-status.${plot.status}`) }}
      </span>
      <h2 class="plot-name">{{ plot.name }}</h2>
      <pv-divider class="plot-divider"/>
      <dl class="plot-data">
        <dt>{{ t('field-management.plots.crop') }}:</dt>
        <dd>{{ campaign?.seedVariety ?? t('field-management.plots.no-campaign') }}</dd>
        <dt>{{ t('field-management.plots.area') }}:</dt>
        <dd>{{ formatNumber(plot.areaHectares, locale) }} {{ t('field-management.plots.hectares') }}</dd>
        <dt>{{ t('field-management.plots.location') }}:</dt>
        <dd>{{ plot.region }}</dd>
      </dl>
    </template>
    <template #footer>
      <pv-button class="card-action" icon="pi pi-arrow-right" icon-pos="right"
                 :label="t(plot.isMonitored() ? 'field-management.plots.view-monitoring' : 'field-management.plots.delineate')"
                 @click="openMainAction"/>
    </template>
  </pv-card>
</template>

<style scoped>
.plot-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 300px;
}

.plot-card :deep(.p-card-body),
.plot-card :deep(.p-card-content) {
  flex: 1;
}

.plot-number {
  color: var(--sa-on-tertiary);
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
}

.plot-menu.p-button {
  margin-left: auto;
  color: var(--sa-on-tertiary);
}

.plot-name {
  margin: 12px 0;
  font-size: 22px;
  font-weight: 600;
}

.plot-divider {
  --p-divider-border-color: color-mix(in srgb, var(--sa-on-tertiary) 40%, transparent);
}

.plot-data {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px;
  margin: 16px 0 0;
}

.plot-data dt {
  font-weight: 600;
}

.plot-data dd {
  margin: 0;
}

.card-action.p-button {
  width: 100%;
  border-color: var(--sa-surface);
  border-radius: 9999px;
  background: var(--sa-surface);
  color: var(--sa-on-surface);
}
</style>
