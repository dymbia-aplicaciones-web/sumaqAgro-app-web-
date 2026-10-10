<script setup>
import {useI18n} from "vue-i18n";

/**
 * Header of a page: breadcrumb, title and subtitle (Angular `PageHeader`).
 * The last breadcrumb is the current page. Content of the default slot
 * (for example a "View all" button) is shown at the right of the title.
 */
defineProps({
  /** @type {Array<{label: string, link?: string}>} Path from the start page; labels are i18n keys. */
  breadcrumbs: { type: Array, default: () => [] },
  /** Title, already translated. */
  title: { type: String, required: true },
  /** Text under the title, already translated. */
  subtitle: { type: String, default: '' },
  /** Smaller title, for pages with a long title. */
  compact: { type: Boolean, default: false },
  /** Small green text over the title (used by Crop Health). */
  eyebrow: { type: String, default: '' }
});

const { t } = useI18n();
</script>

<template>
  <header class="page-header">
    <div>
      <nav v-if="breadcrumbs.length > 0" class="breadcrumb" :aria-label="t('common.breadcrumb')">
        <template v-for="(crumb, index) in breadcrumbs" :key="crumb.label">
          <router-link v-if="crumb.link && index < breadcrumbs.length - 1" :to="crumb.link">{{ t(crumb.label) }}</router-link>
          <span v-else :class="{ current: index === breadcrumbs.length - 1 }" :aria-current="index === breadcrumbs.length - 1 ? 'page' : undefined">
            {{ t(crumb.label) }}
          </span>
          <i v-if="index < breadcrumbs.length - 1" class="pi pi-chevron-right" aria-hidden="true"/>
        </template>
      </nav>
      <span v-if="eyebrow" class="eyebrow">{{ eyebrow }}</span>
      <h1 :class="{ compact }">{{ title }}</h1>
      <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
    </div>
    <slot/>
  </header>
</template>

<style scoped>
.page-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.breadcrumb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  color: var(--sa-on-surface-variant);
  font-weight: 500;
}

.breadcrumb a {
  color: inherit;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.breadcrumb i {
  font-size: 0.75rem;
}

.breadcrumb .current,
.eyebrow {
  color: var(--sa-primary);
  font-weight: 500;
}

h1 {
  margin: 4px 0;
  font-size: 36px;
  line-height: 44px;
  font-weight: 700;
}

h1.compact {
  font-size: 30px;
  line-height: 38px;
}

.subtitle {
  margin: 0;
  color: var(--sa-on-surface-variant);
}

@media (max-width: 959.98px) {
  h1,
  h1.compact {
    font-size: 26px;
    line-height: 34px;
  }
}
</style>
