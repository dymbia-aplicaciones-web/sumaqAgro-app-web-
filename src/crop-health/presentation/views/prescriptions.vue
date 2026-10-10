<script setup>
import {watch} from "vue";
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import useCropHealthStore from "../../application/crop-health.store.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import MessageCard from "../../../shared/presentation/components/message-card.vue";
import {formatDate} from "../../../shared/presentation/format.js";

/** History of technical prescriptions (Angular `PrescriptionsView`). */
const store = useCropHealthStore();
const router = useRouter();
const { t, locale } = useI18n();

watch(() => store.scopeReady, ready => { if (ready) store.loadClinicalData(); }, { immediate: true });
</script>

<template>
  <div class="page">
    <page-header :eyebrow="t('crop-health.clinical-eyebrow')" :title="t('crop-health.history-title')"/>
    <p v-if="store.writeError" class="sa-error m-0" role="alert">{{ t(store.writeError) }}</p>
    <nav><pv-button outlined class="sa-pill" :label="t('crop-health.inbox-title')" @click="router.push('/crop-health/inbox')"/></nav>
    <pv-progress-bar v-if="store.clinicalLoading || store.saving" mode="indeterminate" style="height: 4px" :aria-label="t('common.loading')"/>
    <message-card v-if="store.clinicalError" icon="pi pi-times-circle" :message="t(store.clinicalError)" alert/>

    <div v-if="!store.clinicalLoading && !store.clinicalError" class="flex flex-column gap-3">
      <pv-card v-for="prescription in store.prescriptions" :key="prescription.id" class="sa-card">
        <template #title>{{ prescription.recommendedProducts }}</template>
        <template #subtitle>{{ store.reportLabel(prescription.reportId) }} · {{ store.advisorName(prescription.agronomistId) }}</template>
        <template #content>
          <p>{{ t('crop-health.application-date') }}: {{ formatDate(prescription.applicationDate, locale) }}</p>
          <p class="instructions">{{ prescription.dosageInstructions }}</p>
        </template>
      </pv-card>
      <message-card v-if="store.prescriptions.length === 0" icon="pi pi-file-edit" :message="t('crop-health.no-prescriptions')"/>
    </div>
  </div>
</template>

<style scoped>
.instructions {
  white-space: pre-line;
}
</style>
