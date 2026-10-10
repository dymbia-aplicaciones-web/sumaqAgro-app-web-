<script setup>
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";

/** Shown when the active role cannot open a page (`meta.roles`). */
const { t } = useI18n();
const router = useRouter();
</script>

<template>
  <pv-card class="forbidden sa-card">
    <template #content>
      <i class="pi pi-lock forbidden__icon" aria-hidden="true"/>
      <h1>{{ t('forbidden.title') }}</h1>
      <p>{{ t('forbidden.message') }}</p>
    </template>
    <template #footer>
      <div class="flex justify-content-end">
        <pv-button icon="pi pi-home" :label="t('page-not-found.go-home')" @click="router.push('/')"/>
      </div>
    </template>
  </pv-card>
</template>

<style scoped>
.forbidden {
  max-width: 520px;
  margin: 48px auto;
  text-align: center;
}

.forbidden__icon {
  color: var(--sa-error);
  font-size: 4rem;
}

h1 {
  margin: 8px 0;
  font-size: 24px;
  font-weight: 400;
}

p {
  color: var(--sa-on-surface-variant);
}
</style>
