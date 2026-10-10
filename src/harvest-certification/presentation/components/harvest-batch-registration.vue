<script setup>
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import {formatNumber} from "../../../shared/presentation/format.js";

/** Intake of the batch: member, plot and weights (Angular `HarvestBatchRegistrationView`). */
const props = defineProps({
  members: { type: Array, required: true },
  plots: { type: Array, required: true }
});
/** @type {import('vue').ModelRef<Object>} Evaluation form shared with the grading sheet. */
const form = defineModel('form', { type: Object, required: true });
const emit = defineEmits(['member-changed']);
const { t, locale } = useI18n();

const netKg = computed(() => Math.max(0, form.value.grossKg - form.value.tareKg));
const plotOptions = computed(() => props.plots.map(plot => ({ id: plot.id, label: `${plot.name} (${plot.variety})` })));
</script>

<template>
  <p class="form-section-title">{{ t('harvest-certification.form.intake-title') }}</p>
  <div class="form-grid">
    <div class="sa-field">
      <label for="member">{{ t('harvest-certification.form.member') }} *</label>
      <pv-select v-model="form.memberId" input-id="member" :options="members" option-label="name" option-value="id" fluid @change="emit('member-changed')"/>
    </div>
    <div class="sa-field">
      <label for="batch-plot">{{ t('harvest-certification.form.plot') }} *</label>
      <pv-select v-model="form.plotId" input-id="batch-plot" :options="plotOptions" option-label="label" option-value="id" fluid/>
    </div>
    <div class="sa-field">
      <label for="gross">{{ t('harvest-certification.form.gross-kg') }} *</label>
      <pv-input-number v-model="form.grossKg" input-id="gross" :min="0" :max-fraction-digits="2" fluid/>
    </div>
    <div class="sa-field">
      <label for="tare">{{ t('harvest-certification.form.tare-kg') }} *</label>
      <pv-input-number v-model="form.tareKg" input-id="tare" :min="0" :max-fraction-digits="2" fluid/>
    </div>
    <div class="sa-field">
      <label for="net">{{ t('harvest-certification.form.net-weight') }}</label>
      <pv-input-text id="net" :model-value="formatNumber(netKg, locale)" readonly fluid/>
    </div>
    <div class="sa-field">
      <label for="sample">{{ t('harvest-certification.form.sample-kg') }} *</label>
      <pv-input-number v-model="form.sampleKg" input-id="sample" :min="0" :max-fraction-digits="2" fluid/>
    </div>
  </div>
  <p class="weight-hint">{{ t('harvest-certification.form.weight-hint') }}</p>
</template>

<style scoped>
.form-section-title {
  margin: 0 0 15px;
  color: #263b2d;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 15px 28px;
}

.weight-hint {
  margin: 10px 0 0;
  color: #526e5c;
  font-size: 12px;
}

@media (max-width: 760px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
