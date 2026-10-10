// Lazy-loaded components
const myPlotDashboard = () => import('./views/my-plot-dashboard.vue');
const registeredPlots = () => import('./views/registered-plots.vue');
const plotRegistration = () => import('./views/plot-registration.vue');
const plotBoundaryDelineation = () => import('./views/plot-boundary-delineation.vue');
const campaignFinances = () => import('./views/campaign-finances.vue');
const fieldExpense = () => import('./views/field-expense.vue');

/**
 * Routes of Field Management (under `/field-management`), same paths as the
 * Angular `field-management.routes.ts`. One route per expense type;
 * `meta.category` tells the form which one.
 */
const fieldManagementRoutes = [
    {   path: '',                               redirect: { name: 'field-management-dashboard' } },
    {   path: 'dashboard',                      name: 'field-management-dashboard',         component: myPlotDashboard,         meta: { title: 'routes.fm-dashboard' } },
    {   path: 'plots',                          name: 'field-management-plots',             component: registeredPlots,         meta: { title: 'routes.fm-plots' } },
    {   path: 'plots/new',                      name: 'field-management-plot-new',          component: plotRegistration,        meta: { title: 'routes.fm-plot-new' } },
    {   path: 'plots/:id/boundary',             name: 'field-management-plot-boundary',     component: plotBoundaryDelineation, meta: { title: 'routes.fm-plot-boundary' } },
    {   path: 'finances',                       name: 'field-management-finances',          component: campaignFinances,        meta: { title: 'routes.fm-finances' } },
    {   path: 'finances/expenses/new/inputs',   name: 'field-management-expense-inputs',    component: fieldExpense,            meta: { title: 'routes.fm-expense-inputs', category: 'INPUTS' } },
    {   path: 'finances/expenses/new/labor',    name: 'field-management-expense-labor',     component: fieldExpense,            meta: { title: 'routes.fm-expense-labor', category: 'LABOR' } },
    {   path: 'finances/expenses/new/freight',  name: 'field-management-expense-freight',   component: fieldExpense,            meta: { title: 'routes.fm-expense-freight', category: 'FREIGHT' } },
    {   path: 'finances/expenses/new',          redirect: { name: 'field-management-expense-inputs' } }
];

export default fieldManagementRoutes;
