/**
 * Cooperative managed by a director, with its institutional data.
 *
 * @class Cooperative
 */
export class Cooperative {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?number} [params.id=null] - Cooperative identifier.
     * @param {?number} [params.directorUserId=null] - Director.
     * @param {string} [params.legalName=''] - Legal name.
     * @param {string} [params.region=''] - Region.
     * @param {string} [params.institutionalEmail=''] - Contact email.
     * @param {string} [params.legalRepresentative=''] - Legal representative.
     * @param {string} [params.ruc=''] - Tax id (11 digits).
     * @param {string} [params.headquartersAddress=''] - Address.
     * @param {string} [params.switchboardPhone=''] - Phone.
     */
    constructor({ id = null, directorUserId = null, legalName = '', region = '', institutionalEmail = '',
                    legalRepresentative = '', ruc = '', headquartersAddress = '', switchboardPhone = '' }) {
        this.id = id;
        this.directorUserId = directorUserId;
        this.legalName = legalName;
        this.region = region;
        this.institutionalEmail = institutionalEmail;
        this.legalRepresentative = legalRepresentative;
        this.ruc = ruc;
        this.headquartersAddress = headquartersAddress;
        this.switchboardPhone = switchboardPhone;
    }

    /**
     * Updates the institutional data.
     * @param {Object} data - New data (every field is required).
     * @throws {Error} When a field is empty, the RUC has not 11 digits or the email is invalid.
     */
    updateInstitutionalData(data) {
        const values = Object.fromEntries(Object.entries(data).map(([key, value]) => [key, String(value).trim()]));
        if (Object.values(values).some(value => !value)) throw new Error('All institutional data is required.');
        if (!/^\d{11}$/.test(values.ruc)) throw new Error('The RUC must have eleven digits.');
        if (!/^\S+@\S+\.\S+$/.test(values.institutionalEmail)) throw new Error('The institutional email is invalid.');
        Object.assign(this, values, { institutionalEmail: values.institutionalEmail.toLowerCase() });
    }

    /** @returns {Cooperative} Copy used to try a change. */
    clone() {
        return new Cooperative({...this});
    }
}
