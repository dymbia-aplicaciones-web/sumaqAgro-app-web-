/**
 * Agronomist assigned to a cooperative (`/agronomist-assignments`).
 * `userId` links the advisor to a demo user (Ing. Juan A. Morales is user 4).
 *
 * @class TechnicalAdvisor
 */
export class TechnicalAdvisor {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?number} [params.id=null] - Assignment identifier.
     * @param {?number} [params.cooperativeId=null] - Cooperative.
     * @param {?number} [params.userId=null] - Linked user.
     * @param {string} [params.name=''] - Name.
     * @param {string} [params.cipCode=''] - CIP registration.
     * @param {string} [params.phone=''] - Phone.
     * @param {number} [params.assignedPlotsCount=0] - Assigned plots.
     */
    constructor({ id = null, cooperativeId = null, userId = null, name = '', cipCode = '', phone = '', assignedPlotsCount = 0 }) {
        this.id = id;
        this.cooperativeId = cooperativeId;
        this.userId = userId;
        this.name = name;
        this.cipCode = cipCode;
        this.phone = phone;
        this.assignedPlotsCount = assignedPlotsCount;
    }

    /**
     * @param {{name: string, cipCode: string, phone: string, assignedPlotsCount: number}} details - New data.
     * @throws {Error} When the name or the CIP code are empty.
     */
    updateDetails({ name, cipCode, phone, assignedPlotsCount }) {
        if (!name || !name.trim()) throw new Error('El nombre del asesor es obligatorio.');
        if (!cipCode || !cipCode.trim()) throw new Error('La colegiatura CIP es obligatoria.');
        this.name = name.trim();
        this.cipCode = cipCode.trim();
        this.phone = phone ? phone.trim() : '';
        this.assignedPlotsCount = Math.max(0, assignedPlotsCount);
    }

    /** @returns {TechnicalAdvisor} Copy used to try a change. */
    clone() {
        return new TechnicalAdvisor({...this});
    }
}
