<script setup>
import {useI18n} from "vue-i18n";
import {formatDate} from "../../../shared/presentation/format.js";
import {EXPENSE_CATEGORY_ICONS} from "../expense-icons.js";

/** Expenses of the ledger, newest first (Angular `ExpenseList`). */
defineProps({
  entries: { type: Array, required: true }
});
const { t, locale } = useI18n();
</script>

<template>
  <pv-card class="sa-card overflow-hidden">
    <template #title>{{ t('field-management.finances.expenses') }}</template>
    <template #content>
      <p v-if="entries.length === 0" class="sa-muted m-0">{{ t('field-management.finances.no-expenses') }}</p>
      <pv-data-table v-else :value="entries" data-key="id" scrollable table-style="min-width: 560px">
        <pv-column :header="t('field-management.finances.col-date')">
          <template #body="slotProps">{{ formatDate(slotProps.data.expenseDate, locale) }}</template>
        </pv-column>
        <pv-column :header="t('field-management.finances.col-category')">
          <template #body="slotProps">
            <span class="flex align-items-center gap-2">
              <i :class="EXPENSE_CATEGORY_ICONS[slotProps.data.category]" class="category-icon" aria-hidden="true"/>
              {{ t(`field-management.expense-category.${slotProps.data.category}`) }}
            </span>
          </template>
        </pv-column>
        <pv-column field="description" :header="t('field-management.finances.col-description')"/>
        <pv-column field="quantity" :header="t('field-management.finances.col-quantity')" body-class="text-right"/>
        <pv-column :header="t('field-management.finances.col-unit-price')" body-class="text-right">
          <template #body="slotProps">{{ slotProps.data.unitPrice.format() }}</template>
        </pv-column>
        <pv-column :header="t('field-management.finances.col-total')" body-class="text-right font-semibold">
          <template #body="slotProps">{{ slotProps.data.total().format() }}</template>
        </pv-column>
      </pv-data-table>
    </template>
  </pv-card>
</template>

<style scoped>
.category-icon {
  color: var(--sa-primary);
}
</style>
