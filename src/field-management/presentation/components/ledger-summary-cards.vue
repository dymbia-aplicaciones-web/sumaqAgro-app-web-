<script setup>
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import {ExpenseCategory} from "../../domain/model/field-management.enums.js";
import {EXPENSE_CATEGORY_ICONS} from "../expense-icons.js";

/** Total invested and amount per category (Angular `LedgerSummaryCards`). */
const props = defineProps({
  ledger: { type: Object, required: true }
});
const { t } = useI18n();

const categories = computed(() => Object.values(ExpenseCategory).map(category => ({
  category,
  icon: EXPENSE_CATEGORY_ICONS[category],
  amount: props.ledger.totalByCategory(category),
  percentage: Math.round(props.ledger.percentageByCategory(category))
})));
</script>

<template>
  <section class="summary-grid" role="region" :aria-label="t('field-management.finances.summary')">
    <pv-card class="sa-dark-card">
      <template #content>
        <i class="pi pi-wallet text-3xl" aria-hidden="true"/>
        <p class="label">{{ t('field-management.finances.total-invested') }}</p>
        <p class="amount total">{{ ledger.totalInvestment().format() }}</p>
      </template>
    </pv-card>
    <pv-card v-for="item in categories" :key="item.category" class="sa-card">
      <template #content>
        <i :class="item.icon" class="text-3xl category-icon" aria-hidden="true"/>
        <p class="label">{{ t(`field-management.expense-category.${item.category}`) }}</p>
        <p class="amount">{{ item.amount.format() }}</p>
        <p class="sa-muted text-sm mt-1 mb-0">{{ t('field-management.finances.of-total', { percentage: item.percentage }) }}</p>
      </template>
    </pv-card>
  </section>
</template>

<style scoped>
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.category-icon {
  color: var(--sa-primary);
}

.label {
  margin: 8px 0 0;
  font-weight: 500;
}

.amount {
  margin: 4px 0 0;
  font-size: 24px;
  font-weight: 700;
}

.amount.total {
  color: var(--sa-tertiary-fixed-dim);
}
</style>
