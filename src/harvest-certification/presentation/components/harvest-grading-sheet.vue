<script setup>
import {computed} from "vue";
import {useI18n} from "vue-i18n";

/** Grading sheet: potato calibers or SCA coffee cupping (Angular `HarvestGradingSheetView`). */
defineProps({
  cropType: { type: String, required: true }
});
/** @type {import('vue').ModelRef<Object>} Evaluation form shared with the intake. */
const form = defineModel('form', { type: Object, required: true });
const { t } = useI18n();

const gradingTotal = computed(() => form.value.firstPercentage + form.value.secondPercentage + form.value.thirdPercentage);
</script>

<template>
  <template v-if="cropType === 'ANDEAN_POTATO'">
    <p class="form-section-title">{{ t('harvest-certification.grading.potato-title') }}</p>
    <div class="grade-grid">
      <label>{{ t('harvest-certification.grading.first') }}<pv-input-number v-model="form.firstPercentage" :min="0" :max="100" fluid/></label>
      <label>{{ t('harvest-certification.grading.second') }}<pv-input-number v-model="form.secondPercentage" :min="0" :max="100" fluid/></label>
      <label>{{ t('harvest-certification.grading.third') }}<pv-input-number v-model="form.thirdPercentage" :min="0" :max="100" fluid/></label>
    </div>
    <label class="damage">{{ t('harvest-certification.grading.weevil') }}
      <pv-input-number v-model="form.weevilDamagePercentage" :min="0" :max="100" :max-fraction-digits="1" fluid/>
    </label>
    <p class="validation" :class="{ invalid: gradingTotal !== 100 }">{{ t('harvest-certification.grading.total', { total: gradingTotal }) }}</p>
  </template>
  <template v-else>
    <p class="form-section-title">{{ t('harvest-certification.grading.coffee-title') }}</p>
    <label class="damage">{{ t('harvest-certification.grading.sca-score') }}
      <pv-input-number v-model="form.scaScore" :min="0" :max="100" :max-fraction-digits="1" fluid/>
    </label>
    <p class="validation">{{ t('harvest-certification.grading.specialty-hint') }}</p>
  </template>
</template>

<style scoped>
.form-section-title {
  margin: 25px 0 15px;
  color: #263b2d;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
}

.grade-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 14px;
}

.grade-grid label {
  padding: 11px;
  border-radius: 8px;
  background: #009483;
  color: white;
}

.damage {
  max-width: 220px;
  margin-bottom: 12px;
}

.validation {
  display: inline-block;
  padding: 8px 12px;
  border-radius: 5px;
  background: #24774b;
  color: white;
  font-size: 12px;
}

.validation.invalid {
  background: #ffe7e1;
  color: #982d22;
}

@media (max-width: 760px) {
  .grade-grid {
    grid-template-columns: 1fr;
  }
}
</style>
