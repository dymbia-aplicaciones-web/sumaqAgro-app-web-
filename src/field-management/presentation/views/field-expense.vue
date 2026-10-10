<script setup>
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import {useRoute, useRouter} from "vue-router";
import useFieldManagementStore from "../../application/field-management.store.js";
import {ExpenseCategory} from "../../domain/model/field-management.enums.js";
import {EXPENSE_CATEGORY_ICONS, EXPENSE_ROUTES} from "../expense-icons.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import MessageCard from "../../../shared/presentation/components/message-card.vue";
import FieldExpenseForm from "../components/field-expense-form.vue";

/**
 * Registers an expense of the active campaign (Angular `FieldExpenseView`).
 * Each tab is a route: `/finances/expenses/new/inputs | labor | freight`.
 */
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const store = useFieldManagementStore();

const category = computed(() => route.meta['category'] ?? ExpenseCategory.INPUTS);
const canRecord = computed(() => !!store.ledger && !store.ledger.isFrozen());
const tabs = Object.values(ExpenseCategory);
const breadcrumbs = [
  { label: 'option.my-plot', link: '/field-management/dashboard' },
  { label: 'option.expenses', link: '/field-management/finances' },
  { label: 'field-management.finances.register-expense' }
];

/**
 * Records the expense and goes back to the finances.
 * @param {Object} data - Expense data.
 */
const onRecord = (data) => {
  store.recordExpense(data).then(saved => {
    if (saved) router.push({name: 'field-management-finances'});
  });
};
</script>

<template>
  <div class="page expense-view">
    <pv-progress-bar v-if="store.loading" mode="indeterminate" style="height: 4px" :aria-label="t('common.loading')"/>
    <page-header :breadcrumbs="breadcrumbs" :title="t('field-management.expense-form.title')"
                 :subtitle="store.selectedPlot ? t('field-management.expense-form.subtitle', { plot: store.selectedPlot.name }) : ''"/>

    <message-card v-if="store.error" icon="pi pi-times-circle" :message="t(store.error)" alert/>

    <pv-card v-if="canRecord" class="sa-card overflow-hidden">
      <template #header>
        <nav class="tabs" :aria-label="t('field-management.expense-form.types')">
          <router-link v-for="tab in tabs" :key="tab" :to="{ name: EXPENSE_ROUTES[tab] }" class="tab" :class="{ 'tab--active': tab === category }">
            <i :class="EXPENSE_CATEGORY_ICONS[tab]" aria-hidden="true"/>
            {{ t(`field-management.expense-category.${tab}`) }}
          </router-link>
        </nav>
      </template>
      <template #content>
        <field-expense-form :key="category" :category="category" :saving="store.loading" @submitted="onRecord" @cancel="router.push({name: 'field-management-finances'})"/>
      </template>
    </pv-card>
    <message-card v-else-if="!store.loading" icon="pi pi-lock"
                  :message="t(store.ledger ? 'field-management.finances.ledger-closed' : 'field-management.finances.no-ledger')"/>
  </div>
</template>

<style scoped>
.expense-view {
  max-width: 880px;
}

.tabs {
  display: flex;
  overflow-x: auto;
  border-bottom: 1px solid var(--sa-outline-variant);
}

.tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  border-bottom: 2px solid transparent;
  color: var(--sa-on-surface-variant);
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
}

.tab--active {
  border-bottom-color: var(--sa-primary);
  color: var(--sa-primary);
}
</style>
