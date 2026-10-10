<script setup>
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import useFieldManagementStore from "../../application/field-management.store.js";
import {ExpenseCategory} from "../../domain/model/field-management.enums.js";
import {EXPENSE_CATEGORY_ICONS, EXPENSE_ROUTES} from "../expense-icons.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import MessageCard from "../../../shared/presentation/components/message-card.vue";
import LedgerSummaryCards from "../components/ledger-summary-cards.vue";
import ExpenseList from "../components/expense-list.vue";
import BreakevenPanel from "../components/breakeven-panel.vue";

/** Cost ledger of the active campaign (Angular `CampaignFinancesView`, US-16 to US-19). */
const { t } = useI18n();
const router = useRouter();
const store = useFieldManagementStore();
const expenseMenu = ref();

const breadcrumbs = [
  { label: 'option.my-plot', link: '/field-management/dashboard' },
  { label: 'option.expenses' }
];

const expenseLinks = Object.values(ExpenseCategory).map(category => ({
  label: `field-management.expense-category.${category}`,
  icon: EXPENSE_CATEGORY_ICONS[category],
  command: () => router.push({name: EXPENSE_ROUTES[category]})
}));

const subtitle = computed(() => store.selectedPlot
    ? t('field-management.finances.subtitle', { plot: store.selectedPlot.name, season: store.activeCampaign?.season ?? '' })
    : '');
</script>

<template>
  <div class="page">
    <pv-progress-bar v-if="store.loading" mode="indeterminate" style="height: 4px" :aria-label="t('common.loading')"/>
    <page-header :breadcrumbs="breadcrumbs" :title="t('option.expenses')" :subtitle="subtitle">
      <template v-if="store.ledger && !store.ledger.isFrozen()">
        <pv-button class="sa-pill register" icon="pi pi-plus" :label="t('field-management.finances.register-expense')" aria-haspopup="true" @click="expenseMenu.toggle($event)"/>
        <pv-menu ref="expenseMenu" :model="expenseLinks" popup>
          <template #item="{ item, props }">
            <a v-bind="props.action"><i :class="item.icon"/><span>{{ t(item.label) }}</span></a>
          </template>
        </pv-menu>
      </template>
    </page-header>

    <message-card v-if="store.error" icon="pi pi-times-circle" :message="t(store.error)" alert/>

    <template v-if="store.ledger">
      <message-card v-if="store.ledger.isFrozen()" icon="pi pi-lock" :message="t('field-management.finances.ledger-closed')"/>
      <ledger-summary-cards :ledger="store.ledger"/>
      <div class="finances-grid">
        <expense-list :entries="store.ledger.entries"/>
        <breakeven-panel :ledger="store.ledger" :saving="store.loading" @expected-yield-change="store.setExpectedYield"/>
      </div>
    </template>
    <message-card v-else-if="!store.loading" icon="pi pi-receipt" :message="t('field-management.finances.no-ledger')">
      <template #actions>
        <pv-button :label="t('field-management.finances.select-plot')" @click="router.push('/field-management/plots')"/>
      </template>
    </message-card>
  </div>
</template>

<style scoped>
.register.p-button {
  height: 48px;
}

.finances-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(280px, 1fr);
  align-items: start;
  gap: 24px;
}

@media (max-width: 1024px) {
  .finances-grid {
    grid-template-columns: 1fr;
  }
}
</style>
