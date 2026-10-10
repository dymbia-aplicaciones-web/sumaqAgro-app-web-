<script setup>
  import {useI18n} from "vue-i18n";
  const { locale, availableLocales, t } = useI18n();
</script>

<template>
  <pv-select-button v-model="locale" :options="availableLocales" :allow-empty="false" :aria-label="t('language.label')" class="language-switcher">
    <template #option="slotProps">
      <span v-tooltip.top="t(`language.${slotProps.option}`)" class="flex align-items-center gap-2">
        <i v-if="slotProps.option === locale" class="pi pi-globe" aria-hidden="true"/>
        {{ slotProps.option.toUpperCase() }}
      </span>
    </template>
  </pv-select-button>
</template>

<style scoped>
.language-switcher {
  display: flex;
  width: 100%;
  background: #0f1f0f;
}

.language-switcher :deep(.p-togglebutton) {
  flex: 1;
}
</style>
