<script setup>
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";
import {CampaignLedger} from "../../domain/model/campaign-ledger.entity.js";
import {CropType} from "../../domain/model/field-management.enums.js";

/** Suggested seed varieties per crop (Angular `SEED_VARIETIES`). */
const SEED_VARIETIES = {
  [CropType.ANDEAN_POTATO]: ['Papa Canchán', 'Papa Yungay', 'Papa Perricholi', 'Papa Única'],
  [CropType.SPECIALTY_COFFEE]: ['Typica', 'Caturra', 'Bourbon', 'Geisha', 'Catimor']
};

/** Step 1 of the plot registration: crop data (Angular `PlotRegistrationForm`). */
defineProps({
  saving: { type: Boolean, default: false }
});
const emit = defineEmits(['submitted', 'cancel']);
const { t } = useI18n();

const form = ref({
  name: '', cropType: CropType.ANDEAN_POTATO, seedVariety: '', region: '',
  sowingDate: null, expectedYield: null, declaredArea: null
});
const submitted = ref(false);
const varietySuggestions = ref([]);
const cropTypes = Object.values(CropType);
const yieldUnit = computed(() => CampaignLedger.yieldUnitOf(form.value.cropType));

/** Validation errors (i18n keys), like the Angular validators. */
const errors = computed(() => {
  const value = form.value;
  const result = {};
  if (!value.name.trim()) result.name = 'field-management.plot-form.name-required';
  else if (value.name.length > 60) result.name = 'common.required';
  if (!String(value.seedVariety ?? '').trim()) result.seedVariety = 'common.required';
  if (!value.region.trim()) result.region = 'field-management.plot-form.region-required';
  if (!value.sowingDate) result.sowingDate = 'common.required';
  if (value.expectedYield !== null && value.expectedYield < 1) result.expectedYield = 'field-management.plot-form.positive';
  if (value.declaredArea !== null && value.declaredArea < 0.01) result.declaredArea = 'field-management.plot-form.positive';
  return result;
});

/**
 * Filters the suggested varieties of the selected crop.
 * @param {{query: string}} event - AutoComplete event.
 */
const searchVarieties = (event) => {
  const text = event.query.toLowerCase();
  varietySuggestions.value = SEED_VARIETIES[form.value.cropType].filter(variety => variety.toLowerCase().includes(text));
};

/**
 * @param {string} field - Field name.
 * @returns {string|undefined} Translated error after the first submit.
 */
const errorOf = (field) => submitted.value && errors.value[field] ? t(errors.value[field]) : undefined;

/** Emits the data when the form is valid. */
const onSubmit = () => {
  submitted.value = true;
  if (Object.keys(errors.value).length) return;
  const value = form.value;
  emit('submitted', {
    name: value.name.trim(),
    region: value.region.trim(),
    cropType: value.cropType,
    seedVariety: String(value.seedVariety).trim(),
    customVariety: !SEED_VARIETIES[value.cropType].includes(value.seedVariety),
    sowingDate: value.sowingDate,
    expectedYield: value.expectedYield,
    yieldUnit: yieldUnit.value,
    declaredAreaHectares: value.declaredArea ?? 0
  });
};
</script>

<template>
  <form class="form-grid" novalidate @submit.prevent="onSubmit">
    <div class="sa-field full">
      <label for="plot-name">{{ t('field-management.plot-form.name') }} *</label>
      <pv-input-text id="plot-name" v-model="form.name" :placeholder="t('field-management.plot-form.name-placeholder')" :invalid="!!errorOf('name')" fluid/>
      <small v-if="errorOf('name')" class="sa-error">{{ errorOf('name') }}</small>
    </div>

    <fieldset class="sa-field radio-field">
      <legend class="sa-muted">{{ t('field-management.plot-form.crop-type') }}</legend>
      <div class="flex flex-wrap gap-4 pt-2">
        <label v-for="crop in cropTypes" :key="crop" class="flex align-items-center gap-2">
          <pv-radio-button v-model="form.cropType" :value="crop" name="crop-type"/>
          {{ t(`field-management.crop-type.${crop}`) }}
        </label>
      </div>
    </fieldset>

    <div class="sa-field">
      <label for="seed-variety">{{ t('field-management.plot-form.seed-variety') }} *</label>
      <pv-auto-complete v-model="form.seedVariety" input-id="seed-variety" :suggestions="varietySuggestions"
                        :placeholder="t('field-management.plot-form.variety-placeholder')" :invalid="!!errorOf('seedVariety')"
                        dropdown fluid @complete="searchVarieties"/>
      <small class="sa-muted">{{ t('field-management.plot-form.variety-hint') }}</small>
      <small v-if="errorOf('seedVariety')" class="sa-error">{{ errorOf('seedVariety') }}</small>
    </div>

    <div class="sa-field">
      <label for="plot-region">{{ t('field-management.plot-form.region') }} *</label>
      <pv-input-text id="plot-region" v-model="form.region" :placeholder="t('field-management.plot-form.region-placeholder')" :invalid="!!errorOf('region')" fluid/>
      <small v-if="errorOf('region')" class="sa-error">{{ errorOf('region') }}</small>
    </div>

    <div class="sa-field">
      <label for="sowing-date">{{ t('field-management.plot-form.sowing-date') }} *</label>
      <pv-date-picker v-model="form.sowingDate" input-id="sowing-date" date-format="dd/mm/yy" show-icon :invalid="!!errorOf('sowingDate')" fluid/>
      <small v-if="errorOf('sowingDate')" class="sa-error">{{ errorOf('sowingDate') }}</small>
    </div>

    <div class="sa-field">
      <label for="expected-yield">{{ t('field-management.plot-form.expected-yield') }}</label>
      <pv-input-group>
        <pv-input-number v-model="form.expectedYield" input-id="expected-yield" :min="0" placeholder="280"/>
        <pv-input-group-addon>{{ t(`field-management.yield-unit.${yieldUnit}`) }}</pv-input-group-addon>
      </pv-input-group>
      <small v-if="errorOf('expectedYield')" class="sa-error">{{ errorOf('expectedYield') }}</small>
    </div>

    <div class="sa-field">
      <label for="declared-area">{{ t('field-management.plot-form.declared-area') }}</label>
      <pv-input-group>
        <pv-input-number v-model="form.declaredArea" input-id="declared-area" :min="0" :max-fraction-digits="2" placeholder="2.5"/>
        <pv-input-group-addon>{{ t('field-management.plots.hectares') }}</pv-input-group-addon>
      </pv-input-group>
      <small v-if="errorOf('declaredArea')" class="sa-error">{{ errorOf('declaredArea') }}</small>
    </div>

    <div class="full flex justify-content-between mt-2">
      <pv-button type="button" outlined class="sa-pill" :label="t('field-management.plot-form.cancel')" @click="emit('cancel')"/>
      <pv-button type="submit" class="sa-pill" icon="pi pi-arrow-right" icon-pos="right" :label="t('common.next')" :disabled="saving"/>
    </div>

    <p class="full flex align-items-center gap-2 sa-muted m-0">
      <i class="pi pi-map" aria-hidden="true"/>{{ t('field-management.plot-form.next-step-hint') }}
    </p>
  </form>
</template>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 48px;
}

.full {
  grid-column: 1 / -1;
}

.radio-field {
  margin: 0;
  padding: 0;
  border: 0;
}

@media (max-width: 719.98px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
