<script setup>
/**
 * Card with an icon and a short message: errors, empty lists or limits
 * (Angular `MessageCard`). Buttons go in the `actions` slot.
 */
defineProps({
  /** PrimeIcons class shown before the message. */
  icon: { type: String, default: 'pi pi-info-circle' },
  /** Message, already translated. */
  message: { type: String, required: true },
  /** `true` for errors, so screen readers announce the message. */
  alert: { type: Boolean, default: false }
});
</script>

<template>
  <pv-card class="message-card sa-card" :class="{ 'message-card--alert': alert }" :role="alert ? 'alert' : undefined">
    <template #content>
      <div class="flex align-items-center gap-3">
        <i :class="icon" class="text-xl" aria-hidden="true"/>
        <span>{{ message }}</span>
      </div>
    </template>
    <template v-if="$slots.actions" #footer>
      <div class="flex justify-content-end gap-2">
        <slot name="actions"/>
      </div>
    </template>
  </pv-card>
</template>

<style scoped>
.message-card--alert {
  color: var(--sa-error);
}
</style>
