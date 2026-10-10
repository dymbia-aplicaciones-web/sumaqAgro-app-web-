<script setup>
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import {useToast} from "primevue";
import useIamStore from "../../../iam/application/iam.store.js";

const props = defineProps({ supportPhone: { type: String, default: '' } });
const { t } = useI18n();
const router = useRouter();
const toast = useToast();
const iamStore = useIamStore();

const manuals = [
  { id: 'plot', icon: 'pi pi-map-marker', route: '/field-management/plots', steps: 4 },
  { id: 'health', icon: 'pi pi-sun', route: '/crop-health/monitoring', steps: 4 },
  { id: 'expenses', icon: 'pi pi-wallet', route: '/field-management/finances', steps: 4 },
  { id: 'advisor', icon: 'pi pi-comments', route: '/crop-health/advisor', steps: 4 },
  { id: 'alerts', icon: 'pi pi-bell', route: '/crop-health/alerts', steps: 6 },
  { id: 'certificates', icon: 'pi pi-verified', route: '/harvest-certification/certificates', steps: 4 }
];

const storageKey = `sumaq-help-progress-${iamStore.currentUserId ?? 'guest'}`;
const restoreProgress = () => {
  try { return JSON.parse(localStorage.getItem(storageKey) ?? '{}'); }
  catch { return {}; }
};

const query = ref('');
const selected = ref(null);
const currentStep = ref(0);
const progress = ref(restoreProgress());
const dialogVisible = computed({
  get: () => Boolean(selected.value),
  set: visible => { if (!visible) selected.value = null; }
});

const translatedManual = manual => ({
  ...manual,
  title: t(`profiles.help.manuals.${manual.id}.title`),
  description: t(`profiles.help.manuals.${manual.id}.description`),
  keywords: t(`profiles.help.manuals.${manual.id}.keywords`)
});

const filteredManuals = computed(() => {
  const term = query.value.trim().toLocaleLowerCase();
  const translated = manuals.map(translatedManual);
  if (!term) return translated;
  return translated.filter(manual => `${manual.title} ${manual.description} ${manual.keywords}`.toLocaleLowerCase().includes(term));
});

const saveProgress = () => localStorage.setItem(storageKey, JSON.stringify(progress.value));
const statusOf = manual => {
  const reached = progress.value[manual.id];
  if (reached === 'COMPLETED') return 'COMPLETED';
  return Number.isInteger(reached) ? 'IN_PROGRESS' : 'NOT_STARTED';
};

const openManual = manual => {
  selected.value = manual;
  const saved = progress.value[manual.id];
  currentStep.value = saved === 'COMPLETED' ? manual.steps - 1 : Number.isInteger(saved) ? Math.min(saved, manual.steps - 1) : 0;
  if (saved === undefined) {
    progress.value = { ...progress.value, [manual.id]: 0 };
    saveProgress();
  }
};

const moveTo = step => {
  currentStep.value = Math.max(0, Math.min(step, selected.value.steps - 1));
  if (progress.value[selected.value.id] !== 'COMPLETED') {
    progress.value = { ...progress.value, [selected.value.id]: Math.max(progress.value[selected.value.id] ?? 0, currentStep.value) };
    saveProgress();
  }
};

const finishManual = () => {
  progress.value = { ...progress.value, [selected.value.id]: 'COMPLETED' };
  saveProgress();
};

const goToFeature = () => {
  finishManual();
  const route = selected.value.route;
  selected.value = null;
  router.push(route);
};

const contactSupport = () => {
  const phone = props.supportPhone.trim();
  if (!phone) {
    toast.add({ severity: 'info', summary: t('profiles.settings.support-unavailable'), life: 3500 });
    return;
  }
  window.location.href = `tel:${phone.replace(/[^\d+]/g, '')}`;
};
</script>

