import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {DEMO_USERS, DemoSessionStorage} from "../infrastructure/demo-session.storage.js";

const demoSessionStorage = new DemoSessionStorage();

/**
 * Application service store for the IAM bounded context.
 * It keeps the selected demo user until IAM replaces this temporary mechanism
 * (Angular `DemoSessionService`). The session is restored when the page reloads.
 *
 * @returns {Object} Store state and actions.
 */
const useIamStore = defineStore('iam', () => {
    /** @type {import('vue').Ref<import('../domain/model/user.entity.js').User[]>} Demo users. */
    const users = ref(DEMO_USERS);
    /** @type {import('vue').Ref<import('../domain/model/user.entity.js').User|null>} Active user. */
    const currentUser = ref(demoSessionStorage.restore());
    /** @type {import('vue').ComputedRef<boolean>} `true` while a demo user is selected. */
    const isSignedIn = computed(() => currentUser.value !== null);
    /** @type {import('vue').ComputedRef<number|null>} Identifier of the active user. */
    const currentUserId = computed(() => currentUser.value?.id ?? null);
    /** @type {import('vue').ComputedRef<string|null>} Experience (role) of the active user. */
    const currentRole = computed(() => currentUser.value?.experience ?? null);

    /**
     * Starts (or switches) the demo session and opens the initial page of the user.
     * @param {number} userId - Demo user identifier.
     * @param {import('vue-router').Router} router - Router used to redirect.
     * @param {string} [redirect] - Page requested before the access.
     * @returns {void}
     */
    function selectUser(userId, router, redirect) {
        const user = users.value.find(candidate => candidate.id === userId);
        if (!user) throw new Error('Demo user not found.');
        currentUser.value = user;
        demoSessionStorage.save(user);
        const target = redirect && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : user.initialRoute;
        router.push(target);
    }

    /**
     * Ends the demo session and returns to the demo access.
     * @param {import('vue-router').Router} router - Router used to redirect.
     * @returns {void}
     */
    function signOut(router) {
        currentUser.value = null;
        demoSessionStorage.clear();
        router.push({name: 'iam-demo-access'});
    }

    /**
     * @param {...string} roles - Allowed roles.
     * @returns {boolean} `true` when the active user has one of them.
     */
    function hasRole(...roles) {
        return currentUser.value?.hasRole(...roles) ?? false;
    }

    return {
        users,
        currentUser,
        isSignedIn,
        currentUserId,
        currentRole,
        selectUser,
        signOut,
        hasRole
    };
});

export default useIamStore;
