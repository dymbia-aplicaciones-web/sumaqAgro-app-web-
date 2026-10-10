<script setup>
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import useCropHealthStore from "../../application/crop-health.store.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import MessageCard from "../../../shared/presentation/components/message-card.vue";
import PlotSelector from "../components/plot-selector.vue";
import {formatDate} from "../../../shared/presentation/format.js";

const store = useCropHealthStore();
const router = useRouter();
const { t, locale } = useI18n();

const groups = computed(() => [
  { key: 'critical', alerts: store.alerts.filter(alert => alert.category === 'WEATHER' && alert.attentionStatus !== 'COMPLETED') },
  { key: 'phytosanitary', alerts: store.alerts.filter(alert => alert.category === 'PHYTOSANITARY' && alert.attentionStatus !== 'COMPLETED') },
  { key: 'completed', alerts: store.alerts.filter(alert => alert.attentionStatus === 'COMPLETED') }
].filter(group => group.alerts.length));

const openDetail = alert => router.push({ name: 'crop-health-alert-detail', params: { alertId: alert.id } });
</script>

<template>
  <div class="page alerts-page">
    <pv-progress-bar v-if="store.alertsLoading" mode="indeterminate" style="height: 4px" :aria-label="t('common.loading')"/>
    <page-header :title="t('crop-health.alert-flow.list-title')" :subtitle="t('crop-health.alert-flow.list-subtitle')">
      <plot-selector/>
    </page-header>

    <message-card v-if="store.alertsError" icon="pi pi-times-circle" :message="t(store.alertsError)" alert/>
    <template v-else-if="!store.alertsLoading && store.selectedPlot">
      <section v-for="group in groups" :key="group.key" class="alert-group">
        <h2>{{ t(`crop-health.alert-flow.groups.${group.key}`) }}</h2>
        <article v-for="alert in group.alerts" :key="alert.id" class="alert-item" :class="[`severity-${alert.severity.toLowerCase()}`, { unread: !alert.read }]">
          <div class="alert-accent" aria-hidden="true"/>
          <div class="alert-content">
            <div class="alert-heading">
              <span class="status-dot" aria-hidden="true"/>
              <strong>{{ alert.title }}</strong>
              <span class="status-chip">{{ t(`crop-health.alert-flow.attention.${alert.attentionStatus}`) }}</span>
            </div>
            <p>{{ alert.description }}</p>
            <div class="alert-meta">
              <span><i class="pi pi-map-marker"/>{{ alert.region }}</span>
              <span><i class="pi pi-clock"/>{{ formatDate(alert.updatedAt, locale) }}</span>
              <span>{{ alert.source }}</span>
            </div>
            <div class="alert-actions">
              <pv-button outlined :label="t('crop-health.alert-flow.view-plan')" @click="openDetail(alert)"/>
              <pv-button v-if="!alert.read" outlined :loading="store.saving" :label="t('crop-health.alert-flow.mark-read')" @click="store.markAlertRead(alert.id)"/>
              <span v-else class="read-label"><i class="pi pi-check"/>{{ t('crop-health.alert-flow.read') }}</span>
            </div>
          </div>
        </article>
      </section>

      <message-card v-if="groups.length === 0" icon="pi pi-check-circle" :message="t('crop-health.no-alerts')"/>
    </template>

    <p v-if="!store.alertsLoading && !store.alertsError && !store.selectedPlot">{{ t('crop-health.no-plots') }}</p>
  </div>
</template>

<style scoped>
.alerts-page { max-width: 980px; }
.alert-group { display: flex; flex-direction: column; gap: 14px; }
.alert-group h2 { margin: 8px 4px 0; color: var(--sa-primary); font-size: 15px; font-weight: 500; }
.alert-item { position: relative; display: grid; grid-template-columns: 14px 1fr; overflow: hidden; border-radius: 0 0 20px 20px; background: var(--sa-surface); box-shadow: 0 5px 3px rgb(0 0 0 / 18%); }
.alert-accent { background: var(--sa-tertiary); border-radius: 14px; }
.severity-critical .alert-accent, .severity-high .alert-accent { background: #e73535; }
.severity-critical .status-dot, .severity-high .status-dot { background: #e73535; }
.severity-medium .status-dot, .severity-low .status-dot { background: var(--sa-tertiary); }
.alert-content { padding: 18px 20px 16px 16px; }
.alert-heading { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; color: var(--sa-tertiary); }
.severity-critical .alert-heading strong, .severity-high .alert-heading strong { color: #d52020; }
.status-dot { width: 11px; height: 11px; border-radius: 50%; }
.status-chip { margin-left: auto; padding: 3px 10px; border-radius: 999px; background: var(--sa-secondary-container); color: var(--sa-on-secondary-container); font-size: 12px; }
.alert-content p { margin: 12px 0; color: var(--sa-on-surface-variant); }
.alert-meta { display: flex; flex-wrap: wrap; gap: 16px; color: var(--sa-on-surface-variant); font-size: 12px; }
.alert-meta span { display: inline-flex; align-items: center; gap: 5px; }
.alert-actions { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-top: 18px; }
.alert-actions :deep(.p-button) { min-width: 180px; }
.read-label { display: inline-flex; align-items: center; gap: 6px; color: var(--sa-primary); font-weight: 500; }
.unread { outline: 1px solid color-mix(in srgb, var(--sa-primary) 28%, transparent); }
@media (max-width: 640px) {
  .alert-actions { align-items: stretch; flex-direction: column; }
  .alert-actions :deep(.p-button) { width: 100%; }
  .status-chip { margin-left: 0; }
}
</style>
