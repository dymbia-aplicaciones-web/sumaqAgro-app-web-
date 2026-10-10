/**
 * Experiences (user segments) available while IAM is not implemented.
 * @readonly
 * @enum {string}
 */
export const UserRole = Object.freeze({
    FARMER: 'FARMER',
    COOPERATIVE_DIRECTOR: 'COOPERATIVE_DIRECTOR',
    AGRONOMIST: 'AGRONOMIST'
});

/**
 * User entity within the IAM bounded context.
 * While IAM is not implemented it is a demo user: there is no password and the
 * session is NOT a secure authentication.
 *
 * @class User
 */
export class User {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?number} [params.id=null] - User identifier (matches the Fake API records).
     * @param {string} [params.displayName=''] - Name shown in the shell.
     * @param {string} [params.experience=UserRole.FARMER] - User segment.
     * @param {string} [params.initialRoute='/'] - Page opened after choosing the user.
     */
    constructor({ id = null, displayName = '', experience = UserRole.FARMER, initialRoute = '/' }) {
        this.id = id;
        this.displayName = displayName;
        this.experience = experience;
        this.initialRoute = initialRoute;
    }

    /**
     * @param {...string} roles - Allowed roles.
     * @returns {boolean} `true` when the user has one of the roles.
     */
    hasRole(...roles) {
        return roles.includes(this.experience);
    }
}