<template>
  <section class="help-center">
    <header>
      <h2>{{ t('profiles.help.title') }}</h2>
      <p>{{ t('profiles.help.subtitle') }}</p>
    </header>

    <pv-icon-field class="manual-search">
      <pv-input-icon class="pi pi-search"/>
      <pv-input-text v-model="query" type="search" fluid :placeholder="t('profiles.help.search')" :aria-label="t('profiles.help.search')"/>
    </pv-icon-field>

    <div v-if="filteredManuals.length" class="manual-list">
      <button v-for="manual in filteredManuals" :key="manual.id" type="button" class="manual-row" @click="openManual(manual)">
        <i :class="manual.icon" aria-hidden="true"/>
        <span><strong>{{ manual.title }}</strong><small>{{ manual.description }}</small></span>
        <span class="manual-meta">
          <em :class="`status-${statusOf(manual).toLowerCase()}`">{{ t(`profiles.help.status.${statusOf(manual)}`) }}</em>
          <small>{{ t('profiles.help.reading-time', { minutes: manual.steps + 1 }) }}</small>
        </span>
        <i class="pi pi-chevron-right" aria-hidden="true"/>
      </button>
    </div>
    <div v-else class="empty-result">
      <i class="pi pi-search"/>
      <strong>{{ t('profiles.help.no-results-title') }}</strong>
      <span>{{ t('profiles.help.no-results-description') }}</span>
    </div>

    <footer class="help-actions">
      <p>{{ t('profiles.help.cant-find') }}</p>
      <div>
        <pv-button outlined icon="pi pi-phone" :label="t('profiles.help.contact-support')" @click="contactSupport"/>
        <pv-button outlined icon="pi pi-comments" :label="t('profiles.help.consult-advisor')" @click="router.push('/crop-health/advisor')"/>
      </div>
    </footer>

    <pv-dialog v-model:visible="dialogVisible" modal :header="selected?.title" class="manual-dialog" :style="{ width: '680px', maxWidth: 'calc(100vw - 32px)' }">
      <template v-if="selected">
        <div class="manual-progress" role="progressbar" :aria-valuenow="currentStep + 1" aria-valuemin="1" :aria-valuemax="selected.steps">
          <span :style="{ width: `${((currentStep + 1) / selected.steps) * 100}%` }"/>
        </div>
        <p class="manual-objective">{{ t(`profiles.help.manuals.${selected.id}.objective`) }}</p>
        <article class="manual-step">
          <span class="step-number">{{ currentStep + 1 }}</span>
          <div>
            <small>{{ t('profiles.help.step-of', { current: currentStep + 1, total: selected.steps }) }}</small>
            <h3>{{ t(`profiles.help.manuals.${selected.id}.steps.${currentStep}.title`) }}</h3>
            <p>{{ t(`profiles.help.manuals.${selected.id}.steps.${currentStep}.description`) }}</p>
          </div>
        </article>
        <pv-message severity="info" :closable="false">{{ t(`profiles.help.manuals.${selected.id}.tip`) }}</pv-message>
        <div class="dialog-actions">
          <pv-button text :disabled="currentStep === 0" icon="pi pi-arrow-left" :label="t('profiles.help.previous')" @click="moveTo(currentStep - 1)"/>
          <pv-button v-if="currentStep < selected.steps - 1" icon-pos="right" icon="pi pi-arrow-right" :label="t('profiles.help.next')" @click="moveTo(currentStep + 1)"/>
          <pv-button v-else icon-pos="right" icon="pi pi-external-link" :label="t('profiles.help.go-to-feature')" @click="goToFeature"/>
        </div>
      </template>
    </pv-dialog>
  </section>
</template>

<style scoped>
.help-center { padding: 28px; }
.help-center header h2 { margin: 0; font-size: 26px; }
.help-center header p { margin: 6px 0 22px; color: var(--sa-on-surface-variant); }
.manual-search { width: min(360px, 100%); }
.manual-list { display: flex; flex-direction: column; gap: 9px; margin-top: 18px; }
.manual-row { display: grid; grid-template-columns: 28px minmax(0, 1fr) auto 18px; align-items: center; gap: 12px; width: 100%; padding: 12px 14px; border: 1px solid var(--sa-outline-variant); border-radius: 8px; background: transparent; color: var(--sa-on-surface); text-align: left; cursor: pointer; }
.manual-row:hover, .manual-row:focus-visible { border-color: var(--sa-tertiary); background: color-mix(in srgb, var(--sa-secondary-container) 35%, transparent); }
.manual-row > i:first-child { color: var(--sa-primary); font-size: 20px; }
.manual-row span { display: flex; min-width: 0; flex-direction: column; }
.manual-row strong { color: var(--sa-primary); font-weight: 500; }
.manual-row small { color: var(--sa-on-surface-variant); }
.manual-meta { align-items: flex-end; gap: 3px; }
.manual-meta em { padding: 2px 8px; border-radius: 999px; font-size: 11px; font-style: normal; }
.status-not_started { background: var(--sa-surface-container-high); }
.status-in_progress { background: #fff1b8; }
.status-completed { background: var(--sa-secondary-container); color: var(--sa-primary); }
.empty-result { display: flex; align-items: center; flex-direction: column; gap: 8px; margin-top: 20px; padding: 30px; border: 1px dashed var(--sa-outline-variant); border-radius: 12px; color: var(--sa-on-surface-variant); text-align: center; }
.empty-result i { font-size: 28px; }
.help-actions { margin-top: 28px; padding-top: 20px; border-top: 1px solid var(--sa-outline-variant); }
.help-actions p { color: var(--sa-on-surface-variant); }
.help-actions div { display: flex; flex-wrap: wrap; gap: 12px; }
.manual-progress { height: 8px; overflow: hidden; border-radius: 999px; background: var(--sa-surface-container-high); }
.manual-progress span { display: block; height: 100%; background: var(--sa-primary); transition: width .2s ease; }
.manual-objective { color: var(--sa-on-surface-variant); }
.manual-step { display: grid; grid-template-columns: 48px 1fr; gap: 14px; min-height: 190px; margin: 18px 0; padding: 22px; border-radius: 18px; background: color-mix(in srgb, var(--sa-secondary-container) 42%, transparent); }
.step-number { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 50%; background: var(--sa-primary); color: white; font-size: 18px; font-weight: 600; }
.manual-step small { color: var(--sa-primary); font-weight: 500; }
.manual-step h3 { margin: 8px 0; }
.manual-step p { margin: 0; line-height: 1.7; }
.dialog-actions { display: flex; justify-content: space-between; gap: 12px; margin-top: 20px; }
@media (max-width: 620px) {
  .help-center { padding: 22px; }
  .manual-row { grid-template-columns: 26px minmax(0, 1fr) 16px; }
  .manual-meta { display: none !important; }
  .help-actions div, .help-actions :deep(.p-button) { width: 100%; }
  .manual-step { grid-template-columns: 1fr; }
}
</style>
