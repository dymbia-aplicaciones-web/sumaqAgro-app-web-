<script setup>
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";
import {useRoute, useRouter} from "vue-router";
import useCropHealthStore from "../../application/crop-health.store.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import MessageCard from "../../../shared/presentation/components/message-card.vue";
import {formatDate} from "../../../shared/presentation/format.js";

const store = useCropHealthStore();
const route = useRoute();
const router = useRouter();
const { t, locale } = useI18n();
const reportVisible = ref(false);

const alert = computed(() => store.alertById(route.params.alertId));
const firstPendingTaskId = computed(() => alert.value?.tasks.find(task => task.status !== 'COMPLETED')?.id ?? null);
const completedCount = computed(() => alert.value?.tasks.filter(task => task.status === 'COMPLETED').length ?? 0);

const completeTask = task => store.completeAlertTask(alert.value.id, task.id);
const finalize = async () => {
  if (alert.value.attentionStatus === 'COMPLETED') {
    reportVisible.value = true;
    return;
  }
  if (await store.finalizeAlert(alert.value.id)) reportVisible.value = true;
};
const timeline = () => router.push({ name: 'crop-health-alert-timeline', params: { alertId: alert.value.id } });
const backToAlerts = () => router.push({ name: 'crop-health-alerts' });
</script>

<template>
  <div class="page alert-detail-page">
    <pv-progress-bar v-if="store.alertsLoading" mode="indeterminate" style="height: 4px" :aria-label="t('common.loading')"/>

    <template v-if="alert">
      <page-header compact :breadcrumbs="[
        { label: 'routes.ch-alerts', link: '/crop-health/alerts' },
        { label: 'crop-health.alert-flow.detail-breadcrumb' }
      ]" :title="t('crop-health.alert-flow.detail-title', { alert: alert.title })" :subtitle="alert.description"/>

      <pv-message v-if="store.writeError" severity="error" :closable="false">{{ t(store.writeError) }}</pv-message>

      <div class="detail-layout">
        <main class="tasks-column">
          <section class="plan-summary">
            <div class="summary-topline">
              <span class="step-pill"><b>1</b>{{ t('crop-health.alert-flow.emergency-risk') }}</span>
              <span>{{ t('crop-health.alert-flow.completed-count', { completed: completedCount, total: alert.tasks.length }) }}</span>
            </div>
            <div class="progress-track"><span :style="{ width: `${alert.progress}%` }"/></div>
            <p>{{ t('crop-health.alert-flow.progress-description', { progress: alert.progress }) }}</p>
          </section>

          <section v-for="(task, index) in alert.tasks" :key="task.id" class="task-card" :class="{ completed: task.status === 'COMPLETED' }">
            <div class="task-header">
              <span class="step-pill"><b>{{ index + 1 }}</b>{{ task.title }}</span>
              <pv-button
                  :icon="task.status === 'COMPLETED' ? 'pi pi-check' : undefined"
                  :label="task.status === 'COMPLETED' ? t('crop-health.alert-flow.task-completed') : task.actionLabel"
                  :disabled="task.status === 'COMPLETED' || firstPendingTaskId !== task.id || store.saving"
                  @click="completeTask(task)"/>
            </div>
            <div class="task-body">
              <div>
                <p>{{ task.description }}</p>
                <small><i class="pi pi-clock"/>{{ task.scheduledTime }}</small>
              </div>
              <div v-if="task.kind === 'COVERAGE'" class="coverage-visual" :aria-label="t('crop-health.alert-flow.coverage-visual')">
                <span class="coverage-field"/><span class="coverage-area"/><i class="pi pi-map-marker"/>
              </div>
              <div v-else-if="task.kind === 'MONITORING'" class="mini-chart" :aria-label="t('crop-health.alert-flow.monitoring-visual')">
                <span v-for="height in [42, 65, 54, 78, 61, 88]" :key="height" :style="{ height: `${height}%` }"/>
              </div>
            </div>
          </section>
        </main>

        <aside class="plan-sidebar">
          <section class="status-panel">
            <span>{{ t('crop-health.alert-flow.updated') }}: {{ formatDate(alert.updatedAt, locale, { dateStyle: 'medium', timeStyle: 'short' }) }}</span>
            <span>{{ t('crop-health.alert-flow.status') }}: {{ t(`crop-health.severity-${alert.severity.toLowerCase()}`) }}</span>
          </section>
          <div class="sidebar-actions">
            <pv-button outlined icon="pi pi-list" :label="t('crop-health.alert-flow.timeline')" @click="timeline"/>
            <pv-button
                :outlined="!alert.canFinalize"
                icon="pi pi-check-circle"
                :label="alert.attentionStatus === 'COMPLETED' ? t('crop-health.alert-flow.view-report') : t('crop-health.alert-flow.finalize')"
                :disabled="!alert.canFinalize || store.saving"
                @click="finalize"/>
          </div>
        </aside>
      </div>

      <pv-dialog v-model:visible="reportVisible" modal :closable="true" class="completion-dialog" :style="{ width: '720px', maxWidth: 'calc(100vw - 32px)' }">
        <div class="completion-report">
          <div class="success-icon"><i class="pi pi-check"/></div>
          <h2>{{ t('crop-health.alert-flow.report-title') }}</h2>
          <p>{{ t('crop-health.alert-flow.report-thanks', { name: store.activeUser?.displayName ?? '', alert: alert.title }) }}</p>
          <section class="report-tasks">
            <div v-for="(task, index) in alert.tasks" :key="task.id" class="report-task">
              <b>{{ index + 1 }}</b><span>{{ task.title }}</span><i class="pi pi-check-circle"/>
            </div>
            <div class="report-progress"><span/><strong>100%</strong></div>
          </section>
          <p class="report-note">{{ t('crop-health.alert-flow.report-note') }}</p>
          <pv-button :label="t('crop-health.alert-flow.return-alerts')" @click="backToAlerts"/>
        </div>
      </pv-dialog>
    </template>

    <message-card v-else-if="!store.alertsLoading" icon="pi pi-exclamation-triangle" :message="t('crop-health.alert-flow.not-found')" alert>
      <template #actions><pv-button :label="t('crop-health.alert-flow.return-alerts')" @click="backToAlerts"/></template>
    </message-card>
  </div>
