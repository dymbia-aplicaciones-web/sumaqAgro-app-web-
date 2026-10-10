import {User, UserRole} from "../domain/model/user.entity.js";

/** Same key as the Angular `DemoSessionService`, so both apps read the same choice. */
const DEMO_SESSION_STORAGE_KEY = 'sumaq-agro-demo-user-id';

/**
 * Demo users of the Angular app. Their ids match the Fake API records
 * (`field-plots.ownerUserId`, `cooperatives.directorUserId`, `agronomist-assignments.userId`).
 * @type {User[]}
 */
export const DEMO_USERS = [
    new User({ id: 1, displayName: 'Guillermo', experience: UserRole.FARMER, initialRoute: '/field-management/dashboard' }),
    new User({ id: 3, displayName: 'Cristian Santana', experience: UserRole.COOPERATIVE_DIRECTOR, initialRoute: '/profiles/cooperative/dashboard' }),
    new User({ id: 4, displayName: 'Ing. Juan A. Morales', experience: UserRole.AGRONOMIST, initialRoute: '/crop-health/inbox' })
];

/**
 * Keeps the selected demo user in the browser storage (only its id, never a token).
 * Temporary mechanism until IAM replaces it with sign-in.
 *
 * @class DemoSessionStorage
 */
export class DemoSessionStorage {
    /**
     * @param {User} user - User to remember.
     */
    save(user) {
        localStorage.setItem(DEMO_SESSION_STORAGE_KEY, String(user.id));
    }

    /** @returns {User|null} User chosen in a previous visit. */
    restore() {
        const storedId = Number(localStorage.getItem(DEMO_SESSION_STORAGE_KEY));
        return DEMO_USERS.find(user => user.id === storedId) ?? null;
    }

    /** Forgets the stored user. */
    clear() {
        localStorage.removeItem(DEMO_SESSION_STORAGE_KEY);
    }
}
