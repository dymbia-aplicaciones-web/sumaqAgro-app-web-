/**
 * Member (partner farmer) of a cooperative with their plots.
 *
 * @class CooperativeMember
 */
export class CooperativeMember {
    /**
     * @param {Object} params - Entity attributes.
     * @param {?number} [params.id=null] - Member identifier.
     * @param {?number} [params.cooperativeId=null] - Cooperative.
     * @param {string} [params.fullName=''] - Full name.
     * @param {boolean} [params.active=true] - `false` for retired members.
     * @param {Array<Object>} [params.plots=[]] - Plots of the member (id, name, region, coordinates, campaignId, variety, cropType).
     */
    constructor({ id = null, cooperativeId = null, fullName = '', active = true, plots = [] }) {
        this.id = id;
        this.cooperativeId = cooperativeId;
        this.fullName = fullName;
        this.active = active;
        this.plots = plots;
    }
}
