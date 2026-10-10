const demoAccess = () => import('./views/demo-access.vue')

const iamRoutes = [
    { path: 'demo-access', name: 'iam-demo-access', component: demoAccess, meta: { title: 'routes.demo-access' } }
];

export default iamRoutes;
