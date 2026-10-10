<script setup>
import {computed, onMounted, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {useToast} from "primevue";
import useProfilesStore from "../../application/profiles.store.js";
import useIamStore from "../../../iam/application/iam.store.js";
import useFieldManagementStore from "../../../field-management/application/field-management.store.js";
import {formatNumber} from "../../../shared/presentation/format.js";
import FarmerHelpManuals from "../components/farmer-help-manuals.vue";

/** Settings and help for the independent farmer. */
const { t, locale } = useI18n();
const toast = useToast();
const profilesStore = useProfilesStore();
const fieldStore = useFieldManagementStore();
const iamStore = useIamStore();

const activeTab = ref('plot');
const selectedPlotId = ref(null);
const plotForm = ref({ name: '', region: '' });
const contactForm = ref({ phoneNumber: '', email: '' });
const plotSubmitted = ref(false);
const contactSubmitted = ref(false);

const plotOptions = computed(() => fieldStore.plots.map(plot => ({ label: plot.name, value: plot.id })));
const selectedPlot = computed(() => fieldStore.getPlotById(selectedPlotId.value));
const activeCampaign = computed(() => selectedPlot.value
    ? fieldStore.getCurrentCampaignOf(selectedPlot.value.id)
    : null);
const cropDescription = computed(() => {
  const campaign = activeCampaign.value;
  if (!campaign) return t('common.no-data');
  const crop = t(`field-management.crop-type.${campaign.cropType}`);
  return campaign.seedVariety ? `${crop} (${campaign.seedVariety})` : crop;
});
const areaDescription = computed(() => selectedPlot.value
    ? `${formatNumber(selectedPlot.value.areaHectares, locale.value, 2)} ${t('field-management.plots.hectares')}`
    : '');
const supportPhone = computed(() => profilesStore.profile?.supportPhone?.trim() ?? '');

const plotNameInvalid = () => !plotForm.value.name.trim();
const regionInvalid = () => !plotForm.value.region.trim();
const phoneInvalid = () => contactForm.value.phoneNumber.trim().length < 7;
const emailInvalid = () => !/^\S+@\S+\.\S+$/.test(contactForm.value.email.trim());

onMounted(() => {
  if (iamStore.currentUserId !== null) profilesStore.loadFarmerProfile(iamStore.currentUserId);
});

watch(() => fieldStore.selectedPlot, plot => {
  if (plot) selectedPlotId.value = plot.id;
}, { immediate: true });

watch(selectedPlot, plot => {
  plotForm.value = plot ? { name: plot.name, region: plot.region } : { name: '', region: '' };
  plotSubmitted.value = false;
}, { immediate: true });

watch(() => profilesStore.profile, profile => {
  if (profile) contactForm.value = { phoneNumber: profile.phoneNumber, email: profile.email };
}, { immediate: true });

/** Keeps the global plot selection aligned with the plot being configured. */
const selectPlot = () => {
  if (selectedPlotId.value !== null) fieldStore.selectPlot(selectedPlotId.value);
};

/** Saves only descriptive plot data; crop and area come from campaign and GPS data. */
const savePlot = async () => {
  plotSubmitted.value = true;
  if (!selectedPlot.value || plotNameInvalid() || regionInvalid()) return;
  const saved = await fieldStore.updatePlotDetails(selectedPlot.value.id, { ...plotForm.value });
  if (saved) {
    plotSubmitted.value = false;
    toast.add({ severity: 'success', summary: t('profiles.settings.plot-saved'), life: 3000 });
  }
};

/** Saves the farmer's contact data. */
const saveContact = async () => {
  contactSubmitted.value = true;
  if (phoneInvalid() || emailInvalid()) return;
  const saved = await profilesStore.saveContact({ ...contactForm.value });
  if (saved) toast.add({ severity: 'success', summary: t('profiles.settings.saved'), life: 3000 });
};

const callSupport = () => {
  if (!supportPhone.value) {
    toast.add({ severity: 'info', summary: t('profiles.settings.support-unavailable'), life: 3500 });
    return;
  }
  window.location.href = `tel:${supportPhone.value.replace(/[^\d+]/g, '')}`;
};

/** Password change arrives with IAM. */
const passwordChangeUnavailable = () => {
  toast.add({ severity: 'info', summary: t('profiles.settings.password-unavailable'), life: 3500 });
};
</script>

<template>
  <div class="page settings-page">
    <pv-progress-bar v-if="fieldStore.loading || profilesStore.loading" mode="indeterminate" style="height: 4px" :aria-label="t('common.loading')"/>
    <header>
      <h1 class="m-0 settings-title">{{ t('profiles.settings.title') }}</h1>
      <p class="sa-muted mt-2 mb-0">{{ t('profiles.settings.subtitle') }}</p>
    </header>

    <nav class="settings-tabs" :aria-label="t('profiles.settings.title')">
      <button type="button" class="settings-tab" :class="{ active: activeTab === 'plot' }" :aria-current="activeTab === 'plot' ? 'page' : undefined" @click="activeTab = 'plot'">
        <i :class="activeTab === 'plot' ? 'pi pi-circle-fill' : 'pi pi-circle'" aria-hidden="true"/>
        {{ t('profiles.settings.plot-tab') }}
      </button>
      <button type="button" class="settings-tab" :class="{ active: activeTab === 'account' }" :aria-current="activeTab === 'account' ? 'page' : undefined" @click="activeTab = 'account'">
        <i :class="activeTab === 'account' ? 'pi pi-circle-fill' : 'pi pi-circle'" aria-hidden="true"/>
        {{ t('profiles.settings.account-tab') }}
      </button>
      <button type="button" class="settings-tab" :class="{ active: activeTab === 'help' }" :aria-current="activeTab === 'help' ? 'page' : undefined" @click="activeTab = 'help'">
        <i :class="activeTab === 'help' ? 'pi pi-circle-fill' : 'pi pi-circle'" aria-hidden="true"/>
        {{ t('profiles.settings.help-tab') }}
      </button>
    </nav>

    <pv-message v-if="fieldStore.error" severity="error" :closable="false">{{ t(fieldStore.error) }}</pv-message>
    <pv-message v-if="profilesStore.error" severity="error" :closable="false">{{ profilesStore.error }}</pv-message>

    <pv-card v-if="activeTab === 'plot' && !fieldStore.plotsLoading && !fieldStore.plots.length" class="settings-card">
      <template #content><p class="sa-muted m-0 empty-message">{{ t('profiles.settings.no-plots') }}</p></template>
    </pv-card>

    <pv-card v-else-if="activeTab === 'plot'" class="settings-card plot-card">
      <template #content>
        <form novalidate @submit.prevent="savePlot">
          <div v-if="fieldStore.plots.length > 1" class="sa-field plot-selector">
            <label for="settings-plot">{{ t('profiles.settings.select-plot') }}</label>
            <pv-select id="settings-plot" v-model="selectedPlotId" :options="plotOptions" option-label="label" option-value="value" fluid @change="selectPlot"/>
          </div>

          <div class="plot-grid">
            <div class="sa-field">
              <label for="plot-name">{{ t('profiles.settings.plot-name') }}</label>
              <pv-input-text id="plot-name" v-model="plotForm.name" :invalid="plotSubmitted && plotNameInvalid()" fluid/>
              <small v-if="plotSubmitted && plotNameInvalid()" class="sa-error">{{ t('profiles.settings.name-required') }}</small>
            </div>
            <div class="sa-field">
              <label for="primary-crop">{{ t('profiles.settings.primary-crop') }}</label>
              <pv-input-text id="primary-crop" :model-value="cropDescription" readonly fluid/>
            </div>
            <div class="sa-field">
              <label for="declared-area">{{ t('profiles.settings.declared-area') }}</label>
              <pv-input-text id="declared-area" :model-value="areaDescription" readonly fluid/>
            </div>
            <div class="sa-field">
              <label for="plot-location">{{ t('profiles.settings.location') }}</label>
              <pv-input-text id="plot-location" v-model="plotForm.region" :invalid="plotSubmitted && regionInvalid()" fluid/>
              <small v-if="plotSubmitted && regionInvalid()" class="sa-error">{{ t('profiles.settings.region-required') }}</small>
            </div>
            <div class="info-field">
              <span class="field-label">{{ t('profiles.settings.assigned-advisor') }}</span>
              <strong>{{ profilesStore.profile?.assignedAdvisorName || t('profiles.settings.no-advisor') }}</strong>
            </div>
            <div class="support-field">
              <span class="field-label">{{ t('profiles.settings.support-question') }}</span>
              <pv-button type="button" outlined icon="pi pi-phone" :label="t('profiles.settings.call-support')" @click="callSupport"/>
            </div>
          </div>

          <div class="card-actions">
            <pv-button type="submit" :loading="fieldStore.loading" :disabled="!selectedPlot" :label="t('profiles.settings.save-changes')"/>
          </div>
        </form>
      </template>
    </pv-card>

    <pv-card v-else-if="activeTab === 'account'" class="settings-card account-card">
      <template #content>
        <div class="account-grid">
          <section class="contact-section">
            <h2>{{ t('profiles.settings.contact-title') }}</h2>
            <form class="flex flex-column gap-3" novalidate @submit.prevent="saveContact">
              <div class="sa-field">
                <label for="phone">{{ t('profiles.settings.phone') }}</label>
                <pv-input-text id="phone" v-model="contactForm.phoneNumber" type="tel" :invalid="contactSubmitted && phoneInvalid()" fluid/>
                <small v-if="contactSubmitted && phoneInvalid()" class="sa-error">{{ t('profiles.settings.phone-error') }}</small>
              </div>
              <div class="sa-field">
                <label for="email">{{ t('profiles.settings.email') }}</label>
                <pv-input-text id="email" v-model="contactForm.email" type="email" :invalid="contactSubmitted && emailInvalid()" fluid/>
                <small v-if="contactSubmitted && emailInvalid()" class="sa-error">{{ t('profiles.settings.email-error') }}</small>
              </div>
              <div><pv-button type="submit" icon="pi pi-save" :loading="profilesStore.saving" :label="t('common.save')"/></div>
            </form>
          </section>

          <section class="flex flex-column gap-3 security-section">
            <h2>{{ t('profiles.settings.security-title') }}</h2>
            <div class="sa-field"><label>{{ t('profiles.settings.current-password') }}</label><pv-input-text type="password" model-value="not-implemented" disabled fluid/></div>
            <div class="sa-field"><label>{{ t('profiles.settings.new-password') }}</label><pv-input-text type="password" disabled fluid/></div>
            <div class="sa-field"><label>{{ t('profiles.settings.confirm-password') }}</label><pv-input-text type="password" disabled fluid/></div>
            <p class="sa-muted m-0">{{ t('profiles.settings.security-description') }}</p>
            <div class="flex justify-content-end"><pv-button outlined icon="pi pi-lock" :label="t('profiles.settings.change-password')" @click="passwordChangeUnavailable"/></div>
          </section>
        </div>
      </template>
    </pv-card>

    <pv-card v-else class="settings-card help-card">
      <template #content><farmer-help-manuals :support-phone="supportPhone"/></template>
    </pv-card>
  </div>
</template>

<style scoped>
.settings-page { max-width: 960px; }
.settings-title { font-size: clamp(2rem, 4vw, 2.5rem); font-weight: 700; }
.settings-tabs { display: flex; flex-wrap: wrap; gap: 24px; }
.settings-tab { display: inline-flex; align-items: center; gap: 12px; min-width: 190px; min-height: 44px; padding: 10px 16px; border: 1px solid var(--sa-tertiary); border-radius: 5px; background: transparent; color: var(--sa-on-tertiary-fixed-variant); cursor: pointer; }
.settings-tab.active { background: color-mix(in srgb, var(--sa-tertiary-fixed-dim) 18%, transparent); }
.settings-tab:disabled { cursor: not-allowed; opacity: .58; }
.settings-tab .pi { font-size: .9rem; }
.settings-card { overflow: hidden; border: 1px solid var(--sa-primary); border-radius: 24px; box-shadow: 0 2px 3px rgb(0 0 0 / 18%); }
.settings-card :deep(.p-card-body), .settings-card :deep(.p-card-content) { padding: 0; }
.empty-message { padding: 32px; }
.plot-card form { padding: 32px; }
.plot-selector { max-width: 360px; margin-bottom: 28px; }
.plot-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px 72px; }
.field-label { color: var(--sa-on-surface-variant); font-size: 14px; font-weight: 500; }
.info-field, .support-field { display: flex; flex-direction: column; align-items: flex-start; gap: 10px; }
.info-field strong { color: var(--sa-primary); font-weight: 500; }
.support-field :deep(.p-button) { min-width: 280px; }
.card-actions { margin-top: 32px; padding-top: 20px; border-top: 1px solid var(--sa-outline-variant); }
.card-actions :deep(.p-button) { min-width: 180px; }
.account-grid { display: grid; grid-template-columns: 1fr 1fr; }
.account-grid section { padding: 32px; }
.contact-section { border-right: 1px solid var(--sa-outline-variant); }
h2 { margin: 0 0 24px; font-size: 24px; }

@media (max-width: 720px) {
  .settings-tabs { gap: 10px; }
  .settings-tab { flex: 1 1 100%; }
  .plot-card form { padding: 24px; }
  .plot-grid, .account-grid { grid-template-columns: 1fr; }
  .plot-grid { gap: 22px; }
  .contact-section { border-right: 0; border-bottom: 1px solid var(--sa-outline-variant); }
  .account-grid section { padding: 24px; }
  .support-field :deep(.p-button) { min-width: 0; width: 100%; }
}
</style>
