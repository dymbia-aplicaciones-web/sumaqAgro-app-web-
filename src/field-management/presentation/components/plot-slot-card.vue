<script setup>
import {useI18n} from "vue-i18n";

/** Free slot of the plan: invites to register a new plot (Angular `PlotSlotCard`, US-22). */
defineProps({
  /** Number of the slot. */
  position: { type: Number, required: true }
});
const emit = defineEmits(['register']);
const { t } = useI18n();
</script>

<template>
  <article class="slot-card">
    <i class="pi pi-plus-circle slot-card__icon" aria-hidden="true"/>
    <h2>{{ t('field-management.plots.slot-available') }}</h2>
    <p>{{ t('field-management.plots.slot-text', { number: position }) }}</p>
    <pv-button outlined class="sa-pill mt-2" :label="t('field-management.plots.register')" @click="emit('register')"/>
  </article>
</template>

<style scoped>
.slot-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 300px;
  padding: 24px;
  border: 2px dashed var(--sa-outline-variant);
  border-radius: var(--sa-radius-large);
  text-align: center;
}

.slot-card__icon {
  color: var(--sa-primary);
  font-size: 2.5rem;
}

h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

p {
  margin: 0;
  color: var(--sa-on-surface-variant);
}
</style>
