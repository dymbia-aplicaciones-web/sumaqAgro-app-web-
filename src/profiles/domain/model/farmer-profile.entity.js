/**
 * Contact data of a farmer (phone and email).
 *
 * @class FarmerProfile
 */
export class FarmerProfile {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?number} [params.id=null] - Profile identifier.
     * @param {?number} [params.userId=null] - Farmer.
     * @param {string} params.phoneNumber - Phone (at least 7 characters).
     * @param {string} params.email - Email address.
     * @param {string} [params.assignedAdvisorName=''] - Advisory engineer shown to the farmer.
     * @param {string} [params.supportPhone=''] - Platform support phone.
     */
    constructor({ id = null, userId = null, phoneNumber, email, assignedAdvisorName = '', supportPhone = '' }) {
        this.id = id;
        this.userId = userId;
        this.phoneNumber = FarmerProfile.#validatePhoneNumber(phoneNumber);
        this.email = FarmerProfile.#validateEmail(email);
        this.assignedAdvisorName = assignedAdvisorName;
        this.supportPhone = supportPhone;
    }

    /**
     * @param {string} phoneNumber - New phone.
     * @param {string} email - New email.
     * @throws {Error} When the data is invalid.
     */
    updateContact(phoneNumber, email) {
        this.phoneNumber = FarmerProfile.#validatePhoneNumber(phoneNumber);
        this.email = FarmerProfile.#validateEmail(email);
    }

    /** @returns {FarmerProfile} Copy used to try a change. */
    clone() {
        return new FarmerProfile({...this});
    }

    static #validatePhoneNumber(value) {
        const phoneNumber = value.trim();
        if (phoneNumber.length < 7) throw new Error('The phone number must have at least seven characters.');
        return phoneNumber;
    }

    static #validateEmail(value) {
        const email = value.trim().toLowerCase();
        if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('The email address is invalid.');
        return email;
    }
}
