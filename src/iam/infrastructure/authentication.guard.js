import useIamStore from "../application/iam.store.js";

/**
 * Navigation guard of the demo access (Angular `crop-health.guard.ts`, extended to every private page).
 * - Anonymous users are sent to the demo access, keeping the requested page.
 * - Users whose role is not in `meta.roles` are sent to the forbidden page.
 * It is not security: the RESTful API must enforce authentication and authorization.
 *
 * @param {import('vue-router').RouteLocationNormalized} to - Target route.
 * @param {import('vue-router').RouteLocationNormalized} from - Current route.
 * @returns {{name: string}|boolean|undefined} - Returns true to allow navigation or an object to redirect.
 */
export const authenticationGuard = (to, from) => {
    const store = useIamStore();
    const isAnonymous = !store.isSignedIn;
    const publicRoutes = ['iam-demo-access', 'public-traceability'];
    const routeRequiresToBeAuthenticated = !publicRoutes.includes(String(to.name));
    if (isAnonymous && routeRequiresToBeAuthenticated) return { name: 'iam-demo-access', query: { redirect: to.fullPath } };
    const roles = to.meta['roles'];
    if (roles && !store.hasRole(...roles)) return { name: 'forbidden', query: { from: to.fullPath } };
    return true;
}
