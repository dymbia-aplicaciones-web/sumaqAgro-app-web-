// Lazy-loaded components
const farmerSettings = () => import('./views/farmer-settings.vue');
const cooperativeDashboard = () => import('./views/cooperative-dashboard.vue');
const cooperativeSettings = () => import('./views/cooperative-settings.vue');

/** Routes of Profiles (under `/profiles`), same paths as the Angular `profiles.routes.ts`. */
const profilesRoutes = [
    {   path: '',                       redirect: { name: 'profiles-cooperative-dashboard' } },
    {   path: 'settings',               name: 'profiles-settings',                  component: farmerSettings,       meta: { title: 'routes.pr-settings' } },
    {   path: 'cooperative/dashboard',  name: 'profiles-cooperative-dashboard',     component: cooperativeDashboard, meta: { title: 'routes.pr-cooperative-dashboard' } },
    {   path: 'cooperative/settings',   name: 'profiles-cooperative-settings',      component: cooperativeSettings,  meta: { title: 'routes.pr-cooperative-settings' } }
];

export default profilesRoutes;
