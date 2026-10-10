<script setup>
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import {useRoute, useRouter} from "vue-router";
import useCropHealthStore from "../../application/crop-health.store.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import MessageCard from "../../../shared/presentation/components/message-card.vue";

const store = useCropHealthStore();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const alert = computed(() => store.alertById(route.params.alertId));
const timelineEntries = computed(() => (alert.value?.timeline.length ? alert.value.timeline : alert.value?.tasks ?? []).map(entry => {
  const task = alert.value.tasks.find(item => item.id === (entry.taskId ?? entry.id));
  return { ...entry, time: entry.time ?? entry.scheduledTime, status: task?.status ?? 'PENDING' };
}));
const currentEntryId = computed(() => timelineEntries.value.find(entry => entry.status !== 'COMPLETED')?.id ?? null);

const back = () => alert.value
    ? router.push({ name: 'crop-health-alert-detail', params: { alertId: alert.value.id } })
    : router.push({ name: 'crop-health-alerts' });
</script>

<template>
  <div class="page timeline-page">
    <pv-progress-bar v-if="store.alertsLoading" mode="indeterminate" style="height: 4px" :aria-label="t('common.loading')"/>
    <template v-if="alert">
      <page-header compact :breadcrumbs="[
        { label: 'routes.ch-alerts', link: '/crop-health/alerts' },
        { label: 'crop-health.alert-flow.detail-breadcrumb', link: `/crop-health/alerts/${alert.id}` },
        { label: 'crop-health.alert-flow.timeline' }
      ]" :title="t('crop-health.alert-flow.timeline-title', { alert: alert.title })"/>

      <section class="timeline-card">
        <div class="time-window">{{ t('crop-health.alert-flow.time-window') }}</div>
        <ol class="task-timeline">
          <li v-for="entry in timelineEntries" :key="entry.id" :class="{ completed: entry.status === 'COMPLETED', current: currentEntryId === entry.id }">
            <span class="timeline-node"><i v-if="entry.status === 'COMPLETED'" class="pi pi-check"/></span>
            <div class="timeline-label"><strong>{{ entry.time }}</strong><span>{{ entry.title }}</span></div>
            <span class="timeline-state"><i v-if="entry.status === 'COMPLETED'" class="pi pi-check"/></span>
          </li>
        </ol>
        <div class="timeline-legend">
          <span><i class="legend-dot done"/>{{ t('crop-health.alert-flow.task-completed') }}</span>
          <span><i class="legend-dot current"/>{{ t('crop-health.alert-flow.task-current') }}</span>
          <span><i class="legend-dot"/>{{ t('crop-health.alert-flow.task-pending') }}</span>
        </div>
      </section>
      <div class="timeline-actions"><pv-button outlined :label="t('crop-health.alert-flow.return-detail')" @click="back"/></div>
    </template>

    <message-card v-else-if="!store.alertsLoading" icon="pi pi-exclamation-triangle" :message="t('crop-health.alert-flow.not-found')" alert>
      <template #actions><pv-button :label="t('crop-health.alert-flow.return-alerts')" @click="back"/></template>
    </message-card>
  </div>
</template>

<style scoped>
.timeline-page { max-width: 1000px; }
.timeline-card { width: min(620px, 100%); margin: 20px auto 0; padding: 24px 32px 36px; border: 1px solid var(--sa-primary); border-radius: 24px; background: #e0f2f1; }
.time-window { width: min(280px, 100%); margin: 0 0 26px auto; padding: 12px 18px; border-radius: 8px; background: #176a29; color: white; text-align: center; }
.task-timeline { margin: 0; padding: 0; list-style: none; }
.task-timeline li { position: relative; display: grid; grid-template-columns: 38px minmax(0, 1fr) 38px; align-items: center; gap: 14px; min-height: 62px; }
.task-timeline li:not(:last-child)::after { content: ''; position: absolute; z-index: 0; top: 42px; bottom: -20px; left: 18px; width: 1px; background: var(--sa-primary); }
.timeline-node, .timeline-state { position: relative; z-index: 1; display: grid; place-items: center; width: 32px; height: 32px; border: 1px solid var(--sa-primary); border-radius: 50%; background: var(--sa-surface); color: white; }
.completed .timeline-node, .completed .timeline-state { background: #176a29; }
.current .timeline-node { border-width: 5px; border-color: var(--sa-surface); outline: 1px solid var(--sa-primary); background: #176a29; }
.current .timeline-state { background: var(--sa-tertiary); }
.timeline-label { display: flex; flex-wrap: wrap; justify-content: center; gap: 5px; padding: 10px 14px; border: 1px solid var(--sa-tertiary); border-radius: 12px; background: var(--sa-surface); color: var(--sa-on-tertiary-fixed-variant); box-shadow: 0 2px 3px rgb(0 0 0 / 15%); }
.timeline-label strong::after { content: ' — '; }
.timeline-legend { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 28px; font-size: 12px; }
.timeline-legend span { display: inline-flex; align-items: center; gap: 6px; }
.legend-dot { width: 12px; height: 12px; border: 1px solid var(--sa-primary); border-radius: 50%; background: var(--sa-surface); }
.legend-dot.done { background: #176a29; }
.legend-dot.current { background: var(--sa-tertiary); }
.timeline-actions { display: flex; justify-content: flex-end; }
.timeline-actions :deep(.p-button) { min-width: 260px; }
@media (max-width: 560px) {
  .timeline-card { padding: 20px 16px 28px; }
  .task-timeline li { grid-template-columns: 34px minmax(0, 1fr); }
  .timeline-state { display: none; }
  .timeline-label { justify-content: flex-start; }
  .timeline-actions :deep(.p-button) { width: 100%; }
}
</style>
