<script setup>
import {useI18n} from "vue-i18n";
import {useRoute, useRouter} from "vue-router";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

/**
 * Navigates back to the start page of the app.
 */
const navigateToHome = () => {
  router.push('/');
};
</script>

<template>
  <pv-card class="not-found sa-card">
    <template #content>
      <i class="pi pi-map not-found__icon" aria-hidden="true"/>
      <h1>{{ t('page-not-found.title') }}</h1>
      <p>{{ t('page-not-found.message', { path: route.fullPath }) }}</p>
    </template>
    <template #footer>
      <div class="flex justify-content-end">
        <pv-button icon="pi pi-home" :label="t('page-not-found.go-home')" @click="navigateToHome"/>
      </div>
    </template>
  </pv-card>
</template>

<style scoped>
.not-found {
  max-width: 520px;
  margin: 48px auto;
  text-align: center;
}

.not-found__icon {
  color: var(--sa-primary);
  font-size: 4rem;
}

h1 {
  margin: 8px 0;
  font-size: 24px;
  font-weight: 400;
}

p {
  color: var(--sa-on-surface-variant);
  overflow-wrap: anywhere;
}
</style>
