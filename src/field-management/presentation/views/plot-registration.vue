<script setup>
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import useFieldManagementStore from "../../application/field-management.store.js";
import {CropCampaign} from "../../domain/model/crop-campaign.entity.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import MessageCard from "../../../shared/presentation/components/message-card.vue";
import RegistrationSteps from "../components/registration-steps.vue";
import PlotRegistrationForm from "../components/plot-registration-form.vue";

/** Step 1 of the plot registration (Angular `PlotRegistrationView`, US-28, US-32 to US-36). */
const { t } = useI18n();
const router = useRouter();
const store = useFieldManagementStore();

const slotNumber = computed(() => store.plotCount + 1);
const breadcrumbs = [
  { label: 'option.my-plot', link: '/field-management/dashboard' },
  { label: 'field-management.plots.manage', link: '/field-management/plots' },
  { label: 'field-management.steps.crop-data' }
];

/**
 * Registers the plot and continues with its polygon.
 * @param {Object} data - Data of the registration form.
 */
const onRegister = (data) => {
  const ownerUserId = store.currentUserId;
  if (ownerUserId === null) return;
  store.registerPlot(
      { ownerUserId, name: data.name, region: data.region, declaredAreaHectares: data.declaredAreaHectares },
      {
        season: CropCampaign.seasonOf(data.sowingDate),
        cropType: data.cropType,
        seedVariety: data.seedVariety,
        sowingDate: data.sowingDate,
        expectedYield: data.expectedYield,
        yieldUnit: data.yieldUnit
      }
  ).then(plot => {
    if (plot) router.push({name: 'field-management-plot-boundary', params: {id: plot.id}});
  });
};

/** Goes back to the plot list. */
const onCancel = () => router.push({name: 'field-management-plots'});
</script>

<template>
  <div class="page registration">
    <pv-progress-bar v-if="store.loading" mode="indeterminate" style="height: 4px" :aria-label="t('common.loading')"/>
    <page-header
        :breadcrumbs="breadcrumbs"
        :title="t('field-management.plot-form.title', { slot: slotNumber, quota: store.plotQuota })"
        :subtitle="t('field-management.plot-form.subtitle')"/>
    <registration-steps :current="1"/>

    <!-- The plan has no free slots (US-22) -->
    <message-card v-if="!store.canRegisterPlot" icon="pi pi-verified" :message="t('field-management.plots.plan-full', { quota: store.plotQuota })" alert>
      <template #actions>
        <pv-button outlined :label="t('common.back')" @click="onCancel"/>
      </template>
    </message-card>
    <template v-else>
      <message-card v-if="store.error" icon="pi pi-times-circle" :message="t(store.error)" alert/>
      <pv-card class="sa-card">
        <template #content>
          <plot-registration-form :saving="store.loading" @submitted="onRegister" @cancel="onCancel"/>
        </template>
      </pv-card>
    </template>
  </div>
</template>

<style scoped>
.registration {
  max-width: 1040px;
}
</style>