</template>

<style scoped>
.alert-detail-page { max-width: 1120px; }
.detail-layout { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 40px; }
.tasks-column { display: flex; flex-direction: column; gap: 16px; }
.plan-summary, .task-card, .status-panel { border: 1px solid var(--sa-primary); border-radius: 20px; background: var(--sa-surface); }
.plan-summary, .task-card { padding: 14px 20px; }
.summary-topline, .task-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.step-pill { display: inline-flex; align-items: center; gap: 10px; min-width: 210px; padding: 7px 16px 7px 8px; border-radius: 16px; background: #176a29; color: white; }
.step-pill b { display: grid; place-items: center; width: 28px; height: 28px; flex: none; border-radius: 50%; background: white; color: var(--sa-on-surface); }
.progress-track { height: 20px; margin-top: 14px; overflow: hidden; border: 1px solid var(--sa-primary); border-radius: 999px; background: #dcefee; }
.progress-track span { display: block; height: 100%; border-radius: inherit; background: #176a29; transition: width .25s ease; }
.plan-summary p { margin: 10px 0 0; }
.task-card.completed { background: color-mix(in srgb, var(--sa-secondary-container) 38%, var(--sa-surface)); }
.task-header :deep(.p-button) { min-width: 190px; border-radius: 999px; }
.task-body { display: grid; grid-template-columns: 1fr auto; align-items: center; min-height: 100px; padding: 16px 4px 0; }
.task-body p { margin: 0 0 12px; }
.task-body small { display: inline-flex; align-items: center; gap: 6px; color: var(--sa-on-surface-variant); }
.coverage-visual { position: relative; width: 145px; height: 105px; overflow: hidden; border: 1px solid var(--sa-primary); border-radius: 28px; background: #e7f4e8; }
.coverage-field, .coverage-area { position: absolute; border-radius: 48% 52% 60% 40%; }
.coverage-field { inset: 14px 20px; background: #c5e6c8; }
.coverage-area { inset: 32px 34px 20px 46px; border: 1px solid var(--sa-tertiary); background: #9fded7; transform: rotate(-10deg); }
.coverage-visual i { position: absolute; top: 42px; left: 66px; color: var(--sa-primary); }
.mini-chart { display: flex; align-items: flex-end; gap: 8px; width: 160px; height: 90px; padding: 12px; border-bottom: 1px solid var(--sa-outline-variant); }
.mini-chart span { width: 13px; background: var(--sa-tertiary); }
.mini-chart span:nth-child(even) { background: #00d976; }
.plan-sidebar { display: flex; min-width: 0; flex-direction: column; }
.status-panel { display: flex; flex-direction: column; gap: 8px; padding: 14px; }
.status-panel span { padding: 12px; border-radius: 14px; background: #176a29; color: white; text-align: center; }
.sidebar-actions { display: flex; flex-direction: column; gap: 12px; margin-top: auto; }
.sidebar-actions :deep(.p-button) { width: 100%; }
.completion-report { display: flex; flex-direction: column; align-items: center; text-align: center; }
.success-icon { display: grid; place-items: center; width: 72px; height: 72px; border: 4px solid #176a29; border-radius: 50%; background: #cde8ce; color: #176a29; font-size: 34px; }
.completion-report h2 { margin-bottom: 4px; }
.completion-report > p { color: var(--sa-on-surface-variant); }
.report-tasks { width: 100%; margin: 10px 0; padding: 22px; border-radius: 28px; background: #d9ecd7; }
.report-task { display: grid; grid-template-columns: 32px 1fr 32px; align-items: center; gap: 10px; margin: 10px 0; text-align: left; }
.report-task b { display: grid; place-items: center; width: 28px; height: 28px; border: 2px solid #176a29; border-radius: 50%; }
.report-task span { padding: 9px 14px; border: 1px solid var(--sa-tertiary); border-radius: 12px; background: var(--sa-surface); }
.report-task i { color: #176a29; font-size: 26px; }
.report-progress { position: relative; height: 18px; margin-top: 18px; border-radius: 999px; background: #176a29; }
.report-progress span { display: block; width: 100%; height: 100%; }
.report-progress strong { position: absolute; right: 12px; top: 0; color: white; font-size: 12px; }
.report-note { color: var(--sa-on-surface) !important; }
@media (max-width: 900px) {
  .detail-layout { grid-template-columns: 1fr; }
  .sidebar-actions { margin-top: 0; }
}
@media (max-width: 620px) {
  .summary-topline, .task-header { align-items: stretch; flex-direction: column; }
  .step-pill, .task-header :deep(.p-button) { width: 100%; }
  .task-body { grid-template-columns: 1fr; gap: 16px; }
}
</style>
