// Lazy-loaded components
const cropHealthMonitoring = () => import('./views/crop-health-monitoring.vue');
const agriculturalAlerts = () => import('./views/agricultural-alerts.vue');
const agriculturalAlertDetail = () => import('./views/agricultural-alert-detail.vue');
const agriculturalAlertTimeline = () => import('./views/agricultural-alert-timeline.vue');
const diagnosisInbox = () => import('./views/diagnosis-inbox.vue');
const fieldInspections = () => import('./views/field-inspections.vue');
const prescriptions = () => import('./views/prescriptions.vue');
const pestReportForm = () => import('./views/pest-report-form.vue');
const prescriptionForm = () => import('./views/prescription-form.vue');

/**
 * Routes of Crop Health (under `/crop-health`), same paths and role rules as
 * the Angular `crop-health.routes.ts` (`data.roles` → `meta.roles`).
 */
const cropHealthRoutes = [
    {   path: '',               redirect: { name: 'crop-health-monitoring' } },
    {   path: 'monitoring',     name: 'crop-health-monitoring',     component: cropHealthMonitoring,  meta: { title: 'routes.ch-monitoring' } },
    {   path: 'alerts',         name: 'crop-health-alerts',         component: agriculturalAlerts,    meta: { title: 'routes.ch-alerts' } },
    {   path: 'alerts/:alertId', name: 'crop-health-alert-detail',  component: agriculturalAlertDetail, meta: { title: 'routes.ch-alert-detail' } },
    {   path: 'alerts/:alertId/timeline', name: 'crop-health-alert-timeline', component: agriculturalAlertTimeline, meta: { title: 'routes.ch-alert-timeline' } },
    {   path: 'advisor',        name: 'crop-health-advisor',        component: diagnosisInbox,        meta: { title: 'routes.ch-advisor' } },
    {   path: 'inbox',          name: 'crop-health-inbox',          component: diagnosisInbox,        meta: { title: 'routes.ch-inbox' } },
    {   path: 'inspections',    name: 'crop-health-inspections',    component: fieldInspections,      meta: { title: 'routes.ch-inspections' } },
    {   path: 'prescriptions',  name: 'crop-health-prescriptions',  component: prescriptions,         meta: { title: 'routes.ch-prescriptions' } },
    {   path: 'report-pest',    name: 'crop-health-report-pest',    component: pestReportForm,        meta: { title: 'routes.ch-report-pest', roles: ['FARMER'] } },
    {   path: 'prescribe',      name: 'crop-health-prescribe',      component: prescriptionForm,      meta: { title: 'routes.ch-prescribe', roles: ['AGRONOMIST'] } }
];

export default cropHealthRoutes;
