<script setup>
import {computed, ref, watch} from "vue";
import {useI18n} from "vue-i18n";

/** Invites or reassigns a technical advisor (Angular `AdvisorDialog`). */
const props = defineProps({
  /** Advisor to edit; `null` to invite a new one. */
  advisor: { type: Object, default: null }
});
const visible = defineModel('visible', { type: Boolean, required: true });
const emit = defineEmits(['save']);
const { t } = useI18n();

const isEdit = computed(() => !!props.advisor);
const form = ref({ name: '', cipCode: '', phone: '', assignedPlotsCount: 0 });
const submitted = ref(false);

watch(visible, open => {
  if (!open) return;
  submitted.value = false;
  form.value = {
    name: props.advisor?.name ?? '',
    cipCode: props.advisor?.cipCode ?? '',
    phone: props.advisor?.phone ?? '',
    assignedPlotsCount: props.advisor?.assignedPlotsCount ?? 0
  };
}, { immediate: true });

const missing = field => submitted.value && !String(form.value[field] ?? '').trim();

/** Emits the data when every field is filled. */
const onSubmit = () => {
  submitted.value = true;
  if (['name', 'cipCode', 'phone'].some(field => !form.value[field].trim()) || form.value.assignedPlotsCount === null) return;
  emit('save', { ...form.value });
  visible.value = false;
};
</script>

<template>
  <pv-dialog v-model:visible="visible" modal :header="t(isEdit ? 'profiles.advisors.edit-title' : 'profiles.advisors.invite-title')" :style="{ width: '500px', maxWidth: 'calc(100vw - 32px)' }">
    <p class="sa-muted mt-0 mb-3">{{ t(isEdit ? 'profiles.advisors.edit-description' : 'profiles.advisors.invite-description') }}</p>
    <form id="advisor-form" class="flex flex-column gap-3" novalidate @submit.prevent="onSubmit">
      <div class="sa-field">
        <label for="advisor-name">{{ t('profiles.advisors.name') }}</label>
        <pv-input-text id="advisor-name" v-model="form.name" placeholder="Ej: Ing. Juan A. Morales" :invalid="missing('name')" fluid/>
        <small v-if="missing('name')" class="sa-error">{{ t('profiles.advisors.name-required') }}</small>
      </div>
      <div class="sa-field">
        <label for="advisor-cip">{{ t('profiles.advisors.cip') }}</label>
        <pv-input-text id="advisor-cip" v-model="form.cipCode" placeholder="Ej: 184029" :invalid="missing('cipCode')" fluid/>
        <small v-if="missing('cipCode')" class="sa-error">{{ t('profiles.advisors.cip-required') }}</small>
      </div>
      <div class="sa-field">
        <label for="advisor-phone">{{ t('profiles.advisors.phone') }}</label>
        <pv-input-text id="advisor-phone" v-model="form.phone" placeholder="Ej: 964 811 200" :invalid="missing('phone')" fluid/>
        <small v-if="missing('phone')" class="sa-error">{{ t('profiles.advisors.phone-required') }}</small>
      </div>
      <div class="sa-field">
        <label for="advisor-plots">{{ t('profiles.advisors.plots') }}</label>
        <pv-input-number v-model="form.assignedPlotsCount" input-id="advisor-plots" :min="0" placeholder="Ej: 32" fluid/>
      </div>
    </form>
    <template #footer>
      <pv-button text severity="secondary" :label="t('common.cancel')" @click="visible = false"/>
      <pv-button type="submit" form="advisor-form" :label="t(isEdit ? 'profiles.advisors.save-changes' : 'profiles.advisors.save-invite')"/>
    </template>
  </pv-dialog>
</template>
