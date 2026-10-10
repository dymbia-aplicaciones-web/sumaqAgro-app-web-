<script setup>
import {useI18n} from "vue-i18n";

/** Two steps of the plot registration: crop data and map (Angular `RegistrationSteps`). */
defineProps({
  /** Current step (1 or 2). */
  current: { type: Number, required: true }
});
const { t } = useI18n();
const steps = [
  { number: 1, label: 'field-management.steps.crop-data' },
  { number: 2, label: 'field-management.steps.map-title' }
];
</script>

<template>
  <ol class="steps" :aria-label="t('field-management.steps.label')">
    <template v-for="(step, index) in steps" :key="step.number">
      <li class="step" :class="{ active: step.number === current }" :aria-current="step.number === current ? 'step' : undefined">
        <span class="step-number">{{ step.number }}</span>
        <span class="step-label">{{ t(step.label) }}</span>
      </li>
      <li v-if="index < steps.length - 1" class="step-line" aria-hidden="true"/>
    </template>
  </ol>
</template>

<style scoped>
.steps {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.step {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px 6px 6px;
  border-radius: 9999px;
  background: var(--sa-surface-container-high);
  font-weight: 500;
  white-space: nowrap;
}

.step.active {
  background: var(--sa-primary);
  color: var(--sa-on-primary);
}

.step-number {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--sa-surface);
  color: var(--sa-on-surface);
  font-weight: 700;
}

.step-line {
  flex: 1;
  height: 1px;
  background: var(--sa-outline-variant);
}

/* On phones only the current step keeps its text. */
@media (max-width: 719.98px) {
  .step:not(.active) .step-label {
    display: none;
  }

  .step:not(.active) {
    padding-right: 6px;
  }
}
</style>
